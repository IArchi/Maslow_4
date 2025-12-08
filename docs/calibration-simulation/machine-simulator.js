/**
 * Machine Simulator - Mimics the ESP32 firmware's calibration process
 * This closely follows the logic in Calibration.cpp
 */

class MachineSimulator {
    constructor(config) {
        this.config = config;
        this.reset();
    }

    reset() {
        // True anchor positions (what the machine actually has)
        // Add realistic imperfections to simulate non-rectangular frame
        // Typical real-world variations: ±10-30mm from perfect rectangle
        const tlXOffset = (Math.random() - 0.5) * 40; // ±20mm
        const tlYOffset = (Math.random() - 0.5) * 40; // ±20mm
        const trXOffset = (Math.random() - 0.5) * 40; // ±20mm
        const trYOffset = (Math.random() - 0.5) * 40; // ±20mm
        const brXOffset = (Math.random() - 0.5) * 40; // ±20mm
        
        this.trueAnchors = {
            tl: { x: 0 + tlXOffset, y: this.config.frameHeight + tlYOffset, z: 100 },
            tr: { x: this.config.frameWidth + trXOffset, y: this.config.frameHeight + trYOffset, z: 56 },
            bl: { x: 0, y: 0, z: 34 },  // Keep bottom-left as reference point (0, 0)
            br: { x: this.config.frameWidth + brXOffset, y: 0, z: 78 }
        };

        // Initial guess (often incorrect, simulating what user enters as perfect rectangle)
        this.initialGuess = {
            tl: { x: 0, y: this.config.frameHeight * 1.1 },
            tr: { x: this.config.frameWidth * 1.1, y: this.config.frameHeight * 1.1 },
            bl: { x: 0, y: 0 },
            br: { x: this.config.frameWidth * 1.1, y: 0 }
        };

        this.calibrationGrid = [];
        this.pointCount = 0;
        this.waypoint = 0;
        this.recomputePoints = [];
        this.recomputeCount = 0;
        this.recomputeCountIndex = 0;
        this.calibrationData = [];
        this.measurementInProgress = true;
        this.state = 'IDLE';
    }

    /**
     * Generate calibration grid - matches logic from Calibration.cpp generate_calibration_grid()
     */
    generateCalibrationGrid() {
        const gridSize = this.config.gridSize === 0 ? this.autoSelectGridSize() : this.config.gridSize;
        
        let gridWidth, gridHeight;
        if (this.config.calibration_grid_width_mm_X === 0 || this.config.calibration_grid_height_mm_Y === 0) {
            // Auto-compute as half frame size (matching firmware logic)
            gridWidth = this.config.frameWidth * 0.5;
            gridHeight = this.config.frameHeight * 0.2;
        } else {
            gridWidth = this.config.calibration_grid_width_mm_X;
            gridHeight = this.config.calibration_grid_height_mm_Y;
        }

        const xSpacing = gridWidth / (gridSize - 1);
        const ySpacing = gridHeight / (gridSize - 1);

        const numberOfCycles = (gridSize - 1) / 2;

        // First 6 points are computed dynamically at runtime (small square around starting position)
        this.pointCount = 6;
        this.recomputePoints[0] = 5;

        // Center point
        this.calibrationGrid[this.pointCount] = { x: 0, y: 0 };
        this.pointCount++;

        let maxX = 1, maxY = 1;
        let currentX = 0, currentY = -1;
        this.recomputeCount = 1;

        // Generate spiral pattern
        while (maxX <= numberOfCycles) {
            // Move left
            while (currentX > -1 * maxX) {
                this.calibrationGrid[this.pointCount] = {
                    x: currentX * xSpacing,
                    y: currentY * ySpacing
                };
                this.pointCount++;
                currentX--;
            }
            // Move up
            while (currentY < maxY) {
                this.calibrationGrid[this.pointCount] = {
                    x: currentX * xSpacing,
                    y: currentY * ySpacing
                };
                this.pointCount++;
                currentY++;
            }
            // Move right
            while (currentX < maxX) {
                this.calibrationGrid[this.pointCount] = {
                    x: currentX * xSpacing,
                    y: currentY * ySpacing
                };
                this.pointCount++;
                currentX++;
            }
            // Move down
            while (currentY > -1 * maxY) {
                this.calibrationGrid[this.pointCount] = {
                    x: currentX * xSpacing,
                    y: currentY * ySpacing
                };
                this.pointCount++;
                currentY--;
            }

            // Last point of this cycle
            this.calibrationGrid[this.pointCount] = {
                x: currentX * xSpacing,
                y: currentY * ySpacing
            };
            this.pointCount++;

            this.recomputePoints[this.recomputeCount] = this.pointCount - 1;
            this.recomputeCount++;

            maxX++;
            maxY++;
            currentY--;
        }

        // Return to center
        this.calibrationGrid[this.pointCount] = { x: 0, y: (currentY + 1) * ySpacing };
        this.pointCount++;
        
        this.calibrationGrid[this.pointCount] = { x: 0, y: 0 };
        this.recomputePoints[this.recomputeCount] = this.pointCount;

        return { gridSize, pointCount: this.pointCount };
    }

