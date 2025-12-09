# Maslow CNC Calibration Simulator

This simulator provides an accurate representation of the Maslow CNC machine's calibration process. Unlike the previous simulation at https://github.com/BarbourSmith/Calibration-Simulation/, this implementation exactly mimics how data flows between the machine firmware and the browser-side computation.

## Key Features

### Accurate Machine Simulation
- **State Machine Behavior**: Mimics the exact calibration state machine from `Calibration.cpp`
- **Grid Generation**: Replicates the spiral pattern grid generation algorithm
- **Chunked Data Flow**: Simulates how measurements are collected and sent in stages (matching `recomputePoints`)
- **Measurement Accuracy**: Models real-world measurement errors and Z-plane projection
- **Non-Rectangular Frame**: Simulates realistic frame imperfections (±20mm variations) instead of perfect rectangles

### Browser-Side Computation
- **Iterative Optimization**: Implements the same "magnetically attracted lines" algorithm used in `calculatesCalibrationStuff.js`
- **Multi-Stage Processing**: Accurately simulates the multiple computation stages that occur during calibration
- **Fitness Tracking**: Shows how anchor position estimates improve over time

### Real-Time Visualization
- **Machine State**: Shows calibration grid, current waypoint, and true anchor positions
- **Computation Progress**: Displays fitness evolution and computed anchor positions
- **Error Analysis**: Compares computed positions with actual positions at completion

## How It Works

### Calibration Process Flow

1. **Grid Generation** (Machine Side)
   - Generates a calibration grid based on frame size and grid density
   - Creates waypoints in a spiral pattern starting from center
   - Defines recompute points where computation should be triggered

2. **Measurement Collection** (Machine Side)
   - Moves to each waypoint in sequence
   - Takes measurements of belt lengths to all four anchors
   - Projects measurements to XY plane (accounting for Z-height)
   - Adds configurable measurement error

3. **Data Transmission** (Machine → Browser)
   - Sends measurement chunks via `CLBM:` format messages
   - Triggered at specific waypoints (recomputePoints)
   - Mimics the actual serial communication protocol

4. **Anchor Computation** (Browser Side)
   - Receives measurement chunk
   - Runs iterative optimization to find best anchor positions
   - Uses "line walking" algorithm to minimize endpoint distances
   - Updates anchor position estimates

5. **Multi-Stage Refinement**
   - Process repeats for each stage (typically 4-5 stages)
   - Each stage uses more measurements for better accuracy
   - Final stage uses all measurements for best fit

## Usage

### Opening the Simulator

Simply open `index.html` in a modern web browser. No server or build process is required.

### Configuration Options

**Machine Configuration:**
- **Frame Width/Height**: The actual dimensions of the machine frame (500-5000mm)
- **Grid Size**: 
  - `Auto`: Automatically selects grid density based on max spacing
  - `3x3` to `9x9`: Manual selection of calibration point density

**Simulation Settings:**
- **Measurement Error**: Random error added to each measurement (0-5mm)
  - Models encoder inaccuracy, belt stretch, frame flex, etc.
  - Higher values make calibration more challenging
- **Simulation Speed**: 
  - `Real-time`: Matches actual machine timing
  - `10x` to `100x`: Faster simulation for quick testing
  - `Instant`: No delays, completes as fast as possible
- **Orientation**: `Vertical` or `Horizontal` machine mounting

### Running a Simulation

1. Configure the machine parameters to match your setup
2. Adjust simulation settings as desired
3. Click "Start Calibration Simulation"
4. Watch the visualization as calibration progresses
5. Review the log for detailed progress information
6. Check final error measurements when complete

## Understanding the Output

