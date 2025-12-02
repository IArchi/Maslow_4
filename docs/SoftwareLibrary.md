# Software Library

Maslow needs **Gcode** instructions to work.  There are many ways to generate those. Gcode is a human readable programming language that consists of a list of instructions that are sent to a machine to tell it how to move. They are mostly x,y,z coordinates and how to move between them. Instructions include curves, straight lines, and speeds. 3D printers and many other robots use gcode. 


THere are many many options to get to a sucessful Gcode for Maslow4 Some programs can do all of the steps, some can only do one or two. 


Generally a design will start in a program that lets you draw or specify the shapes for your design. There are many options. You could use a **2D Vector drawing** program like Inkscape or Adobe Illustrator or a **three dimensional program** like Blender or Autodesk. 
Key words for these programs are **Vector drawing or Computer Aided Design CAD** programs. Files can be .**svg .stl** but generally not .png or .jpg (bitmap pictures) 


Once you have a mathematcially defined shape, it needs to be translated into Gcode. The programs that can do this are often called **Computer Aided Machining or CAM** programs. Examples are Krabzcam on the web, a wondeful and effective 2 dimensional free project. Autodesk and Autocad can do this too. In these programs you would describe the geometry of the router bit that you are using and the type of operation that you would like to do to the wood, like drilling or a profile cut or a shallow pocket cut and then the program designs a pathway for that particular router bit to leave the wood or material behind that you need as it cuts. The resulting file needs to be a **.nc Gcode file**.  


There are many good programs that can do both authoring and generate machine instructions often called **CAD CAM programs**. (Also slicing into layers for a 3D printer or a stacked CNC design) 
Abundance is a sister project of Maslow that aims to make a procedural genrated design program that can then output meaningful Gcode files all in the web. <https://abundance.maslowcnc.com/>  


There are other odd useful programs like Pepkura Designer that is a specialized program for unfolding 3D polygon shapes into flat panels. It was designed for paper models but it is great for wood as well. What other odd programs have you found useful in generating desgins to cut? 


You can open a Gcode file up in a text editor and edit it by hand if you need to.  You could cut parts out.  Only run half of the program, change distances and speeds all by typing in numbers in the Gcode code system.  It is not hard to learn the basics. (insert Gcode library link) 


# SOFTWARE LIBRARY 
## To add a Program start a new entry with a title started by three ### hash symbols then add pictures, advice and description and links.  Still working on what is a useful format here, use your judgment. If we use the heading system built into markdown it will automatically create a table of contents in the top right corner of the reading pane. 


### Example Program entry heading text
PICTURE
- Overview:
- Links:
- Online, Program download or?:
- Cost:
- Experiences:
- Details:
- Limitations:
- Notes:
- More Pictures:
- Credits:

## ALL IN ONE CAD CAM 

## 2D Vector Design programs

## 3D Design programs

## CAM Gcode machine path 

## Other useful programs
