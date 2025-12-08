/**
 * Computation Simulator - Mimics the browser-side calibration computation
 * This is based on calculatesCalibrationStuff.js from ESP3D-WEBUI
 */

class ComputationSimulator {
    constructor(initialGuess) {
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
        this.acceptableThreshold = 0.5;
    }

    /**
     * Process a chunk of measurement data
     * Returns updated anchor positions
     */
    async processDataChunk(measurements) {
        // Initialize from initial guess if first computation
        if (!this.currentGuess) {
            this.currentGuess = JSON.parse(JSON.stringify(this.initialGuess));
            this.bestGuess = JSON.parse(JSON.stringify(this.initialGuess));
        }

        this.stagnantCounter = 0;
        this.totalIterations = 0;

        // Run optimization
        const result = await this.optimize(measurements);

        // Update initial guess for next stage
        if (result.fitness > this.acceptableThreshold) {
            this.initialGuess = JSON.parse(JSON.stringify(result));
        }

        return result;
    }

    async optimize(measurements) {
        const maxIterations = 200000;
        const maxStagnant = 1000;

        while (this.stagnantCounter < maxStagnant && this.totalIterations < maxIterations) {
            this.currentGuess = this.computeLinesFitness(measurements, this.currentGuess);

            if (1 / this.currentGuess.fitness > 1 / this.bestGuess.fitness) {
                this.bestGuess = JSON.parse(JSON.stringify(this.currentGuess));
                this.stagnantCounter = 0;
            } else {
                this.stagnantCounter++;
            }

            this.totalIterations++;

            // Yield periodically to prevent blocking
            if (this.totalIterations % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return this.bestGuess;
    }

    computeLinesFitness(measurements, guess) {
        const fitnesses = [];
        const allLines = [];

        measurements.forEach(measurement => {
            const { fitness, lines } = this.magneticallyAttractedLinesFitness(measurement, guess);
            fitnesses.push(fitness);
            allLines.push(lines);
        });

        const avgFitness = fitnesses.reduce((a, b) => a + Math.abs(b), 0) / fitnesses.length;
        
        const updatedGuess = this.computeFurthestFromCenterOfMass(allLines, guess);
        updatedGuess.fitness = avgFitness;

        return updatedGuess;
    }

    magneticallyAttractedLinesFitness(measurement, individual) {
        // Initialize theta values if not present
        if (typeof measurement.tlTheta === 'undefined') {
            measurement.tlTheta = -0.3;
            measurement.trTheta = 3.5;
            measurement.blTheta = 0.5;
            measurement.brTheta = 2.6;
        }

        // Define four lines
        let tlLine = this.computeLineEndPoint(individual.tl.x, individual.tl.y, measurement.tlTheta, measurement.tl);
        let trLine = this.computeLineEndPoint(individual.tr.x, individual.tr.y, measurement.trTheta, measurement.tr);
        let blLine = this.computeLineEndPoint(individual.bl.x, individual.bl.y, measurement.blTheta, measurement.bl);
        let brLine = this.computeLineEndPoint(individual.br.x, individual.br.y, measurement.brTheta, measurement.br);

        // Walk lines with decreasing step sizes
        const stepSizes = [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001, 0.0000001, 0.00000001];
        for (const stepSize of stepSizes) {
            const walked = this.walkLines(tlLine, trLine, blLine, brLine, stepSize);
            tlLine = walked.tlLine;
            trLine = walked.trLine;
            blLine = walked.blLine;
            brLine = walked.brLine;
        }

        // Update theta values for next iteration
        measurement.tlTheta = tlLine.theta;
        measurement.trTheta = trLine.theta;
        measurement.blTheta = blLine.theta;
        measurement.brTheta = brLine.theta;

        const finalFitness = this.computeEndpointFitness(tlLine, trLine, blLine, brLine);

        return {
            fitness: finalFitness,
            lines: { tlLine, trLine, blLine, brLine }
        };
    }

    walkLines(tlLine, trLine, blLine, brLine, stepSize) {
        let changeMade = true;
        let bestFitness = this.computeEndpointFitness(tlLine, trLine, blLine, brLine);

        while (changeMade) {
            changeMade = false;
            const lines = [tlLine, trLine, blLine, brLine];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                for (const direction of [-1, 1]) {
                    const newLine = this.computeLineEndPoint(
                        line.xBegin,
                        line.yBegin,
                        line.theta + direction * stepSize,
                        line.length
                    );

                    const newFitness = this.computeEndpointFitness(
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

    computeLineEndPoint(xBegin, yBegin, theta, length) {
        const xEnd = xBegin + length * Math.cos(theta);
        const yEnd = yBegin + length * Math.sin(theta);
        return { xBegin, yBegin, theta, length, xEnd, yEnd };
    }

    computeEndpointFitness(line1, line2, line3, line4) {
        const distances = [
            this.distance(line1.xEnd, line1.yEnd, line2.xEnd, line2.yEnd),
            this.distance(line1.xEnd, line1.yEnd, line3.xEnd, line3.yEnd),
            this.distance(line1.xEnd, line1.yEnd, line4.xEnd, line4.yEnd),
            this.distance(line2.xEnd, line2.yEnd, line3.xEnd, line3.yEnd),
            this.distance(line2.xEnd, line2.yEnd, line4.xEnd, line4.yEnd),
            this.distance(line3.xEnd, line3.yEnd, line4.xEnd, line4.yEnd)
        ];

        return distances.reduce((a, b) => a + b, 0) / distances.length;
    }

    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    computeFurthestFromCenterOfMass(allLines, guess) {
        let tlX = 0, tlY = 0, trX = 0, trY = 0, brX = 0;

        allLines.forEach(lines => {
            const tweaks = this.generateTweaks(lines);
            tlX += tweaks.tlX;
            tlY += tweaks.tlY;
            trX += tweaks.trX;
            trY += tweaks.trY;
            brX += tweaks.brX;
        });

        const n = allLines.length;
        tlX /= n; tlY /= n; trX /= n; trY /= n; brX /= n;

        const maxError = Math.max(
            Math.abs(tlX),
            Math.abs(tlY),
            Math.abs(trX),
            Math.abs(trY),
            Math.abs(brX)
        );

        const newGuess = JSON.parse(JSON.stringify(guess));
        const scalor = -1;

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

    generateTweaks(lines) {
        return {
            tlX: this.computeDistanceFromCenterOfMass(lines.tlLine, lines.trLine, lines.blLine, lines.brLine).x,
            tlY: this.computeDistanceFromCenterOfMass(lines.tlLine, lines.trLine, lines.blLine, lines.brLine).y,
            trX: this.computeDistanceFromCenterOfMass(lines.trLine, lines.tlLine, lines.blLine, lines.brLine).x,
            trY: this.computeDistanceFromCenterOfMass(lines.trLine, lines.tlLine, lines.blLine, lines.brLine).y,
            brX: this.computeDistanceFromCenterOfMass(lines.brLine, lines.tlLine, lines.trLine, lines.blLine).x
        };
    }

    computeDistanceFromCenterOfMass(lineToCompare, line2, line3, line4) {
        const x = (line2.xEnd + line3.xEnd + line4.xEnd) / 3;
        const y = (line2.yEnd + line3.yEnd + line4.yEnd) / 3;
        return {
            x: lineToCompare.xEnd - x,
            y: lineToCompare.yEnd - y
        };
    }

    getStatus() {
        return {
            totalIterations: this.totalIterations,
            stagnantCounter: this.stagnantCounter,
            currentFitness: this.currentGuess ? 1 / this.currentGuess.fitness : 0,
            bestFitness: this.bestGuess ? 1 / this.bestGuess.fitness : 0,
            bestGuess: this.bestGuess
        };
    }
}
