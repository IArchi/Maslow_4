# ESP3D WebUI Development and Testing Guide

This guide covers how to compile, test, and develop the ESP3D WebUI.

## Prerequisites

### Required Software
- **Node.js**: v20+ (tested with v20.19.5)
- **npm**: v10+ (tested with v10.8.2)
- **Python**: v3.12+ (for local testing server)

### Installation
```bash
# Verify versions
node --version    # Should be v20+
npm --version     # Should be v10+
python3 --version # Should be v3.12+

# Install Node.js dependencies
npm install

# Install Python dependencies for testing (one-time setup)
pip3 install flask zeroconf websockets requests
```

## Compiling

WebUI is compiled with the "gulp" packager program that runs on top of nodejs. 

### Basic Compilation
```bash
# Build English version (recommended for ESP32 - ~124KB)
gulp package --lang en

# Build all languages (may be too large for ESP32 - use with caution)
gulp package
```

### Language-Specific Builds
```bash
# Available languages and approximate sizes:
gulp package --lang en      # English (~122KB)
gulp package --lang fr      # French (~122KB)
gulp package --lang es      # Spanish (~125KB)  
gulp package --lang de      # German (~122KB)
gulp package --lang it      # Italian (~122KB)
gulp package --lang ja      # Japanese (~122KB)
gulp package --lang pl      # Polish (~122KB)
gulp package --lang ptbr    # Portuguese Brazil (~122KB)
gulp package --lang ru      # Russian (~122KB)
gulp package --lang tr      # Turkish (~122KB)
gulp package --lang uk      # Ukrainian (~122KB)
gulp package --lang zh_CN   # Chinese Simplified (~122KB)
gulp package --lang hu      # Hungarian (~122KB)
```

### Build Output
After compilation, you'll find:
- **`dist/index.html.gz`**: Compressed version for ESP32 (~122-125KB)
- **`dist/index.html`**: Uncompressed version for development (~535KB)

### NPM Convenience Scripts
```bash
npm run build        # Same as: gulp package (all languages)
npm run build:en     # Same as: gulp package --lang en (English only)
npm run start        # Build English + start test server
npm run serve        # Start test server only (must build first)
```

### Expected Build Output
```
[XX:XX:XX] Starting 'package'...
Enable Language: en
[XX:XX:XX] Size index.html.gz : 124.95 kB
[XX:XX:XX] Finished 'package' after 2.2 s
```

Note: You may see JSHint warnings about ES6/ES8 syntax - these are expected and don't affect the build.

## Testing

### Local Testing (Recommended)
You can test your build locally without uploading to an ESP32:

```bash
# Start the proxy server
python3 fluidnc-web-sim.py

# Then browse to: http://localhost:8080
```

### Advanced Local Testing
```bash
# Test with a specific FluidNC IP address
python3 fluidnc-web-sim.py 192.168.1.25

# Full workflow: build and test
npm start  # Builds English version and starts server
```

### How Local Testing Works
The proxy server:
- Serves the `dist/index.html` file directly for the initial WebUI load
- Forwards all other communication to the FluidNC machine
- Uses MDNS to find "fluidnc.local" by default
- Allows you to test UI changes without uploading to ESP32

### Production Testing
Upload `dist/index.html.gz` to a FluidNC ESP32 machine and access it via the ESP32's IP address. This is the normal deployment method.

## Development Workflow

### Typical Development Cycle
1. **Make changes** to files in the `www/` directory
2. **Build**: `gulp package --lang en` 
3. **Test**: `python3 fluidnc-web-sim.py`
4. **Browse**: Open http://localhost:8080
5. **Repeat** until satisfied
6. **Deploy**: Upload `dist/index.html.gz` to ESP32

### Quick Testing
```bash
# One command to build and test
npm start
```

### File Size Monitoring
ESP32 has limited storage, so monitor file sizes:
- **Target size**: <130KB compressed
- **English build**: ~122KB (safe)
- **Spanish build**: ~125KB (safe)
- **Multi-language**: Often >150KB (too large for ESP32)

## Automated Builds

### GitHub Actions Integration
Don't want to compile locally? Use automated builds:

**Method 1: Request @MaslowBot as reviewer**
1. Create a Pull Request
2. Add @MaslowBot as a reviewer
3. GitHub Actions automatically compiles the WebUI
4. Download the "Updated UI.zip" artifact from the Actions tab

**Method 2: Comment-triggered builds**
1. Comment "please build" or "/build" on any Pull Request
2. GitHub Actions compiles and provides download link
3. Get the artifact with installation instructions

### Build Artifact Contents
The automated build provides:
- `index.html.gz` - The compiled WebUI
- `README.txt` - Installation instructions

## Troubleshooting

### Common Issues

**Node/npm not found**
```bash
# Install Node.js from nodejs.org
# Or use package manager:
sudo apt install nodejs npm  # Ubuntu/Debian
brew install node           # macOS
```

**Python dependencies missing**
```bash
pip3 install flask zeroconf websockets requests
```

**Build size too large**
- Use single language: `gulp package --lang en`
- Avoid multi-language builds for ESP32 deployment

**JSHint ES6/ES8 warnings**
- These are expected and don't break the build
- The codebase uses modern JavaScript features

**Server can't find FluidNC**
```bash
# Specify IP address explicitly
python3 fluidnc-web-sim.py 192.168.1.25
```

### Build Verification
```bash
# Check output files exist and have reasonable sizes
ls -la dist/
file dist/index.html.gz    # Should show: gzip compressed
du -h dist/index.html.gz   # Should be ~122-125KB
```

## Contributing

### Before Submitting PRs
1. **Test locally**: `npm start` and verify UI works
2. **Check file size**: Ensure build is <130KB
3. **Test multiple languages** if you modified text
4. **Use automated builds** for final verification

### Code Style
- Follow existing JavaScript patterns
- ES6/ES8 syntax is acceptable (ignore JSHint warnings)
- Minimize file size impact
- Test changes with real ESP32 when possible

