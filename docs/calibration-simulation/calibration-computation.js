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

    return { tlLine, trLine, blLine, brLine };
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

    // Walk the lines with decreasing step sizes for progressive refinement
    const stepSizes = [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001, 0.0000001, 0.00000001];
    for (const stepSize of stepSizes) {
        const walked = walkLines(tlLine, trLine, blLine, brLine, stepSize);
        tlLine = walked.tlLine;
        trLine = walked.trLine;
        blLine = walked.blLine;
        brLine = walked.brLine;
    }

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
    // Compute the center of mass from the OTHER three lines (not including lineToCompare)
    const centerX = (line2.xEnd + line3.xEnd + line4.xEnd) / 3;
    const centerY = (line2.yEnd + line3.yEnd + line4.yEnd) / 3;

    // Return the distance vector from lineToCompare's endpoint to the center
    return {
        x: lineToCompare.xEnd - centerX,
        y: lineToCompare.yEnd - centerY
    };
}

/**
 * Generate tweaks for anchor positions based on distances from center of mass
 */
function generateTweaks(lines) {
    return {
        tlX: computeDistanceFromCenterOfMass(lines.tlLine, lines.trLine, lines.blLine, lines.brLine).x,
        tlY: computeDistanceFromCenterOfMass(lines.tlLine, lines.trLine, lines.blLine, lines.brLine).y,
        trX: computeDistanceFromCenterOfMass(lines.trLine, lines.tlLine, lines.blLine, lines.brLine).x,
        trY: computeDistanceFromCenterOfMass(lines.trLine, lines.tlLine, lines.blLine, lines.brLine).y,
        brX: computeDistanceFromCenterOfMass(lines.brLine, lines.tlLine, lines.trLine, lines.blLine).x
    };
}

/**
 * Compute furthest anchor from center of mass
 */
function computeFurthestFromCenterOfMass(allLines, lastGuess) {
    let tlX = 0, tlY = 0, trX = 0, trY = 0, brX = 0;

    // Accumulate tweaks from all lines
    allLines.forEach(lines => {
        const tweaks = generateTweaks(lines);
        tlX += tweaks.tlX;
        tlY += tweaks.tlY;
        trX += tweaks.trX;
        trY += tweaks.trY;
        brX += tweaks.brX;
    });

    // Average the tweaks
    const n = allLines.length;
    tlX /= n;
    tlY /= n;
    trX /= n;
    trY /= n;
    brX /= n;

    // Find the largest error
    const maxError = Math.max(
        Math.abs(tlX),
        Math.abs(tlY),
        Math.abs(trX),
        Math.abs(trY),
        Math.abs(brX)
    );

    // Apply the largest error as a correction
    const newGuess = JSON.parse(JSON.stringify(lastGuess));
    const scalor = -1;  // Move in opposite direction of error

    if (Math.abs(tlX) === maxError) {
        newGuess.tl.x += tlX * scalor;
    } else if (Math.abs(tlY) === maxError) {
        newGuess.tl.y += tlY * scalor;
    } else if (Math.abs(trX) === maxError) {
        newGuess.tr.x += trX * scalor;
    } else if (Math.abs(trY) === maxError) {
        newGuess.tr.y += trY * scalor;
    } else if (Math.abs(brX) === maxError) {
        newGuess.br.x += brX * scalor;
    }

    return newGuess;
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
