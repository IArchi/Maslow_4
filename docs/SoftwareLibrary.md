# Software Library

This file is a place to share software recommendations that have been useful. 

Maslow needs **Gcode** instructions to work.  There are many ways to generate those. Gcode is a human readable programming language that consists of a list of instructions that are sent to a machine to tell it how to move. They are mostly x,y,z coordinates and how to move between them. Instructions include curves, straight lines, and speeds. 3D printers and many other robots use gcode. 


THere are many many options to get to a sucessful Gcode for Maslow4 Some programs can do all of the steps, some can only do one or two. 


Generally a design will start in a program that lets you draw or specify the shapes for your design. You could use a **2D Vector drawing** program like Inkscape or Adobe Illustrator or a **three dimensional program** like Blender or Autodesk. 
Key words for these programs are **Vector drawing or Computer Aided Design CAD** programs. Files can be .**svg .stl** but generally not .png or .jpg (bitmap pictures) 


Once you have a mathematcially defined shape, it needs to be translated into Gcode. The programs that can do this are called **Computer Aided Machining or CAM** programs. Examples are Krabzcam on the web, a wonderful and effective 2 dimensional free project. Autodesk and Autocad can do this too. In these programs you would describe the geometry of the router bit that you are using and the type of operation that you would like to do to the wood, like drilling or a profile cut or a shallow pocket cut and then the program designs a pathway for that particular router bit to leave the wood or material behind that you need as it cuts. The resulting file needs to be a **.nc Gcode file**.  


There are many good programs that can do both authoring and generate machine instructions often called **CAD CAM programs**. 


**Abundance** is a CAD CAM sister project of Maslow that aims to make a procedural genrated design program that can then output meaningful Gcode files all in the web. <https://abundance.maslowcnc.com/>  It is being developed now and is already fun and useful. 


We would like to a Pepkura Designer that is a specialized program for unfolding 3D polygon shapes into flat panels. It was designed for paper models but it is great for wood as well. Three D printers use programs called slicers that cut three dimensional shapes into a stack of 2D slices. Maslow could cut slices in wood or foam to be stacked. What other odd programs have you found useful in generating desgins to cut? 


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
### Abundance
<img width="813" height="682" alt="image" src="https://github.com/user-attachments/assets/42d79add-c997-4589-9ab5-6154c3f2b6c9" />

- Overview: Abundance is a sister project to Maslow. It is in the process of being developed by many of the same people working on Maslow4.  Abundance is built around the idea of procedural design.  Instead of drawing a table, in abundance you would program a table with variables and parts that could rebuilt and remixed. Leg length, top dimension, lumber size can all be variables that can be changed and the end design would be automatically changed as well. Abundance is being designed to work with Maslow as a free online full CAD CAM program so that you could design and then output cutting Gcode .nc files directly. (written 2025) 
- <https://abundance.maslowcnc.com/>
- Online
- Free 
- Experiences: A very different way of designing. It already can produce complex three d models and is a lot of fun to use. 
- Limitations: Still under development. Not a drawing program, a programming program. 
- Notes:
- - Build parts first as "molecules" then make a new project that puts those molecule pieces together.
- - Boolean operations make it easy to have pieces designed separately intersect and define cutting boundaries as you put them together. 
- More Pictures:
- <img width="949" height="769" alt="image" src="https://github.com/user-attachments/assets/37e9b15c-f8d7-4343-a4dc-1faf1bd257e5" />

- Credits: Barbour Smith


## 2D Vector Design programs

### Inkscape
PICTURE<img width="1854" height="1048" alt="Screenshot from 2025-10-26 10-58-50" src="https://github.com/user-attachments/assets/4ec98e9a-0aee-45b4-9187-1475a10595ca" />

- Overview: Free Opensource go to program for Vector drawing. Inkscape is the well supported and developed opensource option for Vector drawing. It would be a great tool for designing a engraved sign or for drawing 2d cuts directly. 
- <https://inkscape.org/>
- Download the program and work on your own computer works on PC, Mac, and Linux. Not on phones or tablets. 
- Free Opensource project
- Experiences:
- - Excellent for 2d editing of .svg files
  - Lots of support videos and tutorials on the web.
  - For CNC gather the lines that you need to be cut in one operation and change them all to a set color.  Most CAM programs will read each color in a .svg file as a different operation. For instance Drilling can be green while profile cutting could be red. 
- Details:
- Limitations:
- - Only 2 D, no good way to put pieces together in 3 D as you design. 
- Notes:
- More Pictures:
- Credits: inkscape.org

## 3D Design programs

## CAM Gcode machine path 

## Other useful programs
