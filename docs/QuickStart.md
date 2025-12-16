# Quick Start Guide

This guide is intended to get your Maslow up and running in as few words as possible. It is intended to be used immediately after completing assembly so we can assume that the user has already assembled their machine and they are now looking for how to set it up.

  
## Choosing your Anchors

Maslow 4 is designed to turn any flat rigid surface into a large format CNC router. This is powerful, but it can lead to an overwhelming number of options. 

The best option is to attach the machine directly to a concrete floor. This can be done by either attaching 3D printed anchors to the floor or by adding threaded inserts into the concrete.

<img src="https://github.com/user-attachments/assets/d23d8f62-3247-4021-b801-6f804004a208" alt="Floor anchor" width="600">

The anchors are sized to fit a 10mm or 4/8ths inch bolt.
 
<img src="https://github.com/user-attachments/assets/eb3b7083-ba87-4b3d-877e-17002e466056" alt="Threaded insert" width="600">
 
You can find a complete list of different anchor types here: [ADD LINK]

  If you don't have a floor to connect to you can construct a flat rigid surface to use the machine on. You can find instructions to assemble a basic one that we recommend here: https://www.maslowcnc.com/frame-options

<img width="833" height="644" alt="image" src="https://github.com/user-attachments/assets/8e36c830-4d37-4d99-a702-d1638e9ebba6" />

We've put together a tool to help you to better understand what size of frame you might want and how that will impact your cutting area. You can find that tool here: https://maslowcnc.github.io/Layout-Simulator/

<img src="https://github.com/MaslowCNC/Maslow_4/blob/Maslow-Main/docs/quick-start/images/Layout%20Simulator.png" alt="Layout Simulator" width="800">

- Size and other considerations
  - Belt ends need to be loose to rotate in the XY directions but gently held in the z direction so they don't pop up and down.
  - Belt ends will be taken on and off a lot. 
  - Can be horizontal to 20 degrees from vertical.
  - Does not have to be exactly rectangular.
  - Software limits basic frames to less than 5 meters wide and tall.
  - Belts are 4.4 meters long. Cutting area can not be farther than that from an anchor. 

## Connecting
	
  Maslow4 is controlled using a built-in interface accessible from your web browser. You can connect to Maslow4 from any Windows, Mac, or Linux computer or iOS or Android tablet or phone. You do not need to install any software. 

Maslow4 will create a wifi network called **“maslow”** which you can connect to. The default password for this network will be **“12345678”**.

Connecting to the network will automatically open the user interface on most devices. If it does not you can type **192.168.0.1** into your web browser to open the interface. 

<img src="https://github.com/MaslowCNC/Maslow_4/blob/Maslow-Main/docs/user-guide/images/guide-12.png" alt="File Upload" width="800">

- Connecting Maslow to your wifi

  While you don't need to connect Maslow to your home wifi network for it to work, if you have wifi available the next thing to do is to connect to it.

  To connect Maslow to your wifi press on "Setup" in the top right corner.

<img src="https://github.com/MaslowCNC/Maslow_4/blob/Maslow-Main/docs/quick-start/images/Screenshot%202025-12-15%20at%203.11.49%E2%80%AFPM.png" alt="Press setup" width="800">

  Then press "Config"

<img src="https://github.com/MaslowCNC/Maslow_4/blob/Maslow-Main/docs/quick-start/images/Screenshot%202025-12-15%20at%203.12.30%E2%80%AFPM.png" alt="Press config" width="800">

  Then enter your wifi network information and press save.

<img src="https://github.com/MaslowCNC/Maslow_4/blob/Maslow-Main/docs/quick-start/images/Screenshot%202025-12-15%20at%203.13.02%E2%80%AFPM.png" alt="Enter wifi name" width="800">

  Maslow will try to connect to this wifi network every time it powers up. If it can't find that network or cant connect for some reason it will create the Maslow wifi network for you to connect to it. Turn your Maslow off and back on to let it connect to your wifi network.

  Once Maslow is connected to your wifi network you you can access it by navigating to the address **maslow.local** from any browser. If you are having trouble finding it try a different device or browser.

  As a last resort you can always find your machine's IP address by counting the blinks of the blue light.

## Updating the firmware

## Extending the belts

## Finding your anchor point locations
 
## Running your first cut

## Generating gcode 

## Uploading to Maslow

## Move the machine around

## Define home position

## Running a file