### Machine Visualization (Left Panel)
- **Green dots**: True anchor positions (what we're trying to find)
- **Red dot**: Current measurement waypoint
- **Blue dots**: Already measured waypoints
- **Gray dots**: Future waypoints
- **Blue line**: Path taken through calibration grid

### Computation Progress (Right Panel)
- **Fitness Over Time**: Shows how well the anchor estimates match measurements
  - Higher is better (perfect fit = 1.0)
  - Typically converges to 0.99+
- **Anchor Positions**: Current best estimates for each anchor
- **Iteration Count**: Number of optimization iterations performed

### Log Output
- **Measurement progress**: "Waypoint X/Y completed"
- **Computation stages**: "Sending N measurements for computation (Stage X)"
- **Fitness scores**: "Computation complete: Fitness = X.XXXXXX"
- **Final results**: Computed positions and errors vs actual positions

## Technical Details

### Key Differences from Original Simulation

The original simulation (https://github.com/BarbourSmith/Calibration-Simulation/) processes all measurements at once. This simulation accurately models:

1. **Staged Computation**: Anchor positions are recomputed multiple times as more data arrives
2. **Data Chunking**: Measurements sent in groups matching firmware behavior
3. **Iterative Refinement**: Each stage builds on previous results
4. **Protocol Accuracy**: Uses actual `CLBM:` message format

### Algorithm Overview

The calibration algorithm works by:

1. Drawing "lines" from each anchor point with length equal to measured belt length
2. Adjusting line angles to make all four lines meet at a single point
3. Finding anchor positions that minimize the distance between line endpoints
4. Using an iterative "hill climbing" approach to optimize positions

This "magnetically attracted lines" approach is robust to measurement errors and works well even with poor initial guesses.

### Performance Characteristics

- **Grid Size**: 3x3 (13 points) to 9x9 (81 points)
- **Computation Time**: ~1000-5000 iterations per stage
- **Typical Accuracy**: <5mm position error with 0.5mm measurement error
- **Stages**: 4-5 recomputation stages depending on grid size

## Use Cases

### Development and Testing
- Test calibration algorithm changes without hardware
- Explore impact of measurement errors
- Validate grid generation logic
- Debug computation convergence issues

### Education and Demonstration
- Understand how Maslow calibration works
- Visualize the iterative refinement process
- See impact of different parameters
- Learn about the algorithm's robustness

### Quality Assurance
- Verify calibration produces accurate results
- Test edge cases (extreme errors, unusual frame sizes)
- Benchmark computation performance
- Validate protocol changes

## Files

- `index.html`: Main simulator interface
- `machine-simulator.js`: ESP32 firmware simulation
- `computation-simulator.js`: Browser-side calibration algorithm
- `visualization.js`: Canvas-based rendering
- `main.js`: Orchestration and UI management
- `README.md`: This documentation

## Limitations

This simulation does not model:
- Belt tension dynamics
- Motor current sensing
- Actual belt movement physics
- Network latency
- Serial communication errors
- Multiple measurement runs per waypoint

These factors exist in the real machine but don't significantly affect the calibration algorithm's behavior.

## Frame Imperfections

The simulator now includes realistic frame imperfections to better match real-world conditions:
- Each simulation run generates a non-rectangular frame with random variations (±20mm per anchor)
- The visualization shows both the actual frame shape (solid line) and ideal rectangle (dashed line)
- This helps test the calibration algorithm's robustness to frame irregularities
- The bottom-left anchor (BL) is kept at (0, 0) as a reference point

## Future Enhancements

Potential improvements:
- Export/import measurement datasets
- Compare multiple calibration runs
- Visualize line intersection during computation
- Add noise profiles (systematic vs random errors)
- Animate the optimization process
- Support for non-rectangular frames
- Historical fitness comparison

## Related Resources

- **Original Simulation**: https://github.com/BarbourSmith/Calibration-Simulation/
- **FluidNC Firmware**: `firmware/FluidNC/src/Maslow/Calibration.cpp`
- **Browser Algorithm**: `ESP3D-WEBUI/www/js/calculatesCalibrationStuff.js`
- **Maslow Forum**: https://forums.maslowcnc.com/

## License

This simulation is part of the Maslow CNC project and follows the same open-source license as the main repository.
