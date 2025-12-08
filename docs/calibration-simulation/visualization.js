/**
 * Visualization Module - Renders the machine state and computation progress
 */

class Visualizer {
    constructor(machineCanvasId, computationCanvasId) {
        this.machineCanvas = document.getElementById(machineCanvasId);
        this.computationCanvas = document.getElementById(computationCanvasId);
        this.machineCtx = this.machineCanvas.getContext('2d');
        this.computationCtx = this.computationCanvas.getContext('2d');
        
        this.fitnessHistory = [];
        this.maxHistoryLength = 100;
    }

    drawMachineState(state, currentWaypoint) {
        const ctx = this.machineCtx;
        const canvas = this.machineCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up coordinate system
        const margin = 50;
        const scale = Math.min(
            (canvas.width - 2 * margin) / state.frameWidth,
            (canvas.height - 2 * margin) / state.frameHeight
        );
        
        ctx.save();
        ctx.translate(margin, canvas.height - margin);
        ctx.scale(scale, -scale);
        
        // Draw frame as actual quadrilateral connecting the anchor points
        // This shows the true (non-rectangular) frame shape
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        // Draw from actual anchor positions (centered coordinates)
        const tlX = state.trueAnchors.tl.x - state.frameWidth/2;
        const tlY = state.trueAnchors.tl.y - state.frameHeight/2;
        const trX = state.trueAnchors.tr.x - state.frameWidth/2;
        const trY = state.trueAnchors.tr.y - state.frameHeight/2;
        const blX = state.trueAnchors.bl.x - state.frameWidth/2;
        const blY = state.trueAnchors.bl.y - state.frameHeight/2;
        const brX = state.trueAnchors.br.x - state.frameWidth/2;
        const brY = state.trueAnchors.br.y - state.frameHeight/2;
        
        ctx.moveTo(tlX, tlY);
        ctx.lineTo(trX, trY);
        ctx.lineTo(brX, brY);
        ctx.lineTo(blX, blY);
        ctx.closePath();
        ctx.stroke();
        
        // Also draw a reference rectangle (dashed) to show ideal shape
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([5 / scale, 5 / scale]);
        ctx.strokeRect(0, 0, state.frameWidth, state.frameHeight);
        ctx.setLineDash([]);
        
        // Draw true anchor points (green)
        ctx.fillStyle = '#4CAF50';
        const anchors = [
            { anchor: state.trueAnchors.tl, x: state.trueAnchors.tl.x - state.frameWidth/2, y: state.trueAnchors.tl.y - state.frameHeight/2, label: 'TL' },
            { anchor: state.trueAnchors.tr, x: state.trueAnchors.tr.x - state.frameWidth/2, y: state.trueAnchors.tr.y - state.frameHeight/2, label: 'TR' },
            { anchor: state.trueAnchors.bl, x: state.trueAnchors.bl.x - state.frameWidth/2, y: state.trueAnchors.bl.y - state.frameHeight/2, label: 'BL' },
            { anchor: state.trueAnchors.br, x: state.trueAnchors.br.x - state.frameWidth/2, y: state.trueAnchors.br.y - state.frameHeight/2, label: 'BR' }
        ];
        anchors.forEach(a => this.drawAnchor(ctx, a.x, a.y, 8 / scale, a.label));
        
        // Draw calibration grid points
        if (state.grid && state.grid.length > 0) {
            state.grid.forEach((point, index) => {
                if (index < currentWaypoint) {
                    // Measured points (blue)
                    ctx.fillStyle = '#2196F3';
                } else if (index === currentWaypoint) {
                    // Current point (red)
                    ctx.fillStyle = '#f44336';
                } else {
                    // Unmeasured points (gray)
                    ctx.fillStyle = '#ccc';
                }
                
                ctx.beginPath();
                ctx.arc(
                    point.x + state.frameWidth / 2,
                    point.y + state.frameHeight / 2,
                    4 / scale,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
            
            // Draw path between measured points
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 1 / scale;
            ctx.beginPath();
            for (let i = 0; i < Math.min(currentWaypoint, state.grid.length); i++) {
                const point = state.grid[i];
                if (i === 0) {
                    ctx.moveTo(point.x + state.frameWidth / 2, point.y + state.frameHeight / 2);
                } else {
                    ctx.lineTo(point.x + state.frameWidth / 2, point.y + state.frameHeight / 2);
                }
            }
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Draw legend
        this.drawLegend(ctx, canvas);
    }
    
    drawAnchor(ctx, x, y, size, label) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw label (need to flip text back)
        ctx.save();
        ctx.scale(1, -1);
        ctx.fillStyle = '#000';
        ctx.font = `${size * 2}px Arial`;
        ctx.fillText(label, x + size * 1.5, -y + size / 2);
        ctx.restore();
    }
    
    drawLegend(ctx, canvas) {
        const legendX = 10;
        const legendY = 20;
        const lineHeight = 20;
        
        ctx.font = '12px Arial';
        
        const items = [
            { color: '#4CAF50', text: 'True Anchors' },
            { color: '#f44336', text: 'Current Waypoint' },
            { color: '#2196F3', text: 'Measured Points' },
            { color: '#ccc', text: 'Unmeasured Points' },
            { type: 'line', color: '#333', text: 'Actual Frame', dashed: false },
            { type: 'line', color: '#ccc', text: 'Ideal Rectangle', dashed: true }
        ];
        
        items.forEach((item, index) => {
            if (item.type === 'line') {
                ctx.strokeStyle = item.color;
                ctx.lineWidth = 2;
                if (item.dashed) {
                    ctx.setLineDash([3, 3]);
                }
                ctx.beginPath();
                ctx.moveTo(legendX, legendY + index * lineHeight + 5);
                ctx.lineTo(legendX + 10, legendY + index * lineHeight + 5);
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                ctx.fillStyle = item.color;
                ctx.fillRect(legendX, legendY + index * lineHeight, 10, 10);
            }
            ctx.fillStyle = '#000';
            ctx.fillText(item.text, legendX + 15, legendY + index * lineHeight + 10);
        });
    }
    
    drawComputationProgress(computationState, currentGuess) {
        const ctx = this.computationCtx;
        const canvas = this.computationCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!currentGuess) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.fillText('Waiting for first computation...', 20, canvas.height / 2);
            return;
        }
        
        // Update fitness history
        if (computationState.bestFitness) {
            this.fitnessHistory.push(computationState.bestFitness);
            if (this.fitnessHistory.length > this.maxHistoryLength) {
                this.fitnessHistory.shift();
            }
        }
        
        // Draw fitness graph
        const graphHeight = canvas.height * 0.4;
        const graphY = 20;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, graphY, canvas.width, graphHeight);
        
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('Fitness Over Time', 10, graphY - 5);
        
        if (this.fitnessHistory.length > 1) {
            const maxFitness = Math.max(...this.fitnessHistory, 1);
            const xScale = canvas.width / this.maxHistoryLength;
            const yScale = graphHeight / maxFitness;
            
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            this.fitnessHistory.forEach((fitness, index) => {
                const x = index * xScale;
                const y = graphY + graphHeight - fitness * yScale;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw current fitness value
            ctx.fillStyle = '#2196F3';
            ctx.font = '12px Arial';
            ctx.fillText(
                `Current: ${computationState.bestFitness.toFixed(6)}`,
                canvas.width - 150,
                graphY + 15
            );
        }
        
        // Draw anchor comparison
        const compY = graphY + graphHeight + 40;
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('Computed Anchor Positions', 10, compY);
        
        const anchors = ['tl', 'tr', 'bl', 'br'];
        const anchorY = compY + 20;
        const lineHeight = 40;
        
        ctx.font = '12px Arial';
        anchors.forEach((anchor, index) => {
            const y = anchorY + index * lineHeight;
            const guess = currentGuess[anchor];
            
            ctx.fillStyle = '#333';
            ctx.fillText(`${anchor.toUpperCase()}:`, 10, y);
            ctx.fillText(`X: ${guess.x.toFixed(1)}mm`, 50, y);
            ctx.fillText(`Y: ${guess.y.toFixed(1)}mm`, 180, y);
        });
        
        // Draw iteration count
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText(
            `Iterations: ${computationState.totalIterations}`,
            10,
            canvas.height - 30
        );
        ctx.fillText(
            `Stagnant: ${computationState.stagnantCounter}`,
            10,
            canvas.height - 10
        );
    }
    
    clearAll() {
        this.machineCtx.clearRect(0, 0, this.machineCanvas.width, this.machineCanvas.height);
        this.computationCtx.clearRect(0, 0, this.computationCanvas.width, this.computationCanvas.height);
        this.fitnessHistory = [];
    }
}
