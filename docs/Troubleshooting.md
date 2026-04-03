# Troubleshooting Guide Maslow 4
Excellent forum Troubleshooting resources:
<https://forums.maslowcnc.com/t/the-belt-maslow-a-k-a-maslow-4-manual/19147/9?>
also this
<https://forums.maslowcnc.com/t/the-big-bad-m4-troubleshooting-problems-solutions-thread/21000/26>

Table of contents Followed buy longer explanaitions and discussion for each one:

## Common Problems

### Spools have too much friction 
### Frame Flexing
### Frame Dimensions appropriate for your workspace
### Anchors not free to move
### Belt not retracting
### Find Anchors (aka Calibration) 
### Connection Dropping
### Sled lifting and tipping during movement
### Z axis not gong all the way down
### Reset Z position after cutting or setup interrupted




## Things that can make it work better

## Maintainance actions
### Sand and lubricate spools
### Make Sure Belt Guards are clear of belts
### Set Z stop 
### Find Anchors (Calibrate) with no bit in and z all the way down
### Enter Z offsets for your anchor points
### Enter spoilboard thickness and work thickness 
### Run a test pattern and enter scale adjustments
### Saving your YAML file
### Udating the firmware
### Making sure your firmware and index files match


# Detailed Discussions

## Common Problems

### Spools have too much friction 
The ring of the spool that the belt winds around inside the arm sometimes comes from the factory with a little bit too much plastic on the edges or a tight fit on the main body of the arm. There is a slight taper so that the parts can be released from the mold.  Make sure the spool isn't geting stuck on that taper, lightly sand the inside of the spool and the corresponding ring on the arm and then use a silicone lubricant.  Be careful with other lubricants as they can interact with the plastic. 
### Frame Flexing
Maslow depends on calculating it's position solely from the length of the belts as they pass by the encoder gear with the magnet on the way out of the spool. If the frame is flexing visibly, even by a millimeter, then the position calculations will be off by that millimeter or more.  As much as is possible make sure your frame is solid and well supported. Concrete floors are great.  Metal pipes and struts naturally flex and bend.  Wood can be good with thoughtful engineering but as the machine runs look for twisting and lifting of the frame corners. 
### Frame Dimensions appropriate for your workspace
Use a frame calculator when you are setting up your Maslow.  The calculations get less accurate as the triangles that maslow makes get thinner, the tension near the top of a vertical maslow approaches infinity as the belts get closer to horizontal at the top, and the belts bump 
### Anchors not free to move
### Belt not retracting
### Find Anchors (aka Calibration) 
### Connection Dropping
### Sled lifting and tipping during movement
### Z axis not gong all the way down
### Reset Z position after cutting or setup interrupted




## Things that can make it work better

## Maintainance actions
### Sand and lubricate spools
### Make Sure Belt Guards are clear of belts
### Set Z stop 
### Find Anchors (Calibrate) with no bit in and z all the way down
### Enter Z offsets for your anchor points
### Enter spoilboard thickness and work thickness 
### Run a test pattern and enter scale adjustments
### Saving your YAML file
### Udating the firmware
### Making sure your firmware and index files match





