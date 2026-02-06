# Calibration Simulator - Quick Start

**[🚀 Launch the Interactive Simulator](index.html)**

## Opening the Simulator

1. Navigate to `docs/calibration-simulation/`
2. Open `index.html` in your web browser (Chrome, Firefox, Edge, or Safari)
3. No server required - works as a standalone HTML file

## Quick Configuration

**Typical Settings:**
- Frame: 3000mm x 2000mm (standard Maslow 4 size)
- Grid: Auto or 9x9 (best accuracy)
- Error: 0.5mm (realistic measurement error)
- Speed: 100x (fast simulation)
- Orientation: Horizontal (most common)

## What to Expect

1. **Initialization** (1 second)
   - Grid generation
   - First 6 waypoints computed

2. **Stage 1** (~5-10 seconds at 100x speed)
   - Measures first 6 points (small square)
   - First computation to rough-fit frame

3. **Stage 2-4** (~30-60 seconds at 100x speed)
   - Spiral pattern through grid
   - Progressive refinement of anchor positions
   - Fitness typically improves from 0.5 → 0.999+

4. **Completion**
   - Shows final anchor positions
   - Displays position errors vs actual
   - Typical accuracy: <5mm with 0.5mm measurement error

## Interpreting Results

**Fitness Score:**
- Below 0.5: Poor fit, likely failed
- 0.5 - 0.9: Acceptable, but could be better
- 0.9 - 0.99: Good fit
- 0.99+: Excellent fit

**Position Errors:**
- <5mm: Excellent
- 5-10mm: Good
- 10-20mm: Acceptable
- >20mm: Poor (increase grid density or check for issues)

## Common Issues

**Fitness not improving:**
- Increase grid size (more measurement points)
- Check frame dimensions are reasonable
- Reduce measurement error

**Simulation too slow:**
- Select faster speed (100x or Instant)
- Reduce grid size (3x3 for quick testing)

**Unexpected results:**
- Check configuration values
- Verify frame dimensions match your setup
- Review log for error messages

## File Access

If you cloned the repository:
```
file:///path/to/Maslow_4/docs/calibration-simulation/index.html
```

If viewing online:
```
https://github.com/MaslowCNC/Maslow_4/tree/main/docs/calibration-simulation
```

## Code Architecture

The simulator now uses a **shared computation library** (`calibration-computation.js`) that contains the core calibration algorithm. This eliminates code duplication and ensures the simulator uses the exact same math as the real machine.

**Key files:**
- `calibration-computation.js` - Shared computation library with core algorithm
- `computation-simulator.js` - Thin wrapper around the shared library
- `machine-simulator.js` - Simulates the ESP32 firmware behavior
- `visualization.js` - Renders the calibration process visually
- `main.js` - Orchestrates the simulation

## Testing

A test page is available at `test.html` to verify the shared computation library works correctly. Open it in a browser and click "Run Tests" to validate the mathematical functions.

## Support

For questions or issues:
- Forum: https://forums.maslowcnc.com/
- GitHub Issues: https://github.com/MaslowCNC/Maslow_4/issues
- Documentation: See `README.md` in this directory
