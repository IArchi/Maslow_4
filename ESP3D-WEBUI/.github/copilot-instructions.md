# ESP3D-WEBUI Development Instructions

ESP3D-WEBUI is a web-based interface for ESP3D firmware that provides comprehensive control of 3D printers and CNC machines. It's built using pure JavaScript, CSS (Bootstrap-based), and a Gulp build system.

**ALWAYS reference these instructions first and only fallback to search or bash commands when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Build the Repository
**NEVER CANCEL builds or long-running commands. Set appropriate timeouts.**

```bash
# Install dependencies (takes ~30 seconds)
npm install
# Note: Expect deprecation warnings - these do not affect functionality

# Build English version (takes ~3 seconds - NEVER CANCEL, set timeout to 60+ seconds)
gulp package --lang en

# Build specific language (takes ~3 seconds each - NEVER CANCEL, set timeout to 60+ seconds)
gulp package --lang fr
gulp package --lang es
gulp package --lang de
# ... supports: en, fr, es, de, it, ja, pl, ptbr, ru, tr, uk, zh_CN, hu

# Build multi-language version (takes ~3 seconds - NEVER CANCEL, set timeout to 60+ seconds)
gulp package

# Alternative npm commands
npm run build:en    # Same as gulp package --lang en
npm run build       # Same as gulp package
```

### Run and Test the Application
```bash
# Install Python dependencies for testing
pip3 install flask zeroconf websockets requests

# Start local test server
python3 fluidnc-web-sim.py

# Alternative: Start complete build + serve workflow
npm start  # Builds English version then starts server
```

### Validation Requirements
**CRITICAL: Always manually validate changes through complete user scenarios.**

1. **Build Validation**: 
   ```bash
   gulp package --lang en  # Must complete in ~3 seconds
   ```

2. **Server Validation**:
   ```bash
   python3 fluidnc-web-sim.py  # Starts on http://127.0.0.1:8080
   ```

3. **UI Validation** - **MANDATORY after any changes**:
   - Open browser to `http://127.0.0.1:8080`
   - Verify page loads with "ESP3D WebUI" title
   - Confirm 3D printer control interface displays
   - Test navigation between panels (Controls, Files, Settings)
   - Verify no JavaScript console errors
   - Test basic UI interactions (buttons, dropdowns, text inputs)

## Build System Details

### Build Output
- **Primary output**: `dist/index.html.gz` (~122-125KB compressed)
- **Uncompressed**: `dist/index.html` (~535KB)
- **Languages**: Individual builds for each supported language (ES: ~125KB, EN: ~122KB)
- **Build time**: 2-3 seconds per language

### File Structure Navigation
```
/www/                 # Source files
  /js/                # JavaScript source
  /css/               # CSS source  
  index.html          # Main HTML template
/dist/                # Build output
  index.html          # Uncompressed build
  index.html.gz       # Compressed production file
/languages/           # Language-specific builds
/docs/                # Documentation images
gulpfile.js          # Build configuration
fluidnc-web-sim.py   # Local test server
```

## Common Development Tasks

### Linting and Code Quality
```bash
# JavaScript linting (built into gulp package)
gulp package  # Runs jshint automatically
# Note: ES6/ES8 syntax warnings are expected and do not break builds
```

### Language Development
```bash
# Build specific language for testing
gulp package --lang [language_code]

# Test different languages to verify size differences
gulp package --lang en   # ~122KB
gulp package --lang es   # ~125KB
gulp package --lang fr   # ~122KB

# Build all language packs (Windows only)
buildLanguagePacks.bat
```

### Debugging and Development
```bash
# Start development server with auto-rebuild
npm start

# Manual testing server only
python3 fluidnc-web-sim.py

# Check build output and verify sizes
ls -la dist/
file dist/index.html.gz  # Verify gzip compression
du -h dist/index.html.gz  # Check size
```

## Common Output Patterns

### Expected Build Messages
```
[18:XX:XX] Starting 'package'...
[18:XX:XX] Finished 'lint' after 44 ms
# ... (11 ES6/ES8 warnings are NORMAL and expected)
[18:XX:XX] Size index.html.gz : 122.68 kB  
[18:XX:XX] Finished 'package' after 2.19 s
```

### Expected Server Output
```
Starting flask server
 * Running on http://127.0.0.1:8080
Press CTRL+C to quit
```

### Expected Browser Console (Normal Operation)
```
[LOG] Connect to board
[LOG] FW identification:FW version: FluidNC v3.6.7
[LOG] Init UI - Step 1
# WebSocket errors are expected in simulation mode
```

## Validation Scenarios

### Complete Development Workflow Test
After making any changes, **ALWAYS** run this complete validation:

1. **Build Test**:
   ```bash
   npm install  # If dependencies changed
   gulp package --lang en  # Must complete successfully
   ```

2. **Functional Test**:
   ```bash
   python3 fluidnc-web-sim.py &  # Start in background
   # Open http://127.0.0.1:8080 in browser
   # Verify UI loads completely
   # Test key features: navigation, controls, file browser
   # Check browser console for errors
   pkill -f fluidnc-web-sim.py  # Stop server
   ```

3. **Production Build Test**:
   ```bash
   gulp package  # Multi-language build
   ls -la dist/index.html.gz  # Verify ~122-125KB size
   ```

### Critical Validation Points
- **UI Loading**: Page must display "ESP3D WebUI" title and full interface
- **JavaScript Functionality**: No console errors, all buttons responsive
- **Build Size**: Compressed file should be ~122-125KB (ESP32 storage constraint)
- **Cross-Language**: Test at least 2 different language builds if modifying text (EN: ~122KB, ES: ~125KB)

## Build Times and Performance
- **npm install**: ~30 seconds
- **Single language build**: ~3 seconds  
- **Multi-language build**: ~3 seconds
- **Python server startup**: ~2 seconds
- **NEVER CANCEL**: Always wait for builds to complete naturally

## Known Issues and Workarounds
- **JSHint warnings**: ES6/ES8 syntax warnings are expected, builds succeed
- **npm audit vulnerabilities**: 38 vulnerabilities reported but do not affect functionality
- **Python websocket warnings**: Event loop warnings in simulator but web UI functions correctly
- **Build.bat**: Windows-only language pack builder, use individual gulp commands on Unix

## Dependencies and Requirements
- **Node.js**: 20+ (tested with 20.19.4)
- **npm**: 10+ (tested with 10.8.2)  
- **Python**: 3.12+ for testing server
- **Gulp**: Installed via npm, no global installation needed
- **Browser**: Any modern browser for testing

## CI/CD Integration
- **Travis CI**: Configured for automated builds
- **GitHub Actions**: Manual workflow for releases
- **Build command**: `gulp package --lang en` for single language
- **Full build**: `gulp package` for multi-language release

Always validate your changes work correctly before committing by running the complete validation workflow above.