    autoSelectGridSize() {
        const gridWidth = this.config.frameWidth * 0.5;
        const gridHeight = this.config.frameHeight * 0.2;
        const maxSpacing = this.config.calibrationMaxSpacingMm || 260.0;

        const availableGridSizes = [3, 5, 7, 9];
        
        for (let trySize of availableGridSizes) {
            const tryXSpacing = gridWidth / (trySize - 1);
            const tryYSpacing = gridHeight / (trySize - 1);
            const maxTrySpacing = Math.max(tryXSpacing, tryYSpacing);
            
            if (maxTrySpacing <= maxSpacing) {
                return trySize;
            }
        }
        
        return 9; // Default to largest
    }

    /**
     * Simulate taking a measurement at current waypoint
     * Adds random error based on config.measurementError
     */
    takeMeasurement(waypoint) {
        const point = this.calibrationGrid[waypoint];
        if (!point) return null;

        // Calculate true distances from point to each anchor
        const measurements = {
            tl: this.calculateDistance(point, this.trueAnchors.tl),
            tr: this.calculateDistance(point, this.trueAnchors.tr),
            bl: this.calculateDistance(point, this.trueAnchors.bl),
            br: this.calculateDistance(point, this.trueAnchors.br)
        };

        // Add measurement error
        const error = this.config.measurementError;
        measurements.tl += (Math.random() - 0.5) * 2 * error;
        measurements.tr += (Math.random() - 0.5) * 2 * error;
        measurements.bl += (Math.random() - 0.5) * 2 * error;
        measurements.br += (Math.random() - 0.5) * 2 * error;

        // Project to XY plane (matching measurementToXYPlane function)
        measurements.tl = this.measurementToXYPlane(measurements.tl, this.trueAnchors.tl.z);
        measurements.tr = this.measurementToXYPlane(measurements.tr, this.trueAnchors.tr.z);
        measurements.bl = this.measurementToXYPlane(measurements.bl, this.trueAnchors.bl.z);
        measurements.br = this.measurementToXYPlane(measurements.br, this.trueAnchors.br.z);

        return measurements;
    }

    calculateDistance(point, anchor) {
        const dx = point.x - (anchor.x - this.config.frameWidth / 2);
        const dy = point.y - (anchor.y - this.config.frameHeight / 2);
        const dz = anchor.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    measurementToXYPlane(measurement, zHeight) {
        // Include spoilboard and work thickness (matching Calibration.cpp logic)
        const totalZHeight = zHeight + (this.config.spoilboardThickness || 0) + (this.config.workThickness || 0);
        
        if (totalZHeight * totalZHeight >= measurement * measurement) {
            console.error(`Invalid geometry: belt length (${measurement.toFixed(2)}mm) too short for Z height (${totalZHeight.toFixed(2)}mm)`);
            return 0;
        }
        
        const lengthInXY = Math.sqrt(measurement * measurement - totalZHeight * totalZHeight);
        return lengthInXY + (this.config.beltEndExtension || 0) + (this.config.armLength || 0);
    }

    /**
     * Run one step of calibration
     * Returns object with measurement data if a chunk should be sent
     */
    async step() {
        if (this.waypoint === 0) {
            // Initialize first 6 points dynamically (small square pattern)
            // This matches the firmware behavior where first points are computed at runtime
            const startX = 0;
            const startY = 0;
            this.calibrationGrid[0] = { x: startX, y: startY };
            this.calibrationGrid[1] = { x: startX + 150, y: startY };
            this.calibrationGrid[2] = { x: startX + 150, y: startY + 150 };
            this.calibrationGrid[3] = { x: startX, y: startY + 150 };
            this.calibrationGrid[4] = { x: startX - 150, y: startY + 150 };
            this.calibrationGrid[5] = { x: startX - 150, y: startY };
        }

        // Simulate moving to waypoint (takes time in real machine)
        if (this.measurementInProgress) {
            // Take measurement
            const measurement = this.takeMeasurement(this.waypoint);
            this.calibrationData[this.waypoint] = measurement;
            
            this.measurementInProgress = false;
            this.waypoint++;

            // Check if we need to send data for computation
            if (this.waypoint > this.recomputePoints[this.recomputeCountIndex]) {
                // Send calibration data chunk
                const dataChunk = this.calibrationData.slice(0, this.waypoint);
                this.recomputeCountIndex++;
                
                return {
                    type: 'MEASUREMENT_CHUNK',
                    data: dataChunk,
                    waypoint: this.waypoint,
                    totalPoints: this.pointCount,
                    stage: this.recomputeCountIndex
                };
            }
        } else {
            // Moving to next point
            this.measurementInProgress = true;
        }

        // Check if calibration is complete
        if (this.waypoint > this.pointCount) {
            return {
                type: 'COMPLETE',
                message: 'Calibration complete'
            };
        }

        return null;
    }

    getStatus() {
        return {
            waypoint: this.waypoint,
            pointCount: this.pointCount,
            stage: this.recomputeCountIndex,
            state: this.state,
            grid: this.calibrationGrid.slice(0, this.pointCount + 1),
            trueAnchors: this.trueAnchors,
            initialGuess: this.initialGuess
        };
    }
}
