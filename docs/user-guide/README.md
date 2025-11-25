# User Guide

This guide covers the essential features of your Maslow 4 CNC machine's web interface, including connecting to WiFi, uploading files, and running your first cuts.

> **Note:** Images for this guide should be sourced from [the official user guide](https://www.maslowcnc.com/user-guide).

## Connecting to Your Maslow

### Step 1: Power On

When powered on, your Maslow 4 creates a WiFi network named `maslow`. The default password is `12345678`.

### Step 2: Connect to WiFi

Connect your computer, smartphone, or tablet to the `maslow` WiFi network.

### Step 3: Access the Web Interface

The interface may auto-open when you connect. If not, enter `192.168.0.1` in your browser's address bar.

## Web Interface Overview

The Maslow 4 web interface provides all the controls you need to operate your CNC machine without installing any additional software.

### Main Dashboard

The main dashboard displays:

- Machine status
- Current position (X, Y, Z coordinates)
- Connection status
- Quick access to common actions

### Actions Menu

The Actions menu provides access to:

- **Home Position:** Define and return to the home position
- **Move Machine:** Manual jog controls for X, Y, and Z axes
- **Calibration:** Run the calibration wizard
- **Run G-code:** Execute uploaded G-code files

## Configuring WiFi (Optional)

You can configure Maslow to join your home WiFi for networked access from any device on your network.

### Steps to Connect to Home WiFi

1. Access the web interface via the default `maslow` network
2. Navigate to the "FluidNC" tab or "Network" settings
3. Enter your home WiFi credentials
4. Save and restart the machine

## Uploading and Running G-code Files

### Uploading Files

1. Navigate to the "Files" or "Actions" menu
2. Click "Upload files"
3. Select your `.nc` G-code file
4. Wait for the upload to complete

### Running a G-code File

1. Select the uploaded file from the list
2. Set the start position (or pick a specific line if resuming)
3. Click "Run" to start the job
4. Monitor progress from the dashboard

### Visualizing Tool Paths

The web interface can display a visual preview of the tool path, helping you verify the job before running.

## Manual Machine Controls

### Jog Controls

Use the arrow buttons to manually move the machine:

- **X-axis:** Left and right movement
- **Y-axis:** Up and down movement (on vertical setup)
- **Z-axis:** Router depth control

### Zeroing Position

Set the current position as zero for any axis:

1. Move the machine to your desired zero point
2. Click the "Zero" button for the appropriate axis
3. Confirm the new zero position

### Spindle Control

Control the router/spindle using built-in macros:

- **M3:** Spindle ON
- **M5:** Spindle OFF

## Updating Firmware

Keeping your firmware up to date ensures you have the latest features and bug fixes.

### Firmware Update Process

1. Download the latest firmware from [GitHub Releases](https://github.com/MaslowCNC/Maslow_4/releases):
   - `firmware.bin`
   - `index.html.gz`
   - `maslow.yaml`

2. Access the web interface and go to the "FluidNC" tab

3. Click "Update the Firmware" and select `firmware.bin`

4. Upload the other files using the file upload function

5. Restart the machine

> **Note:** If updating from a version before 1.0 to after 1.0, a USB cable is required. See the official documentation for USB update instructions.

## Calibration

Access the calibration wizard from the Actions menu. The wizard will guide you through:

1. Belt extension and retraction
2. Home position definition
3. Anchor point measurement
4. Calibration grid setup
5. Automated calibration process

For detailed calibration instructions, see [Putting It All Together](../putting-it-all-together-4-1/README.md).

## Tips for Best Results

- **Work Surface:** Use a flat, rigid spoil board to protect your work surface
- **Material Hold-down:** Secure your material firmly to prevent movement during cutting
- **Start Slow:** Begin with conservative feed rates and speeds until you're familiar with the machine
- **Test Cuts:** Always do a test cut on scrap material before cutting your final piece
- **Dust Collection:** Connect a shop vacuum to the dust port for cleaner operation

## Troubleshooting

### Cannot Connect to WiFi

- Verify you're connecting to the correct network (`maslow`)
- Check the default password (`12345678`)
- Try power cycling the machine

### Web Interface Not Loading

- Manually enter `192.168.0.1` in your browser
- Try a different browser
- Clear browser cache

### Machine Not Responding

- Check all cable connections
- Verify power is connected
- Check the serial connection in the web interface

## Resources

- [Maslow CNC Forums](https://forums.maslowcnc.com/) - Community support and troubleshooting
- [Official Assembly Guide](https://www.maslowcnc.com/assembly-guide)
- [Firmware Repository](https://github.com/MaslowCNC/Firmware)
- [FluidNC Documentation](https://github.com/bdring/FluidNC)
