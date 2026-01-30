/**
 * Computation Simulator - Wraps the shared CalibrationComputer class
 *
 * This file now uses the shared calibration-computation.js library instead of
 * duplicating the computation logic. This eliminates code duplication between
 * the simulator and the actual ESP3D-WEBUI implementation.
 */

class ComputationSimulator {
    constructor(initialGuess) {
        // Use the shared CalibrationComputer class
        this.computer = new CalibrationComputer(initialGuess, {
            acceptableThreshold: 0.5,
            maxIterations: 200000,
            maxStagnant: 1000
        });
    }

    /**
     * Process a chunk of measurement data
     * Returns updated anchor positions
     */
    async processDataChunk(measurements, progressCallback) {
        return await this.computer.processDataChunk(measurements, progressCallback);
    }

    /**
     * Get current status
     */
    getStatus() {
        return this.computer.getStatus();
    }
}
