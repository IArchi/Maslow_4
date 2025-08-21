# FluidNC ESP32 CNC Firmware Development

FluidNC is a CNC firmware optimized for ESP32 controllers. It's the next generation of firmware from the creators of Grbl_ESP32, featuring a built-in web UI and the flexibility to operate a wide variety of machine types including laser/spindle combinations and tool changers.

This project is a fork from the original FluidNC project specifically for Maslow CNC machines. It is not important to maintain compatability with other kinds of machines, this fork is specific to Maslow CNC type machines. 

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Setup
- Install PlatformIO: `pip3 install --upgrade platformio`
- Bootstrap project dependencies: `pio platform install` (runs automatically on first build)
- NEVER CANCEL long-running builds or commands - wait for completion

### Build System Commands
- **Main firmware build**: `pio run -e wifi_s3` -- takes ~2-3 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
- **Clean build**: `pio run -e wifi_s3 -t clean` -- takes ~1 second
- **Filesystem build**: `pio run -e wifi_s3 -t buildfs` -- takes ~4 seconds
- **Upload firmware**: `pio run -e wifi_s3 -t upload` (requires connected ESP32)
- **Upload filesystem**: `pio run -e wifi_s3 -t uploadfs` (requires connected ESP32)

### Embedded Web UI Build
- **Prerequisites**: Node.js (v20+) and npm are required
- **Install web dependencies**: `cd embedded && npm install` -- takes ~13 seconds. NEVER CANCEL.
- **Build web UI**: `cd embedded && python3 build.py` -- takes ~8 seconds
- **CRITICAL**: Always rebuild web UI after changes to embedded/www/* files before building firmware

### Available Build Environments
- `wifi_s3` (default) - ESP32-S3 with WiFi
- `bt_s3` - ESP32-S3 with Bluetooth
- `wifibt_s3` - ESP32-S3 with WiFi and Bluetooth  
- `noradio_s3` - ESP32-S3 without wireless
- `wifi` - ESP32 with WiFi
- `bt` - ESP32 with Bluetooth
- `wifibt` - ESP32 with WiFi and Bluetooth
- `noradio` - ESP32 without wireless

## Pull Request Best Practices

### Minimizing Changes
- **Scope changes narrowly**: Only modify files directly related to the feature/fix being implemented
- **Avoid formatting-only changes**: Do not include whitespace or formatting changes in files unrelated to your functional changes
- **Surgical modifications**: Make the smallest possible changes to achieve the desired functionality
- **Review diff before committing**: Always check `git diff` to ensure only intended changes are included

### Code Formatting Guidelines
- **Format selectively**: Only run clang-format on files you have functionally modified
- **Avoid global formatting**: Do NOT run formatting tools across the entire repository
- **IDE auto-format**: Configure IDE to only format files being actively edited
- **Pre-commit review**: Check that formatting changes are limited to functionally modified files

## Testing and Validation

### Unit Tests (Currently Broken)
- **Command**: `pio test -e native`
- **Status**: Unit tests currently fail due to FreeRTOS compatibility issues on native platform
- **Known Issues**: Missing headers (Queue.h case sensitivity), OLED library dependencies, FreeRTOS type mismatches
- **Recommendation**: Do NOT rely on native unit tests. Test on actual hardware instead.

### Code Formatting
- **Format code**: Use clang-format with provided `.clang-format` configuration
- **IDE Integration**: Most IDEs automatically pick up `.clang-format` file
- **Manual format**: `clang-format -i <filename>` for individual files
- **CRITICAL**: Always format code before committing to maintain project standards
- **MINIMIZE WHITESPACE CHANGES**: Only format files that you are functionally modifying
  - Do NOT run global formatting commands across the entire codebase
  - Do NOT format files that are not directly related to your changes
  - Focus formatting only on files where you made functional code changes
  - Avoid unnecessary whitespace-only changes that increase PR noise and review burden

## Validation Scenarios

### After Making Changes
1. **Build test**: `pio run -e wifi_s3` (must succeed without errors)
2. **Filesystem test**: `pio run -e wifi_s3 -t buildfs` (must succeed)
3. **Web UI test**: `cd embedded && python3 build.py` (if web changes made)
4. **Format test**: Run clang-format ONLY on C++ files you functionally modified (not entire codebase)
5. **Clean build test**: `pio run -e wifi_s3 -t clean && pio run -e wifi_s3` (final verification)

### Hardware Testing Requirements  
- **Upload test**: Flash firmware to ESP32 using `pio run -e wifi_s3 -t upload`
- **Web UI test**: Connect to FluidNC WiFi AP or local network, access web interface
- **Basic functionality**: Test G-code commands through web interface or serial connection
- **Configuration test**: Upload and verify YAML configuration files work correctly

## Configuration System

### Machine Definitions
- **Location**: Configuration files stored in `FluidNC/data/` directory
- **Format**: YAML files (e.g., `maslow.yaml`, `config-bak.yaml`)
- **Default**: `config.yaml` (can be changed with `$Config/Filename=<name.yaml>`)
- **Upload**: Use web interface or `pio run -e wifi_s3 -t uploadfs` to upload configurations

### Key Configuration Areas
- **Machine geometry**: Motor definitions, axis configuration
- **I/O mapping**: Pin assignments for steppers, spindles, limit switches
- **Network settings**: WiFi credentials, web server configuration
- **Motion control**: Stepping engine, acceleration, feed rates

## Common Development Tasks

### Project Structure Navigation
- **Main firmware**: `FluidNC/src/` - Core C++ firmware code
- **Web interface**: `embedded/www/` - HTML/CSS/JS source files
- **Configurations**: `FluidNC/data/` - Example machine configurations  
- **Libraries**: `libraries/` - Custom libraries and dependencies
- **Build output**: `.pio/build/wifi_s3/` - Compiled firmware and filesystem
- **Install scripts**: `install_scripts/` - Platform-specific installation helpers

### Adding New Features
1. **C++ changes**: Modify files in `FluidNC/src/`
2. **Web UI changes**: Modify files in `embedded/www/`, then run `python3 build.py`
3. **Configuration changes**: Update YAML schema and parsing code
4. **Testing**: Build and test on hardware - native tests are not reliable

### Build Troubleshooting
- **Missing libraries**: PlatformIO automatically installs dependencies from `platformio.ini`
- **Web UI issues**: Ensure `embedded/index.html.gz` exists after running `python3 build.py`
- **Upload failures**: Check USB connection, ESP32 in download mode (hold BOOT button)
- **Memory issues**: Use `max_littlefs.csv` partition table for 8MB ESP32-S3 boards

## Install Scripts and Distribution

### Release Building
- **Build release**: `python3 build-release.py` (requires esptool and platform-specific setup)
- **Output location**: `release/` directory contains installable packages
- **Install scripts**: Generated for Windows (`win64/`) and POSIX (`posix/`) platforms

### Manual Installation (Development)
- **Erase flash**: `pio run -e wifi_s3 -t erase`
- **Upload all**: `pio run -e wifi_s3 -t upload && pio run -e wifi_s3 -t uploadfs`
- **Terminal access**: `pio device monitor` for serial debugging

## Critical Timing Information

- **Firmware build**: ~2-3 minutes initial, ~30-60 seconds incremental. NEVER CANCEL. Use 5+ minute timeout.
- **Web UI build**: ~8 seconds. NEVER CANCEL. Use 2+ minute timeout.
- **Filesystem build**: ~4 seconds. NEVER CANCEL. Use 1+ minute timeout.
- **Dependencies install**: ~13 seconds for npm, ~3 minutes for PlatformIO. NEVER CANCEL.
- **Clean operations**: ~1 second.

## Dependencies and Prerequisites

### Required Tools
- **Python 3.x**: For PlatformIO and build scripts
- **PlatformIO**: `pip3 install --upgrade platformio`
- **Node.js v20+**: For web UI build system  
- **clang-format**: For code formatting (usually available via package manager)

### Hardware Requirements
- **ESP32-S3**: Recommended platform (8MB flash, 240MHz, 320KB RAM)
- **ESP32**: Also supported with appropriate environment selection
- **USB connection**: For flashing and debugging

## Known Limitations and Workarounds

### Unit Testing
- **Issue**: Native tests fail due to FreeRTOS/ESP32 API dependencies
- **Workaround**: Test functionality on actual hardware instead
- **Status**: This is a known limitation, not a development priority

### Web UI Dependencies
- **Issue**: Node.js build system has security vulnerabilities in old packages
- **Impact**: Does not affect runtime security, only build-time warnings
- **Action**: Ignore npm audit warnings during development

### Case Sensitivity
- **Issue**: Some file systems may have case sensitivity issues with include files
- **Workaround**: Use exact case matching in includes, verify on Linux systems

## File Types and Formats

### Source Code
- **C++ firmware**: `.cpp`, `.h` files using clang-format standards
- **Configuration**: `.yaml` files for machine definitions
- **Web assets**: `.html`, `.css`, `.js` files in `embedded/www/`

### Build Artifacts (Do NOT commit)
- **Binary firmware**: `.pio/build/*/firmware.bin`
- **Filesystem image**: `.pio/build/*/littlefs.bin`
- **Compressed web**: `embedded/tool.html.gz`, `FluidNC/data/index.html.gz`
- **Dependencies**: `.pio/libdeps/`, `embedded/node_modules/`
