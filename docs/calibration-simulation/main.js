/**
 * Main Orchestration - Coordinates machine simulator, computation, and visualization
 */

let machine = null;
let computation = null;
let visualizer = null;
let isRunning = false;
let simulationInterval = null;

function log(message, type = 'info') {
    const logElement = document.getElementById('log');
    const timestamp = new Date().toLocaleTimeString();
    const colorMap = {
        info: '#d4d4d4',
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        data: '#2196F3'
    };
    
    const color = colorMap[type] || colorMap.info;
    logElement.innerHTML += `<span style="color: #888">[${timestamp}]</span> <span style="color: ${color}">${message}</span>\n`;
    logElement.scrollTop = logElement.scrollHeight;
}

function updateStatus(message, className) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = `Status: ${message}`;
    statusElement.className = `status ${className}`;
}

function updateStats(waypoint, totalPoints, stage, fitness) {
    document.getElementById('waypoint').textContent = waypoint || '0';
    document.getElementById('totalPoints').textContent = totalPoints || '0';
    document.getElementById('recomputeStage').textContent = stage || '0';
    document.getElementById('fitness').textContent = fitness ? fitness.toFixed(6) : '-';
}

async function startSimulation() {
    if (isRunning) return;
    
    // Get configuration from UI
    const config = {
        frameWidth: parseFloat(document.getElementById('frameWidth').value),
        frameHeight: parseFloat(document.getElementById('frameHeight').value),
        gridSize: parseInt(document.getElementById('gridSize').value),
        measurementError: parseFloat(document.getElementById('measurementError').value),
        simulationSpeed: parseFloat(document.getElementById('simulationSpeed').value),
        orientation: document.getElementById('orientation').value,
        calibration_grid_width_mm_X: 0, // Auto-compute
        calibration_grid_height_mm_Y: 0, // Auto-compute
        calibrationMaxSpacingMm: 260.0,
        spoilboardThickness: 0,
        workThickness: 0,
        beltEndExtension: 0,
        armLength: 0
    };
    
    // Validate inputs
    if (config.frameWidth < 500 || config.frameWidth > 5000 ||
        config.frameHeight < 500 || config.frameHeight > 5000) {
        updateStatus('Error: Frame dimensions must be between 500mm and 5000mm', 'idle');
        log('❌ Invalid frame dimensions. Please adjust settings.', 'error');
        return;
    }
    
    isRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    
    // Disable configuration inputs
    document.querySelectorAll('input, select').forEach(el => el.disabled = true);
    
    // Initialize
    visualizer = new Visualizer('machineCanvas', 'computationCanvas');
    visualizer.clearAll();
    
    machine = new MachineSimulator(config);
    
    log('=== Calibration Simulation Started ===', 'success');
    log(`Frame: ${config.frameWidth}mm x ${config.frameHeight}mm`);
    log(`Measurement Error: ±${config.measurementError}mm`);
    log(`Orientation: ${config.orientation}`);
    
    updateStatus('Generating calibration grid...', 'running');
    
    // Generate grid
    const gridInfo = machine.generateCalibrationGrid();
    log(`Generated ${gridInfo.gridSize}x${gridInfo.gridSize} grid with ${gridInfo.pointCount} points`, 'info');
    log(`Recompute stages: ${machine.recomputeCount}`, 'info');
    
    // Initialize computation with machine's initial guess
    computation = new ComputationSimulator(machine.initialGuess);
    
    updateStatus('Collecting measurements...', 'running');
    
    // Start simulation loop
    const delay = config.simulationSpeed === 0 ? 0 : (100 / config.simulationSpeed);
    runSimulationStep(delay);
}

async function runSimulationStep(delay) {
    if (!isRunning) return;
    
    const status = machine.getStatus();
    
    // Update visualization
    visualizer.drawMachineState(
        {
            frameWidth: machine.config.frameWidth,
            frameHeight: machine.config.frameHeight,
            grid: status.grid,
            trueAnchors: status.trueAnchors
        },
        status.waypoint
    );
    
    // Run one simulation step
    const result = await machine.step();
    
    if (result) {
        if (result.type === 'MEASUREMENT_CHUNK') {
            // Machine has collected measurements and is ready to send them
            log(`Waypoint ${result.waypoint}/${result.totalPoints} completed`, 'info');
            log(`Sending ${result.data.length} measurements for computation (Stage ${result.stage})`, 'data');
            
            updateStatus('Computing anchor positions...', 'computing');
            updateStats(result.waypoint, result.totalPoints, result.stage, null);
            
            // Simulate data transmission and computation
            const computedResult = await computation.processDataChunk(result.data);
            
            const compStatus = computation.getStatus();
            log(`Computation complete: Fitness = ${compStatus.bestFitness.toFixed(6)} (${compStatus.totalIterations} iterations)`, 'success');
            
            if (computedResult.fitness > computation.acceptableThreshold) {
                log('✓ Fitness acceptable, updating machine parameters', 'success');
            } else {
                log('⚠ Fitness below threshold, will retry with adjusted parameters', 'warning');
            }
            
            // Update visualization with computation results
            visualizer.drawComputationProgress(compStatus, computedResult);
            updateStats(result.waypoint, result.totalPoints, result.stage, compStatus.bestFitness);
            
            updateStatus('Collecting measurements...', 'running');
            
        } else if (result.type === 'COMPLETE') {
            log('=== Calibration Complete ===', 'success');
            
            const finalStatus = computation.getStatus();
            log(`Final Fitness: ${finalStatus.bestFitness.toFixed(6)}`, 'success');
            log('Final Anchor Positions:', 'success');
            
            const anchors = ['tl', 'tr', 'bl', 'br'];
            anchors.forEach(anchor => {
                const pos = finalStatus.bestGuess[anchor];
                log(`  ${anchor.toUpperCase()}: X=${pos.x.toFixed(1)}mm, Y=${pos.y.toFixed(1)}mm`, 'success');
            });
            
            // Compare with true positions
            log('Position Errors:', 'info');
            const trueAnchors = machine.trueAnchors;
            const centerX = machine.config.frameWidth / 2;
            const centerY = machine.config.frameHeight / 2;
            
            anchors.forEach(anchor => {
                const computed = finalStatus.bestGuess[anchor];
                const actual = {
                    x: trueAnchors[anchor].x - centerX,
                    y: trueAnchors[anchor].y - centerY
                };
                const errorX = Math.abs(computed.x - actual.x);
                const errorY = Math.abs(computed.y - actual.y);
                const errorTotal = Math.sqrt(errorX * errorX + errorY * errorY);
                log(`  ${anchor.toUpperCase()}: ΔX=${errorX.toFixed(2)}mm, ΔY=${errorY.toFixed(2)}mm, Total=${errorTotal.toFixed(2)}mm`, 'info');
            });
            
            updateStatus('Calibration Complete', 'complete');
            stopSimulation();
            return;
        }
    }
    
    // Continue simulation
    setTimeout(() => runSimulationStep(delay), delay);
}

function stopSimulation() {
    isRunning = false;
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    
    // Re-enable configuration inputs
    document.querySelectorAll('input, select').forEach(el => el.disabled = false);
    
    if (machine) {
        log('Simulation stopped', 'warning');
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    log('Calibration Simulator Ready', 'info');
    log('Configure settings and click "Start Calibration Simulation" to begin', 'info');
    updateStatus('Idle - Ready to Start', 'idle');
});
