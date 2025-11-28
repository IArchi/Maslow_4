# Maslow Readme for machines version 4 and 4.1 Current through 2025
## Quicklinks:
Website where you can buy a kit and current assembly instrucitons: 
[https://www.maslowcnc.com/](url)
Assembly instructions in wiki:
[https://github.com/MaslowCNC/Maslow_4/tree/Maslow-Main/docs/assembling-the-arms-4-1](url) 
Repository and wiki:
[https://github.com/MaslowCNC/Maslow_4/wiki](url)
Forums:
[https://forums.maslowcnc.com/](url)

This is a rough draft. For more info got to [www.maslow.cnc](url)


![LogoWithR](https://github.com/user-attachments/assets/66afe41d-6827-4a69-80c6-8bc330a144e1)

## INTRO


<img width="2500" height="1875" alt="image" src="https://github.com/user-attachments/assets/ed9fcca8-0106-420d-b355-8df55d405ab9" />


# What is it? 
Maslow is a DIY 3 axis (x,y,z) computer numberical control (CNC) robot that controls a router to cut wood, plastic or other flat material.  It has been designed to work well on a 4x8 foot sheet of material or smaller and it is able to sculpt and cut vertically about 30 cm or 2.5 inches deep.  Maslow is designed around a small sled that carries the router and is anchored to an external frame by long belts that it uses to pull itself around.  This means that the core robot is very portable. It does require a stiff frame or anchors external to the robot.  It rides on top of the work being cut so it works well on cutting and sculpting shallow shapes but not giant bathtub sized hollows. Maslow is focused on accessiblility. 

Maslow's control software is a local website hosted inside the machine that you can access through USBC cable, Wifi direct to the machine, or through your local wifi network. It can be used with a phone or a computer. It recieves standard Gcode machine instruction files (.nc)  You will need cnc design software that can generate Gcode. There are many free or fancy options. 

The control software is built on top of FluidNC an open source cnc control software for ESP32 computers. Maslow4's pcb is an esp32 computer. The FluidNC project wiki is here: 
http://wiki.fluidnc.com/
Github:https://github.com/bdring/FluidNC
Donate to FluidNC:
[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=8DYLB6ZYYDG7Y)


Maslow4 is different from a gantry designed CNC router which are designed around a table that fits the material inside and then the robot moves forward and back on rails. It is much much less expensive than a gantry machine. It is in general less accurate than a good gantry machine. Gantry machines can also be 4 or 5 axis machines in which they can rotate the material in order to cut it at different angles. 


Maslow is a project developed by Barbour Smith and a community of vollunteers and forum members as an open source project that is still under development.  It is portable, exciting, inexpensive and perhaps frustrating and still requires some troubleshooting and figuring out to get started.  Barbour has been working on iterations of this for more than a decade and many people have been successful at making many exciting projects including saunas, tables, signs, and a 30 foot catamaran! (link to project gallery) but it is not at the moment a perfect plug and play tool.  If making your own portable blade weilding robot in an enthusiastic online community sounds fun, then you are probably in the right place. 

<img width="2500" height="1667" alt="image" src="https://github.com/user-attachments/assets/d57a103a-4586-4fb7-8b92-709e616d6aef" />

# History (I don't know a lot here) 
 In ???? (Barbour Smith and ?people?) designed the first Maslow as a wall mounted CNC routing robot that hung from two chains and pulled itself back and forth across a space. The robot at that point was designed around an ?arduino? microcontroller and was an open source design. Barbour set up the forums and github groups and sold ??? machines. 
 
 
 It is still possible to make a Maslow Version 1, 2, or 3 and many people have been happy with them as useful tools. Makermade was a company that sold version ?2? under the open source license that is not affiliated directly with Maslow's developers. 
 
 
 The current version Maslow 4 was prototyped as 3D printed parts with standard hardware. It has four machine belts instead of two chains. The parts are not interchangable with earlier versions. It uses a custom printed circuit board PCB built around an ESP microcontroller. The board also incorporates motor controllers. 
 
 
It is still possible to 3D print your own parts and replacement parts. It is still possible to design and program your own generic ESP microcontroller and use off the shelf motor controlers.  In ?2023? Barbour and ?? ran a succcesful Kickstarter campaign with which they used the proceeds to design and have injection molds made for injection molded parts and better compact custom PCBs. Injection molded parts are much stronger than most 3d printed parts.  This is what you are buying when you buy a Maslow kit. The custom PCB, the custom wires, the motors and custom made hardware, nuts and bolts,  and the injection molded plastics with fiberglass inclusions. 4.1 was the result of a second kickstarter campaign that upgraded the PCB, the nuts and bolts and other metal hardware as well as a better spool design. 

# Community members who have made significant contributions:
bar founder and primary developer
Other people who made the first machine? 

dlang ?Programming?

Ian_ab?Programming? 

# How to get involved
Maslow is a truly open source project. The forums are active with helpers and anybody can add to the discussions there or add to the project here in the github repo.  You can't mess things up here as final commits have to be checked.


/Firmware is edited and developed by volunteers, you can try too, the Github Maslow AI can be asked to change the programming. 


Three D Printing files and parts lists will soon be in the repo for downloading and editing or adapting


/docs holds documentation and instructions.  If you have a good idea to make things more clear or help other people understand the machine you could add something there


To edit a file here navigate to the file you want to edit, click on the little pencil in the top corner and it will open an editing window as a branch of the main repo. The pages are written in markdown language a kind of simple word processor. Markdown instructions are in a link at the bottom of the editing window.  Once you have edited the document you can commit changes and then make a pull request asking for it to be written back to the main branch.  


# Future of the project
Currently the focus is on making the Maslow4 run quickly and smoothly mostly through firmware development. Several community members are playing with different 3d printed adaptations of the main parts.  The goal would be to keep developing the software now and then have an updated hardware kit in several years. (written 2025) 
