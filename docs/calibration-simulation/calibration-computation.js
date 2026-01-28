/**
 * Calibration Computation Library
 * 
 * This is a shared library that contains the core calibration computation logic.
 * It is used by both:
 * - ESP3D-WEBUI (the actual web interface running on the machine)
 * - The calibration simulator (for testing and development)
 * 
 * This eliminates code duplication between the simulator and the actual implementation.
 * 
 * NOTE: This file should be kept in sync with the logic in 
 * ESP3D-WEBUI/www/js/calculatesCalibrationStuff.js
 */

/**
 * Computes the distance between two points.
 */
function distanceBetweenPoints(a, b, c, d) {
    const dx = c - a;
    const dy = d - b;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes the end point of a line based on its starting point, angle, and length.
 */
function getEndPoint(startX, startY, angle, length) {
    const endX = startX + length * Math.cos(angle);
    const endY = startY + length * Math.sin(angle);
    return { x: endX, y: endY };
}

/**
 * Computes how close all of the line end points are to each other.
 */
function computeEndpointFitness(line1, line2, line3, line4) {
    const a = distanceBetweenPoints(line1.xEnd, line1.yEnd, line2.xEnd, line2.yEnd);
    const b = distanceBetweenPoints(line1.xEnd, line1.yEnd, line3.xEnd, line3.yEnd);
    const c = distanceBetweenPoints(line1.xEnd, line1.yEnd, line4.xEnd, line4.yEnd);
    const d = distanceBetweenPoints(line2.xEnd, line2.yEnd, line3.xEnd, line3.yEnd);
    const e = distanceBetweenPoints(line2.xEnd, line2.yEnd, line4.xEnd, line4.yEnd);
    const f = distanceBetweenPoints(line3.xEnd, line3.yEnd, line4.xEnd, line4.yEnd);

    return (a + b + c + d + e + f) / 6;
}

/**
 * Computes the end point of a line based on its starting point, angle, and length.
 */
function computeLineEndPoint(line) {
    const end = getEndPoint(line.xBegin, line.yBegin, line.theta, line.length);
    line.xEnd = end.x;
    line.yEnd = end.y;
    return line;
}

/**
 * Walks the four lines, adjusting their endpoints to minimize the distance between them.
 */
function walkLines(tlLine, trLine, blLine, brLine, stepSize) {
    let changeMade = true;
    let bestFitness = computeEndpointFitness(tlLine, trLine, blLine, brLine);

    while (changeMade) {
        changeMade = false;
        const lines = [tlLine, trLine, blLine, brLine];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            for (let direction of [-1, 1]) {
                const newLine = computeLineEndPoint({
                    xBegin: line.xBegin,
                    yBegin: line.yBegin,
                    theta: line.theta + direction * stepSize,
                    length: line.length,
                });

                const newFitness = computeEndpointFitness(
                    i === 0 ? newLine : tlLine,
                    i === 1 ? newLine : trLine,
                    i === 2 ? newLine : blLine,
                    i === 3 ? newLine : brLine
                );

                if (newFitness < bestFitness) {
                    lines[i] = newLine;
                    bestFitness = newFitness;
                    changeMade = true;
                }
            }
        }

        tlLine = lines[0];
        trLine = lines[1];
        blLine = lines[2];
        brLine = lines[3];
    }

    return { tlLine, trLine, blLine, brLine, changeMade };
}

/**
 * Fitness function that uses "magnetically attracted lines" approach
 */
function magneticallyAttractedLinesFitness(measurement, individual) {
    // Initialize theta values if not present
    if (typeof measurement.tlTheta === 'undefined') {
        measurement.tlTheta = -0.3;
        measurement.trTheta = 3.5;
        measurement.blTheta = 0.5;
        measurement.brTheta = 2.6;
    }

    // Create lines from anchor points with measured lengths
    let tlLine = computeLineEndPoint({
        xBegin: individual.tl.x,
        yBegin: individual.tl.y,
        theta: measurement.tlTheta,
        length: measurement.tl
    });
    let trLine = computeLineEndPoint({
        xBegin: individual.tr.x,
        yBegin: individual.tr.y,
        theta: measurement.trTheta,
        length: measurement.tr
    });
    let blLine = computeLineEndPoint({
        xBegin: individual.bl.x,
        yBegin: individual.bl.y,
        theta: measurement.blTheta,
        length: measurement.bl
    });
    let brLine = computeLineEndPoint({
        xBegin: individual.br.x,
        yBegin: individual.br.y,
        theta: measurement.brTheta,
        length: measurement.br
    });

    // Walk the lines to minimize endpoint distances
    const walkedResult = walkLines(tlLine, trLine, blLine, brLine, 0.05);
    tlLine = walkedResult.tlLine;
    trLine = walkedResult.trLine;
    blLine = walkedResult.blLine;
    brLine = walkedResult.brLine;

    // Store updated theta values back in measurement
    measurement.tlTheta = tlLine.theta;
    measurement.trTheta = trLine.theta;
    measurement.blTheta = blLine.theta;
    measurement.brTheta = brLine.theta;

    const fitness = computeEndpointFitness(tlLine, trLine, blLine, brLine);

    return {
        fitness: fitness,
        lines: { tlLine, trLine, blLine, brLine }
    };
}

/**
 * Compute distance from center of mass for a line
 */
function computeDistanceFromCenterOfMass(lineToCompare, line2, line3, line4) {
    const centerX = (lineToCompare.xEnd + line2.xEnd + line3.xEnd + line4.xEnd) / 4;
    const centerY = (lineToCompare.yEnd + line2.yEnd + line3.yEnd + line4.yEnd) / 4;

    return distanceBetweenPoints(lineToCompare.xBegin, lineToCompare.yBegin, centerX, centerY);
}

