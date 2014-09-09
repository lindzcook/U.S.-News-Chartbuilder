U.S. News Chartbuilder
----------------------

How to use Chartbuilder
------------------------
###Getting started
If you are not interested in customizing the styles of your charts use the hosted version: http://quartz.github.io/Chartbuilder/

Alternatively: 
####Download via github
1. [Download source](https://github.com/Quartz/Chartbuilder/archive/master.zip) (and unzip)
2. from the terminal navigate to the source folder (on a Mac: `cd ~/Downloads/Chartbuilder-master/`) 
3. Start a webserver run `python -m SimpleHTTPServer`
4. Open Google Chrome, Apple Safari, or Opera and navigate to [http://localhost:8000/](http://localhost:8000/)

#### Install using bower
1. from the terminal `bower install chartbuilder`
2. copy the chartbuilder files to the top directory by running `cp -r bower_components/chartbuilder/* .`
3. compile webfontloader `cd bower_components/webfontloader/; rake compile;`
4. start a webserver `cd ../../; python -m SimpleHTTPServer;`
5. Open Google Chrome, Apple Safari, or Opera and navigate to [http://localhost:8000/](http://localhost:8000/)


###Examples of charts made with Chartbuilder
####Line charts
<img src="http://quartz.github.io/Chartbuilder/images/line1.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/line2.jpeg" />

####Column charts
<img src="http://quartz.github.io/Chartbuilder/images/column1.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/column2.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/column3.jpeg" />

####Bar grids
<img src="http://quartz.github.io/Chartbuilder/images/bargrid1.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/bargrid2.jpeg" />


####Mixed
<img src="http://quartz.github.io/Chartbuilder/images/mixed1.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/mixed2.jpeg?cache=0" />

To-Dos
------------------------
* Add title padding
* Fix Logo on PNG
* Change Axis to the left
* Add label options