/**
 * Generate tweaks for anchor positions
 */
function generateTweaks(lines) {
    const tweakAmount = 5;
    const tweaks = [];

    for (let tl = -1; tl <= 1; tl++) {
        for (let tr = -1; tr <= 1; tr++) {
            for (let bl = -1; bl <= 1; bl++) {
                for (let br = -1; br <= 1; br++) {
                    tweaks.push({ tl, tr, bl, br });
                }
            }
        }
    }

    return tweaks;
}

/**
 * Compute furthest anchor from center of mass
 */
function computeFurthestFromCenterOfMass(allLines, lastGuess) {
    const tweaks = generateTweaks(allLines);
    let bestGuess = JSON.parse(JSON.stringify(lastGuess));
    let bestFitnessSum = Infinity;

    tweaks.forEach(tweak => {
        const guess = {
            tl: { x: lastGuess.tl.x + tweak.tl, y: lastGuess.tl.y + tweak.tl },
            tr: { x: lastGuess.tr.x + tweak.tr, y: lastGuess.tr.y + tweak.tr },
            bl: { x: lastGuess.bl.x + tweak.bl, y: lastGuess.bl.y + tweak.bl },
            br: { x: lastGuess.br.x + tweak.br, y: lastGuess.br.y + tweak.br }
        };

        let fitnessSum = 0;
        allLines.forEach(lines => {
            const tlDistance = computeDistanceFromCenterOfMass(lines.tlLine, lines.trLine, lines.blLine, lines.brLine);
            const trDistance = computeDistanceFromCenterOfMass(lines.trLine, lines.tlLine, lines.blLine, lines.brLine);
            const blDistance = computeDistanceFromCenterOfMass(lines.blLine, lines.tlLine, lines.trLine, lines.brLine);
            const brDistance = computeDistanceFromCenterOfMass(lines.brLine, lines.tlLine, lines.trLine, lines.blLine);

            fitnessSum += tlDistance + trDistance + blDistance + brDistance;
        });

        if (fitnessSum < bestFitnessSum) {
            bestFitnessSum = fitnessSum;
            bestGuess = guess;
        }
    });

    return bestGuess;
}

/**
 * Compute overall fitness for a set of measurements
 */
function computeLinesFitness(measurements, lastGuess, skipThetaUpdates = false) {
    const fitnesses = [];
    const allLines = [];

    measurements.forEach(measurement => {
        const result = magneticallyAttractedLinesFitness(measurement, lastGuess);
        fitnesses.push(result.fitness);
        allLines.push(result.lines);
    });

    const avgFitness = fitnesses.reduce((a, b) => a + Math.abs(b), 0) / fitnesses.length;

    const updatedGuess = computeFurthestFromCenterOfMass(allLines, lastGuess);
    updatedGuess.fitness = avgFitness;

    return updatedGuess;
}

/**
 * CalibrationComputer class - Manages the calibration computation process
 */
class CalibrationComputer {
    constructor(initialGuess, config = {}) {
        this.initialGuess = {
            tl: { ...initialGuess.tl },
            tr: { ...initialGuess.tr },
            bl: { ...initialGuess.bl },
            br: { ...initialGuess.br },
            fitness: 100000000
        };
        this.currentGuess = null;
        this.bestGuess = null;
        this.totalIterations = 0;
        this.stagnantCounter = 0;
        this.acceptableThreshold = config.acceptableThreshold || 0.5;
        this.maxIterations = config.maxIterations || 200000;
        this.maxStagnant = config.maxStagnant || 1000;
    }

    /**
     * Process a chunk of measurement data
     */
    async processDataChunk(measurements, progressCallback) {
        // Initialize from initial guess if first computation
        if (!this.currentGuess) {
            this.currentGuess = JSON.parse(JSON.stringify(this.initialGuess));
            this.bestGuess = JSON.parse(JSON.stringify(this.initialGuess));
        }

        this.stagnantCounter = 0;
        this.totalIterations = 0;

        // Run optimization
        const result = await this.optimize(measurements, progressCallback);

        // Update initial guess for next stage
        if (1 / result.fitness > this.acceptableThreshold) {
            this.initialGuess = JSON.parse(JSON.stringify(result));
        }

        return result;
    }

    /**
     * Run the optimization algorithm
     */
    async optimize(measurements, progressCallback) {
        while (this.stagnantCounter < this.maxStagnant && this.totalIterations < this.maxIterations) {
            this.currentGuess = computeLinesFitness(measurements, this.currentGuess);

            if (1 / this.currentGuess.fitness > 1 / this.bestGuess.fitness) {
                this.bestGuess = JSON.parse(JSON.stringify(this.currentGuess));
                this.stagnantCounter = 0;
            } else {
                this.stagnantCounter++;
            }

            this.totalIterations++;

            // Yield periodically to prevent blocking and update progress
            if (this.totalIterations % 50 === 0) {
                if (progressCallback) {
                    progressCallback(this.totalIterations, 1 / this.bestGuess.fitness);
                }
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return this.bestGuess;
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            bestGuess: this.bestGuess,
            bestFitness: this.bestGuess ? 1 / this.bestGuess.fitness : 0,
            totalIterations: this.totalIterations,
            stagnantCounter: this.stagnantCounter
        };
    }
}

// Export for use in other modules (works in both browser and Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CalibrationComputer,
        computeLinesFitness,
        magneticallyAttractedLinesFitness,
        computeFurthestFromCenterOfMass,
        distanceBetweenPoints,
        getEndPoint,
        computeEndpointFitness,
        computeLineEndPoint,
        walkLines,
        computeDistanceFromCenterOfMass,
        generateTweaks
    };
}
