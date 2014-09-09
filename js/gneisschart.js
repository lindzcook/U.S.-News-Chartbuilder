
var yAxisIndex;

//add prepend ability
Element.prototype.prependChild = function(child) { this.insertBefore(child, this.firstChild); };

Date.setLocale('en');

//A default configuration 
//Should change to more d3esque methods e.g. http://bost.ocks.org/mike/chart/
Gneiss.defaultGneissChartConfig = {
	container: "#chartContainer", //css id of target chart container
	editable: true, // reserved for enabling or dissabling on chart editing
	lineDotsThreshold: 15, //line charts will have dots on points until a series has this number of points
	dotRadius: 4, //the radius of dots used on line and scatter plots
	bargridLabelMargin: 4, //the horizontal space between a bargrid bar and it's label
	bargridBarThickness: 20, //thickness of the bars in a bargrid
	xAxisMargin: 8, //the vertical space between the plot area and the x axis
	footerMargin: 4, //the vertical space between the bottom of the bounding box and the meta information
	legendLabelSpacingX: 5, //the horizontal space between legend items
	legendLabelSpacingY: 4, //the vertical space between legend items 
	columnGap: 1, //the horizontal space between two columns that have the same x-axis value
	axisBarGap: 5, //the horizontal space between a vertical axis and an adjacent bar
	maxColumnWidth: 7.5, // the maximum width of a column as a percent of the available chart width	primaryAxisPosition: "right", // the first axis will be rendered on this side, "right" or "left" only
	primaryAxisPosition: "left", // the first axis will be rendered on this side, "right" or "left" only
	allowAxisOverlap: false,
	legend: true, // whether or not there should be a legend
	title: "When Approval is Low, More People Vote", // the chart title 
	titleBottomMargin: 5, // the vertical space between the title and the next element (sometimes a legend, sometimes an axis)
	bargridLabelBottomMargin: 5, //the space between the bargrid series label and the top most bar
	colors: ['#a3bfdb','#75a0c8','#4780b6','#1860a4','#15508a','#0d3e70','#062955','#011038',
						'#f5a4ac','#f17783','#ec4959','#e71b30','#bf1426','#9a0917','#760506','#510002',
						'#fbd9ad','#f9c685','#f7b45c','#f5a133','#ca8629','#a26b1b','#7c510b','#543305'], 
	padding :{
		top: 5,
		bottom: 50,
		left: 10,
		right: 10
	},
	xAxis: {
		domain: [0,100],
		prefix: "",
		suffix: "",
		type: "linear",
		formatter: null,
		mixed: true,
		ticks: 5
	},
	yAxis: [
		{
			domain: [null,null],
			tickValues: null,
			prefix: {
				value: "",
				use: "top" //can be "top" "all" "positive" or "negative"
			},
			suffix: {
				value: "",
				use: "top"
			},
			ticks: 4,
			formatter: null,
			color: null
		}
	],
	series: [
		{
			name: "Congressional Job Approval",
			data: [23, 44, 50, 26, 21],
			source: "Some Org",
			type: "line",
			axis: 0,
			color: null
		},
		{
			name: "Voter Turnout",
			data: [41.1, 38.1, 39.5, 40.4, 40.9],
			source: "Some Org",
			type: "line",
			axis: 0,
			color: null
		}
	],
	xAxisRef: [
		{
			name: "names",
			data: ["'94","'98","'02","'06","'10"]
		}
	],
	sourceline: "NAME for USN&WR; Source: Bureau of Labor Statistics",
	creditline: ""
};

Gneiss.dateParsers = {
	"mmddyyyy": function(d) { return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/"); },
	"ddmmyyyy": function(d) { return [d.getDate(), d.getMonth() + 1, d.getFullYear()].join("/"); },
	"mmdd": function(d) { return [d.getMonth() + 1, d.getDate()].join("/"); },
	"Mdd": function(d) {
		var month = d.getMonth() + 1;
		if(month == 5) {
			return d.format('{Mon}') + " " + d.getDate();
		}
		else {
			return d.format('{Mon}.') + " " + d.getDate();
		}
	},
	"ddM": function(d) {
		var month = d.getMonth() + 1;
		if(month == 5) {
			return "" + d.getDate() + " " + d.format('{Mon}');
		}
		else {
			return "" + d.getDate() + " " + d.format('{Mon}.');
		}
	},
	"mmyy": function(d) { return [d.getMonth() + 1, String(d.getFullYear()).split("").splice(2,2).join("")].join("/"); },
	"yy": function(d) { return "’" + String(d.getFullYear()).split("").splice(2,2).join(""); },
	"yyyy": function(d) { return "" + d.getFullYear(); },
	"MM": function(d) {
		var month = d.getMonth() + 1;
		if(month == 1) {
			return "" + d.getFullYear();
		}
		else {
			return d.format('{Month}');
		}
	},
	"M": function(d) {
		var month = d.getMonth() + 1;
		if(month == 1) {
			return "’" + String(d.getFullYear()).split("").splice(2,2).join("");
		}
		else if(month == 5) {
			return d.format('{Mon}');
		}
		else {
			return d.format('{Mon}.');
		}
	},
	"hmm": function(d) {
		if(d.getHours() === 0 && d.getMinutes() === 0) {
			return Gneiss.dateParsers.Mdd(d);
		}

		if(Date.getLocale().code == 'en') {
			return d.format('{12hr}:{mm}{tt}');
		} else {
			return d.format('{24hr}:{mm}{tt}');
		}
	},
	"QJan": function(d) {
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		if (day == 1) {
			if (month == 1) {
				return year;
			}

			if (month == 4 || month == 7 || month == 10) {
				return "Q" + (((month-1) / 3) + 1);
			}

		}

		return "";
	},
	"QJul": function(d) {
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		if (day == 1) {
			if (month == 7) {
				return year;
			}

			if (month == 1) {
				return "Q3";
			}

			if (month == 4) {
				return "Q4";
			}

			if (month == 10) {
				return "Q2";
			}
			
		}

		return "";

	}
};

Gneiss.helper = {
  multiextent: function(a, key) {
    // Find the min and max values of multiple arrays
    var data = [];
    var ext;
    
    for (var i = a.length - 1; i >= 0; i--) {
      ext = d3.extent(key ? key(a[i]) : a[i]);
      data.push(ext[0]);
      data.push(ext[1]);
    }
    
    return d3.extent(data);
  },
  columnXandHeight: function(d, domain) {
    //a function to find the proper value to cut off a column
    if(d > 0 && domain[0] > 0) {
      return domain[0];
    }
    else if (d < 0 && domain[1] < 0) {
      return domain[1];
    }
    return 0;
  },
  exactTicks: function(domain,numticks) {
    numticks -= 1;
    var ticks = [];
    var delta = domain[1] - domain[0];
    for (var i=0; i < numticks; i++) {
      ticks.push(domain[0] + (delta/numticks)*i);
    }
    ticks.push(domain[1]);
    
    if(domain[1]*domain[0] < 0) {
      //if the domain crosses zero, make sure there is a zero line
      var hasZero = false;
      for (var i = ticks.length - 1; i >= 0; i--) {
        //check if there is already a zero line
        if(ticks[i] == 0) {
          hasZero = true;
        }
      }
      if(!hasZero) {
        ticks.push(0);
      }
    }
    
    return ticks;
  }, 
  transformCoordOf: function(elem){
    var separator = elem.attr("transform").indexOf(",") > -1 ? "," : " ";
    var trans = elem.attr("transform").split(separator);
    return { x: (trans[0] ? parseFloat(trans[0].split("(")[1]) : 0), y: (trans[1] ? parseFloat(trans[1].split(")")[0] ): 0) };
  }
};

function Gneiss(config)
{	
	var containerElement;
	var chartElement;
	var titleElement;
	var footerElement;
	var sourceElement;
	var creditElement;
	
	var defaultPadding;
	var containerId;
	var seriesByType;
	var width;
	var height;
	var isBargrid;
	var hasColumns = false;
	var title;
	var sourceLine;
	var creditLine;
	var legend;
	var colors;
	var xAxis;
	var yAxis;
	var series;
	var xAxisRef;

	var lineDotsThreshold;
	var dotRadius;
	var bargridLabelMargin;
	var bargridBarThickness;
	var xAxisMargin;
	var footerMargin;
	var primaryAxisPosition;
	var legendLabelSpacingX;
	var legendLabelSpacingY;
	var columnGap;
	var maxColumnWidth;
	var titleBottomMargin;
	var bargridLabelBottomMargin;
	var axisBarGap;
	var allowAxisOverlap;
	
	
	var columnWidth;
	var columnGroupWidth;
	var columnGroupShift;
			
	this.containerId = function Gneiss$containerId(elem) {
		if (!arguments.length) {
			return containerId;
		}
		containerId = elem;
	};
	
	this.containerElement = function Gneiss$containerElement(elem) {
		if (!arguments.length) {
			return containerElement;
		}
		containerElement = elem;
	};
	
	this.footerElement = function Gneiss$footerElement(elem) {
		if (!arguments.length) {
			return footerElement;
		}
		footerElement = elem;
	};
	
	this.sourceElement = function Gneiss$sourceElement(elem) {
		if (!arguments.length) {
			return sourceElement;
		}
		sourceElement = elem;
	};
	
	this.creditElement = function Gneiss$creditElement(elem) {
		if (!arguments.length) {
			return creditElement;
		}
		creditElement = elem;
	};
	
	this.defaultPadding = function Gneiss$defaultPadding(p) {
		if (!arguments.length) {
			return defaultPadding;
		}
		defaultPadding = p;
	};
	
	this.padding = function Gneiss$padding(p) {
		if (!arguments.length) {
			return padding;
		}
		padding = p;
	};
	
	this.width = function Gneiss$width(w) {
		if (!arguments.length) {
			return width;
		}
		width = w;
	};
	
	this.height = function Gneiss$height(h) {
		if (!arguments.length) {
			return height;
		}
		height = h;
	};
	
	this.seriesByType = function Gneiss$seriesByType(sbt) {
		if (!arguments.length) {
			return seriesByType;
		}
		seriesByType = sbt;
	};
	
	this.isBargrid = function Gneiss$isBargrid(b) {
		if (!arguments.length) {
			return isBargrid;
		}
		isBargrid = b;
	};
	
	this.title = function Gneiss$title(t) {
		if (!arguments.length) {
			return title;
		}
		title = t;
	};	
	
	this.titleElement = function Gneiss$titleElement(elem) {
		if (!arguments.length) {
			return titleElement;
		}
		titleElement = elem;
	};
	
	this.source = function Gneiss$sourceLineText(s) {
		if (!arguments.length) {
			return source;
		}
		source = s;
	};
	
	this.credit = function Gneiss$credit(c) {
		if (!arguments.length) {
			return credit;
		}
		credit = c;
	};
	
	this.legend = function Gneiss$legend(l) {
		if (!arguments.length) {
			return legend;
		}
		legend = l;
	};
	
	this.colors = function Gneiss$colors(c) {
		if (!arguments.length) {
			return colors;
		}
		colors = c;
	};
		
	this.chartElement = function Gneiss$chartElement(c) {
		if (!arguments.length) {
			return chartElement;
		}
		chartElement = c;
	};
		
	this.xAxis = function Gneiss$xAxis(x) {
		if (!arguments.length) {
			return xAxis;
		}
		xAxis = x;
	};
	
	this.xAxisRef = function Gneiss$xAxisRef(x) {
		if (!arguments.length) {
			return xAxisRef;
		}
		xAxisRef = x;
	};
		
	this.yAxis = function Gneiss$yAxis(y) {
		if (!arguments.length) {
			return yAxis;
		}
		yAxis = y;
	};
		
	this.series = function Gneiss$series(s) {
		if (!arguments.length) {
			return series;
		}
		series = s;
	};
	
	this.columnWidth = function Gneiss$columnWidth(w) {
		if (!arguments.length) {
			return columnWidth;
		}
		columnWidth = w;
	};
	
	this.columnGroupWidth = function Gneiss$columnGroupWidth(w) {
		if (!arguments.length) {
			return columnGroupWidth;
		}
		columnGroupWidth = w;
	};
	
	this.columnGroupShift = function Gneiss$columnGroupShift(w) {
		if (!arguments.length) {
			return columnGroupShift;
		}
		columnGroupShift = w;
	};


	this.lineDotsThreshold = function Gneiss$lineDotsThreshold(n) {
		if (!arguments.length) {
			return lineDotsThreshold;
		}
			lineDotsThreshold = n;
	};

	this.dotRadius = function Gneiss$dotRadius(n) {
		if (!arguments.length) {
			return dotRadius;
		}
			dotRadius = n;
	};

	this.bargridLabelMargin = function Gneiss$bargridLabelMargin(n) {
		if (!arguments.length) {
			return bargridLabelMargin;
		}
			bargridLabelMargin = n;
	};

	this.bargridBarThickness = function Gneiss$bargridBarThickness(n) {
		if (!arguments.length) {
			return bargridBarThickness;
		}
			bargridBarThickness = n;
	};

	this.xAxisMargin = function Gneiss$xAxisMargin(n) {
		if (!arguments.length) {
			return xAxisMargin;
		}
			xAxisMargin = n;
	};

	this.footerMargin = function Gneiss$footerMargin(n) {
		if (!arguments.length) {
			return footerMargin;
		}
		footerMargin = n;
	};

	this.primaryAxisPosition = function Gneiss$primaryAxisPosition(n) {
		if (!arguments.length) {
			return primaryAxisPosition;
		}
			primaryAxisPosition = n;
	};

	this.legendLabelSpacingX = function Gneiss$legendLabelSpacingX(n) {
		if (!arguments.length) {
			return legendLabelSpacingX;
		}
			legendLabelSpacingX = n;
	};

	this.legendLabelSpacingY = function Gneiss$legendLabelSpacingY(n) {
		if (!arguments.length) {
			return legendLabelSpacingY;
		}
			legendLabelSpacingY = n;
	};

	this.columnGap = function Gneiss$columnGap(n) {
		if (!arguments.length) {
			return columnGap;
		}
			columnGap = n;
	};

	this.maxColumnWidth = function Gneiss$maxColumnWidth(n) {
		if (!arguments.length) {
			return maxColumnWidth;
		}
			maxColumnWidth = n;
	};

	this.titleBottomMargin = function Gneiss$titleBottomMargin(n) {
		if (!arguments.length) {
			return titleBottomMargin;
		}

		titleBottomMargin = n;
	};

	this.bargridLabelBottomMargin = function Gneiss$bargridLabelBottomMargin(n) {
		if (!arguments.length) {
			return bargridLabelBottomMargin;
		}

		bargridLabelBottomMargin = n;
	};

	this.axisBarGap = function Gneiss$axisBarGap(n) {
		if(!arguments.length) {
			return axisBarGap;
		}

		axisBarGap = n;
	};

	this.allowAxisOverlap = function Gneiss$allowAxisOverlap(b) {
		if(!arguments.length) {
			return allowAxisOverlap;
		}

		allowAxisOverlap = b;
	};

	this.hasColumns = function Gneiss$hasColumns(b) {
		if(!arguments.length) {
			return hasColumns;
		}

		hasColumns = b;
	};
	
	this.build = function Gneiss$build(config) {
		/*
			Initializes the chart from a config object
		*/
		
		if(!config) {
			throw new Error("build() must be called with a chart configuration");
		}
		
		var g = this;
		 
		// Set container as a jQuery object wrapping the DOM element specified in the config
		if(!config.container) {
			throw new Error("build() must be called with a chart configuration with a 'container' property");
		}
		
		// Deep copy the config data to prevent side effects
		g.containerId(config.container.slice());
		g.containerElement( $(g.containerId() ));
		g.title(config.title.slice());
		g.source(config.sourceline.slice());
		g.credit(config.creditline.slice());
		g.legend(config.legend === true ? true : false);
		g.colors($.extend(true, [], config.colors));
		g.xAxis($.extend(true, {}, config.xAxis));
		g.xAxisRef($.extend(true, [], config.xAxisRef));
		g.yAxis($.extend(true, [], config.yAxis));
		g.series($.extend(true, [], config.series));
		g.defaultPadding($.extend(true, {}, config.padding));
		g.padding($.extend(true, {}, config.padding));
		g.lineDotsThreshold(config.lineDotsThreshold *1);
		g.dotRadius(config.dotRadius *1);
		g.bargridLabelMargin(config.bargridLabelMargin *1);
		g.bargridBarThickness(config.bargridBarThickness *1);
		g.xAxisMargin(config.xAxisMargin * 1);
		g.footerMargin(config.footerMargin * 1);
		g.primaryAxisPosition(config.primaryAxisPosition.slice());
		g.legendLabelSpacingX(config.legendLabelSpacingX *1);
		g.legendLabelSpacingY(config.legendLabelSpacingY * 1);
		g.columnGap(config.columnGap * 1);
		g.maxColumnWidth(config.maxColumnWidth * 1);
		g.titleBottomMargin(config.titleBottomMargin * 1);
		g.bargridLabelBottomMargin(config.bargridLabelBottomMargin *1);
		g.axisBarGap(config.axisBarGap * 1);
		g.allowAxisOverlap(config.allowAxisOverlap);
		


		//append svg to container using svg
		g.chartElement(d3.select(g.containerId()).append("svg")
			.attr("id","chart")
			.attr("width","100%") //set width to 100%
			.attr("height","100%")); //set height to 100%
			
		g.width(g.containerElement().width()); //save the width in pixels
		g.height(g.containerElement().height()); //save the height in pixels
		
		//add rect, use as a background to prevent transparency
		g.chartElement().append("rect")
			.attr("id","ground")
			.attr("width", g.width())
			.attr("height", g.height());
			
		//add a rect to allow for styling of the chart area
		g.chartElement().append("rect")
			.attr("id","plotArea")
			.attr("width", g.width())
			.attr("height", g.height());
		
		//group the series by their type
		g.seriesByType(this.splitSeriesByType(g.series()));
		this.updateGraphPropertiesBasedOnSeriesType(g, g.seriesByType());
		
		g.titleElement(g.chartElement().append("text")
			.attr("y",18)
			.attr("x", g.padding().left)
			.attr("id","titleLine")
			.text(g.title()));
		
		this.calculateColumnWidths()
			.setYScales()
			.setXScales()
			.setYAxes(true)
			.setXAxis(true);
				
		this.drawSeriesAndLegend(true);
		g.footerElement(g.chartElement().append("g")
			.attr("id", "metaInfo")
			.attr("height", 30)
			.attr("transform", "translate(0," + (g.height() - g.footerMargin()) + ")"));

		g.sourceElement(g.footerElement().append("text")
			.attr("text-anchor", "end")
			.attr("x", g.width() - g.padding().right)
			.attr("class", "metaText")
			.text(g.source()));

		g.creditElement(g.footerElement().append("svg:image")
			.attr("x", -5)
			.attr("y", -9)
			.attr("xlink:href", "data:image/png;base64,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")
			.attr("width", 96)
			.attr("height", 13)
			.attr("class", "logoImage"));

		return this;
	};
  
	this.numberFormat = d3.format(",");
  
	this.resize = function Gneiss$resize(){
		/*
			Adjusts the size dependent stored variables
		*/
		var g = this;
    
		// Save the width and height in pixels
		g.width(g.containerElement().width());
		g.height(g.containerElement().height());
    
		// Insert a background rectangle to prevent transparency
		d3.select("rect#ground")
			.attr("width", g.width())
			.attr("height", g.height());

		//insert a background rectagle to style the plot area
		d3.select("rect#plotArea")
			.attr("transform","translate("+g.padding().left+","+g.padding().top+")")
			.attr("width",g.width()-g.padding().left-g.padding().right)
			.attr("height",g.height()-g.padding().top-g.padding().bottom);
      
		g.footerElement().attr("transform","translate(0," + (g.height() - g.footerMargin()) + ")");
		
		return this;
	};
  
  this.setYScales = function Gneiss$setYScales() {
		/*
		* Calculate and store the left and right y-axis scale information
		*/
    
		var g = this;
		var y = g.yAxis();
		var p = g.padding();
		var series = g.series()
		var calculatedDomain

		for (var i = series.length - 1; i >= 0; i--) {
			// Plot this series against the right y-axis if no axis has been defined yet
			if(series[i].axis === undefined) {
				series[i].axis = 0;
			}
			
			// This useLowestValueInAllSeries flag changes the independence
			// of the y-axii significantly.
			//
			// Setting it to true means that the extents for the right y-axis
			// use the smallest number in any series that will be graphed on either
			// axis, regardless of whether or not the series containing that value
			// is graphed against the right y-axis or not. 
			//
			// Setting it to false results in completely independent axii such that
			// the extents are determined only by the values in the series charted 
			// against the axis in question. The right y-axis extents will be
			// dependent only on series graphed against the right y-axis.
			var useLowestValueInAllSeries = false;
			
			if(y[i]) {
				calculatedDomain = Gneiss.helper.multiextent(g.series(), function(a) {
					if(a.axis === i || (useLowestValueInAllSeries && i == 0)) {
						// This series is charted against this axis 
						// OR
						// This is the right y-axis and it should be rooted at
						// the lowest value in any series regardless of axis
						return a.data;
					}
					return [];
				})

				for (var j = y[i].domain.length - 1; j >= 0; j--) {
					if(y[i].domain[j] === null) {
						// only use the calculated domain limit if one isn't specified
						y[i].domain[j] = calculatedDomain[j];
					}
				}

				if(g.isBargrid()) {
					y[i].domain[0] = Math.min(y[i].domain[0], 0);
				}
			}
		}
					
		//set extremes in y axis objects and create scales
		for (var i = y.length - 1; i >= 0; i--){
			if(!y[i].scale) {
				y[i].scale = d3.scale.linear();
			}
			y[i].scale.domain(y[i].domain);
		}
				
		if(g.isBargrid()) {
			var width = (g.width() / g.seriesByType().bargrid.length) - p.right;
			for (var i = y.length - 1; i >= 0; i--) {
				y[i].scale.range([p.left, width]).nice();				
			}
		}
		else {
			for (var i = y.length - 1; i >= 0; i--) {
				y[i].scale.range([g.height() - p.bottom, p.top]).nice();
			}
		}
		
		return this;
	};
  
	this.setPadding = function Gneiss$setPadding() {
		/*
			calulates and stores the proper amount of extra padding beyond what the user specified (to account for axes, titles, legends, meta)
		*/
		var g = this,
			padding_top = g.defaultPadding().top,
			padding_bottom = g.defaultPadding().bottom,
			padding_left = g.defaultPadding().left,
			padding_right = g.defaultPadding().right;
		
		//Add the height of the title line to the padding, if the title line has a height
		//Add the height of the axis label if there is no title
		title_height = g.titleElement()[0][0].getBoundingClientRect().height;
		axis_label_height = d3.selectAll(".yAxis text")[0][0].getBoundingClientRect().height;

		padding_top += title_height > 0? title_height + g.titleBottomMargin() : axis_label_height + g.titleBottomMargin();
		
		//if there is more than one axis or the default axis is on the left and it isn't a bar grid
		//add enough space for the top axis label
		padding_top += ( g.yAxis().length > 1 || g.primaryAxisPosition == "left" ) ? axis_label_height + g.titleBottomMargin() : 0 ;
		

		//if there is a legend and there is more than one series
		padding_top += (g.legend() && g.series().length > 1 )  ? g.legendLabelSpacingY() : 0 ;

		//if there is a legend and there is more than one series and a title and it's not a bargrid
		try {
			padding_top += ( g.legend() && g.series().length > 1 && g.title().length != 0 && !g.isBargrid() ) ? d3.selectAll("g.legendItem")[0][0].getBoundingClientRect().height : 0 ;
		}catch(e){/* this happens when switching from a bargrid back to a standard chart*/}
		//if this is a bargrid add padding to account for the series label
		if (g.isBargrid()) {
			try {
				padding_top += d3.selectAll(".bargridLabel")[0][0].getBoundingClientRect().height + g.bargridLabelBottomMargin() - g.bargridBarThickness()/2;
			} catch(e) {/* A race condition that doesn't matter was met, setPadding will be called again and everything will be okay*/}

			try {
				padding_top += g.titleElement().text().length != 0 ? title_height + g.titleBottomMargin() : 0
			} catch(e) {/* A race condition that doesn't matter was met, setPadding will be called again and everything will be okay*/}
		}
		
		g.padding().top = padding_top;
		g.padding().bottom = padding_bottom;
		
		
			
		return this;
	};
  
  this.setXScales = function Gneiss$setXScales() {
		/*
		* Calculate and store the x-axis scale information
		*/
		
		var g = this;
		var x = g.xAxis();
		var data = g.xAxisRef()[0].data;
		var p = g.padding();

		// Calculate extremes of x-axis
		if(x.type == "date") {
			var dateExtent = d3.extent(data);
			
			// Create a linear scale with date keys between the input start and end dates
			x.scale = d3.time.scale().domain(dateExtent);
		}
		else {
			// Create a ordinal scale with with row name keys
			x.scale = d3.scale.ordinal().domain(data);
		}
		
		// Set the range of the x-axis
		var rangeArray = [];
		var left;
		var right;
		
		if(g.isBargrid()) {
			rangeArray = [p.top, g.height() - p.bottom];
		}
		else if(g.hasColumns()) {
			var halfColumnWidth = g.columnGroupWidth() / 2;

			left = p.left + halfColumnWidth + ((g.yAxis().length == 1) ? 0 : d3.selectAll("#leftAxis.yAxis g:not(.topAxisItem) text")[0].pop().getBoundingClientRect().width + g.axisBarGap());
			right = g.width() - p.right - d3.selectAll("#rightAxis.yAxis g:not(.topAxisItem) text")[0].pop().getBoundingClientRect().width - halfColumnWidth - g.axisBarGap();
			rangeArray = [left,right];
		}
		else if(!g.allowAxisOverlap()) {
			try {
				left = p.left + ((g.yAxis().length == 1) ? 0 : d3.selectAll("#leftAxis.yAxis g:not(.topAxisItem) text")[0].pop().getBoundingClientRect().width);
				right = g.width() - p.right - d3.selectAll("#rightAxis.yAxis g:not(.topAxisItem) text")[0].pop().getBoundingClientRect().width - g.dotRadius();
				rangeArray = [left,right];
			}
			catch(e){
				//the this happens when the axis hasn't been created yet
				rangeArray = [p.left, g.width() - p.right];
			}

		}
		else {
			rangeArray = [p.left, g.width() - p.right];
		}

		if(x.type == "date") {
			x.scale.range(rangeArray);
		}
		else {
			//defaults to ordinal
			x.scale.rangePoints(rangeArray);
		}

		return this;
	};
  
  this.setLineMakers = function Gneiss$setLineMakers(first) {
		var g = this;

		for (var i = g.yAxis().length - 1; i >= 0; i--){
			if(first || !g.yAxis()[i].line) {
				g.yAxis()[i].line = d3.svg.line();
			}

			g.yAxis()[i].line.y(function(d,j){ return d || d === 0 ? g.yAxis()[yAxisIndex].scale(d) : null });
			g.yAxis()[i].line.x(function(d,j){ return d || d === 0 ? g.xAxis().scale(g.xAxisRef()[0].data[j]) : null });

		}
		return this;
	};
  
  this.setYAxes = function Gneiss$setYAxes(first) {
		/*
		*
		* Y-Axis Drawing Section
		*
		*/
		var g = this;
		var curAxis;
		var axisGroup;
		
		//CHANGE
		if(g.yAxis().length == 1 ){
			d3.select("#leftAxis").remove();
		}

		for (var i = g.yAxis().length - 1; i >= 0; i--){
			curAxis = g.yAxis()[i];
			
			//create svg axis
			if(first || !g.yAxis()[i].axis) {
				curAxis.axis = d3.svg.axis()
					.scale(g.yAxis()[i].scale)
					.orient(i == 0 ? "right" : "left" )
					.tickSize(g.width() - g.padding().left - g.padding().right)
					//.ticks(g.yAxis()[0].ticks) // I'm not using built in ticks because it is too opinionated
					.tickValues(g.yAxis()[i].tickValues?curAxis.tickValues:Gneiss.helper.exactTicks(curAxis.scale.domain(),g.yAxis()[0].ticks))
					
				//append axis container

				axisGroup = g.chartElement().append("g")
					.attr("class","axis yAxis")
					.attr("id",i == 0 ? "rightAxis" : "leftAxis" )
					.attr("transform",i == 0 ? "translate("+g.padding().left+",0)" : "translate("+( g.width()-g.padding().right)+",0)" )
					.call(curAxis.axis);
			}
			else {
				curAxis.axis//.ticks(`)[0].ticks) // I'm not using built in ticks because it is too opinionated
					.tickValues(curAxis.tickValues?curAxis.tickValues:Gneiss.helper.exactTicks(curAxis.scale.domain(),g.yAxis()[0].ticks));
					
				axisGroup = g.chartElement().selectAll(i == 0 ? "#rightAxis" : "#leftAxis")
					.call(curAxis.axis);
				
			}
				
			//adjust label position and add prefix and suffix
			var topAxisLabel, minY = Infinity;
			
			this.customYAxisFormat(axisGroup, i);
			
			
			axisGroup
				.selectAll("g")
				.each(function(d,j) {
					//create an object to store axisItem info
					var axisItem = {
						"item": d3.select(this).classed("topAxisItem",false)
					};
					
					//store the position of the topAxisItem
					//(figure it out by parsing the transfrom attribute)
					axisItem.y = parseFloat(axisItem.item
						.attr("transform")
							.split(")")[0]
								.split(",")[1]
						);
					
					//store the text element of the axisItem
					axisItem.text = d3.select(this).select("text");

					//store the line element of the axisItem	
					axisItem.line = d3.select(this).select("line")
						.attr("stroke","#E6E6E6");
						
					
					//apply the prefix as appropriate
					switch(curAxis.prefix.use) {
						case "all":
							//if the prefix is supposed to be on every axisItem label, put it there
							axisItem.text.text(curAxis.prefix.value + axisItem.text.text());
						break;
						
						case "positive":
							//if the prefix is supposed to be on positive values and it's positive, put it there
							if(parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text());
							}
						break;
						
						case "negative":
							//if the prefix is supposed to be on negative values and it's negative, put it there
							if(parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text());
							}
						break;
						
						case "top":
							//do nothing
						break;
					}
					
					//apply the suffix as appropriate
					switch(curAxis.suffix.use) {
						case "all":
							//if the suffix is supposed to be on every axisItem label, put it there
							axisItem.text.text(axisItem.text.text() + curAxis.suffix.value);
						break;

						case "positive":
							//if the suffix is supposed to be on positive values and it's positive, put it there
							if(parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value);
							}
						break;

						case "negative":
							//if the suffix is supposed to be on negative values and it's negative, put it there
							if(parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value);
							}
						break;

						case "top":
							//do nothing
						break;
					}
					
					//find the top most axisItem
					//store its text element
					if(axisItem.y < minY) {
						topAxisLabel = axisItem.text;
						g.topAxisItem = axisItem;
						minY = axisItem.y;
					}
					
					
					if(parseFloat( axisItem.text.text() ) == 0) {
						if(d == 0) {
							//if the axisItem represents the zero line
							//change it's class and make sure there's no decimal
							d3.select(this).classed("zero", true);
							axisItem.text.text("0");
						}
						else {
							// A non-zero value was rounded into a zero
							// hide the whole group
							d3.select(this).style("display","none");
						}
						
					}
				});
			
			//class the top label as top
			g.topAxisItem.item.classed("topAxisItem",true);

			//add the prefix and suffix to the top most label as appropriate
			if(curAxis.suffix.use == "top" && curAxis.prefix.use == "top") {
				//both preifx and suffix should be added to the top most label
				if(topAxisLabel) {
					topAxisLabel.text(g.yAxis()[i].prefix.value + topAxisLabel.text() + g.yAxis()[i].suffix.value);
				}
				else {
					
				}
				
			}
			else if (curAxis.suffix.use == "top") {
				//only the suffix should be added (Because the prefix is already there)
				topAxisLabel.text(topAxisLabel.text() + g.yAxis()[i].suffix.value);
			}
			else if(curAxis.prefix.use == "top") {
				//only the prefix should be added (Because the suffix is already there)
				topAxisLabel.text(g.yAxis()[i].prefix.value + topAxisLabel.text());
			}
			
		}
		
		try{
			//the title will always be the same distance from the top, and will always be the top most element
			g.titleElement().attr("y",g.defaultPadding().top + g.titleElement()[0][0].getBoundingClientRect().height);
		}catch(e){/* There isn't a title element and I dont care to let you know */}

		if(g.isBargrid()){
			//if it's a bargrid turn off the yAxis
			d3.selectAll(".yAxis").style("display","none");
		}
		else {
			//isn't a bargrid so set the yAxis back to the default display prop
			d3.selectAll(".yAxis").style("display",null);
		}

		d3.selectAll(".yAxis").each(function(){this.parentNode.prependChild(this);});
		d3.selectAll("#plotArea").each(function(){this.parentNode.prependChild(this);});
		d3.selectAll("#ground").each(function(){this.parentNode.prependChild(this);});
		
		
		return this;
	};
  
	this.customYAxisFormat = function Gneiss$customYAxisFormat(axisGroup, i) {
		var g = this;
		
		axisGroup.selectAll("g")
			.each(function(d,j) {
				//create an object to store axisItem info
				var axisItem = {};
				
				//store the position of the axisItem
				//(figure it out by parsing the transfrom attribute)
				axisItem.y = parseFloat(d3.select(this)
					.attr("transform")
						.split(")")[0]
							.split(",")[1]
					);
				
				//store the text element of the axisItem
				//align the text right position it on top of the line
				axisItem.text = d3.select(this).select("text")
					.attr("text-anchor",i == 0 ? "end" : "start")
					.attr("fill",i==0 ? "#666666" : g.yAxis()[i].color)
					.attr("x",function(){var elemx = Number(d3.select(this).attr("x")); return i == 0 ? elemx-3 : elemx+3; }) //CHANGE - MAGIC NUMBER (maybe?)
					.attr("y",-9);
			});
	};
  
  this.setXAxis = function Gneiss$setXAxis(first) {
		var g = this;

		if(first) {
			/*
			*
			* X-Axis Drawing Section
			*
			*/
			g.xAxis().axis = d3.svg.axis()
				.scale(g.xAxis().scale)
				.orient(g.isBargrid() ? "left" : "bottom")
				.tickFormat(g.xAxis().formatter ? Gneiss.dateParsers[g.xAxis().formatter] : function(d) {return d;})
				.ticks(g.xAxis().ticks);

				if(g.xAxis().type == "date") {
					if(g.xAxis().ticks === null || !isNaN(g.xAxis().ticks)) {
						//auto suggest the propper tick gap
						var timeSpan = g.xAxis().scale.domain()[1]-g.xAxis().scale.domain()[0],
										months = timeSpan/2592000000,
										years = timeSpan/31536000000,
										days = timeSpan/86400000;
									
						if(years > 30) {
							yearGap = 10;
						}
						if(years > 15) {
							yearGap = 5;
						}
						else {
							yearGap = 1;
						}

						if(days > 2) {
							hourGap = 6;
						}
						else if (days > 1) {
							hourGap = 4;
						}
						else {
							hourGap = 1;
						}

						switch(g.xAxis().formatter) {
							case "yy":
								g.xAxis().axis.ticks(d3.time.years,yearGap);
							break;

							case "yyyy":
								g.xAxis().axis.ticks(d3.time.years,yearGap);
							break;

							case "MM":
								g.xAxis().axis.ticks(d3.time.months,1);
							break;

							case "M":
								g.xAxis().axis.ticks(d3.time.months,1);
							break;

							case "YY":
								g.xAxis().axis.ticks(d3.time.years,1);
							break;

							case "QJan":
								g.xAxis().axis.ticks(d3.time.months,3);
							break;

							case "QJul":
								g.xAxis().axis.ticks(d3.time.months,3);
							break;

							case "hmm":
								g.xAxis().axis.ticks(d3.time.hour,hourGap)
							break
						}
					}
					else if(g.xAxis().ticks instanceof Array) {
						//use the specified tick gap
						var gap,
							gapString = g.xAxis().ticks[1], 
							num = parseInt(g.xAxis().ticks[0]);
							
							if((/hour/i).text(gapString)) {
								gap = d3.time.hour
							}
							if((/day/i).test(gapString)) {
								gap = d3.time.hour;
							}
							else if((/week/i).test(gapString)) {
								gap = d3.time.day;
							}
							else if((/month/i).test(gapString)) {
								gap = d3.time.months;
							}
							else if((/year/i).test(gapString)) {
								gap = d3.time.years;
							}
						g.xAxis().axis.ticks(gap,num);
					}
					else {
						throw new Error("xAxis.ticks set to invalid date format");
					}
				}
			
			g.chartElement().append("g")
				.attr("class",'axis')
				.attr("id","xAxis")
				.attr("transform",g.isBargrid() ? "translate(" + g.padding().left + ",0)" : "translate(0," + (g.height() - g.padding().bottom + g.xAxisMargin()) + ")")
				.call(g.xAxis().axis);			
		}
		else {
			//not first
			g.xAxis().axis.scale(g.xAxis().scale)
				.tickFormat(g.xAxis().formatter ? Gneiss.dateParsers[g.xAxis().formatter] : function(d) { return d; })
				.ticks(g.isBargrid() ? g.series()[0].data.length : g.xAxis().ticks)
				.orient(g.isBargrid() ? "left" : "bottom");


			if(g.xAxis().type == "date") {
				if(g.xAxis().ticks === null || !isNaN(g.xAxis().ticks)) {
					//auto suggest the propper tick gap
					var timeSpan = g.xAxis().scale.domain()[1]-g.xAxis().scale.domain()[0],
									months = timeSpan/2592000000,
									years = timeSpan/31536000000,
									days = timeSpan/86400000,
									hours = timeSpan/3600000,
									minutes = timeSpan/60000;
								
					if(years > 30) {
						yearGap = 10;
					}
					if(years > 15) {
						yearGap = 5;
					}
					else {
						yearGap = 1;
					}


					if(days > 2) {
						hourGap = 6;
					}
					else if (days >= 1) {
						hourGap = 4;
					}
					else if (hours > 7) {
						hourGap = 4;
					}
					else if (hours > 1){
						hourGap = 1;
					}

					console.log(hours, hourGap);


					switch(g.xAxis().formatter) {
						case "yy":
							g.xAxis().axis.ticks(d3.time.years,yearGap);
						break;

						case "yyyy":
							g.xAxis().axis.ticks(d3.time.years,yearGap);
						break;

						case "MM":
							g.xAxis().axis.ticks(d3.time.months,1);
						break;

						case "M":
							g.xAxis().axis.ticks(d3.time.months,1);
						break;

						case "YY":
							g.xAxis().axis.ticks(d3.time.years,1);
						break;

						case "QJan":
							g.xAxis().axis.ticks(d3.time.months,3);
						break;

						case "QJul":
							g.xAxis().axis.ticks(d3.time.months,3);
						break;

						case "hmm":
							g.xAxis().axis.ticks(d3.time.hours,hourGap);
						break
					}
				}
				else if(g.xAxis().ticks instanceof Array) {
					var gap;
					var gapString = g.xAxis().ticks[1];
					var num = parseInt(g.xAxis().ticks[0],10);

						if( (/hour/i).test(gapString) ) {
							gap = d3.time.hours;
						}
						else if((/day/i).test(gapString)) {
							gap = d3.time.days;
						}
						else if((/week/i).test(gapString)) {
							gap = d3.time.weeks;
						}
						else if((/month/i).test(gapString)) {
							gap = d3.time.months;
						}
						else if((/year/i).test(gapString)) {
							gap = d3.time.years;
						}
					g.xAxis().axis.ticks(gap,num);
				}
				else {
					throw new Error("xAxis.ticks set to invalid date format");
				}
			}
			
			g.chartElement().selectAll("#xAxis")
				.attr("transform",g.isBargrid() ? "translate(" + g.padding().left + ",0)" : "translate(0," + (g.height() - g.padding().bottom + g.xAxisMargin()) + ")")
				.call(g.xAxis().axis);
		}
		
		g.chartElement().selectAll("#xAxis text")
			.attr("text-anchor", g.xAxis().type == "date" ? (g.seriesByType().column.length>0 && g.seriesByType().line.length == 0 && g.seriesByType().scatter.length == 0 ? "middle" : "start"): (g.isBargrid() ? "end" : "middle"))
			//.attr("text-anchor", g.isBargrid ? "end":"middle")
			.each(function() {
				var pwidth = this.parentNode.getBoundingClientRect().width
				var attr = this.parentNode.getAttribute("transform")
				var attrx = Number(attr.split("(")[1].split(",")[0])
				var attry = Number(attr.split(")")[0].split(",")[1])
				if(!g.isBargrid()) {
					// fix labels to not fall off edge when not bargrid
					if (pwidth + attrx >  g.width()) {
						this.setAttribute("x",Number(this.getAttribute("x"))-(pwidth + attrx -  g.width() + g.padding().right))
						this.setAttribute("text-anchor","start")
					}
					else if (attrx - pwidth < 0) {
						this.setAttribute("text-anchor","start")
					}
					g.padding().left = g.defaultPadding().left
				}
				else {
					//adjust padding for bargrid
					if(g.padding().left - pwidth < g.defaultPadding().left) {
						g.padding().left = pwidth + g.defaultPadding().left;
						g.redraw() //CHANGE (maybe)
					}
					
				}
			});
		
			
      
		return this;
	};
  
  this.calculateColumnWidths = function Gneiss$calculateColumnWidths() {
		/*
		 * Calculate the proper width for columns in column charts
		*/
		
		var g = this;
		var x = g.xAxis();
		var data = g.xAxisRef()[0].data;
		var numColumnSeries = g.seriesByType().column.length;
		
		if(numColumnSeries === 0) {
			return this;
		}
		
		var numDataPoints = 0;
				
		// Calculate the number of data points based on x-axis extents
		if(x.type == "date") {
			var dateExtent = d3.extent(data);
					
			// Calculate smallest gap between two dates (in ms)
			var shortestPeriod = Infinity;
			for (var i = data.length - 2; i >= 0; i--) {
				shortestPeriod = Math.min(shortestPeriod, Math.abs(data[i] - data[i+1]));
			}
			
			numDataPoints = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod));
		}
		else {
			var series = g.series();
			for (var i = series.length - 1; i >= 0; i--) {
				numDataPoints = Math.max(numDataPoints, series[i].data.length);
			};
		}

		// Determine the proper column width
		var effectiveChartWidth = g.width() - g.padding().right - g.padding().left - g.axisBarGap();

		var columnWidth = Math.floor((effectiveChartWidth / numDataPoints) / numColumnSeries);
		columnWidth = columnWidth - g.columnGap()
		// Make sure the columns are at least a pixel wide
		columnWidth = Math.max(columnWidth, 1);

		// Make sure columns are not wider than the specified portion of the available width
		columnWidth = Math.min(columnWidth, effectiveChartWidth * g.maxColumnWidth()/100);
		g.columnWidth(columnWidth);
		g.columnGroupWidth((columnWidth + g.columnGap()) * numColumnSeries);
		g.columnGroupShift(columnWidth + g.columnGap()); 

		return this;
	};
  
  this.drawSeriesAndLegend = function Gneiss$drawSeriesAndLegend(first){
		this.drawSeries(first);
		this.drawLegend();
		return this;
	};
  
  this.drawSeries = function Gneiss$drawSeries(first) {
		/*
		*
		* Series Drawing Section
		*
		*/
		var g = this;
		
		//construct line maker Gneiss.helper functions for each yAxis
		this.setLineMakers(first);
		
		//store split by type for convenience
		var sbt = g.seriesByType();
		var colors = g.colors();
		
		var columnWidth = g.columnWidth();
		var columnGroupShift = g.columnGroupShift();
		
		var lineSeries;
		
		if(first) {
			
			//create a group to contain series
			g.seriesContainer = g.chartElement().append("g")
				.attr("id","seriesContainer")
				.attr("y", 20);				
				
			lineSeries = g.seriesContainer.selectAll("path");
			columnSeries = g.seriesContainer.selectAll("g.seriesColumn");
			var columnGroups;
			var columnRects;
			var lineSeriesDots = g.seriesContainer.selectAll("g.lineSeriesDots");
			var scatterSeries = g.seriesContainer.selectAll("g.seriesScatter");			
				
			//create a group to contain the legend items
			g.legendItemContainer = g.chartElement().append("g")
				.attr("id","legendItemContainer");
				
				//add columns to chart
				columnGroups = columnSeries.data(sbt.column)
					.enter()
					.append("g") 
						.attr("class","seriesColumn seriesGroup")
						.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length]})
						.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
						
				columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
					.enter()
						.append("rect")
						.attr("width",columnWidth)
						.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis()[yAxisIndex].scale(d)-g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())))})
						.attr("x", function(d,i) {
							return g.xAxis().scale(g.xAxisRef()[0].data[i])  - columnWidth/2
							})
						.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (g.yAxis()[yAxisIndex].scale(d)-g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())) : g.yAxis()[yAxisIndex].scale(d)})
								
				
				//add lines to chart
				lineSeries.data(sbt.line)
					.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis()[d.axis].line(d.data).split("L0,0").join("M").split("L0,0").join("");  return pathString.indexOf("NaN")==-1?pathString:"M0,0"})
						.attr("class","seriesLine seriesGroup")
						.attr("stroke",function(d,i){return d.color? d.color : colors[i]})
				
				lineSeriesDotGroups = lineSeriesDots.data(sbt.line)
					.enter()
					.append("g")
					.attr("class","lineSeriesDots seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})
				
				lineSeriesDotGroups
					.filter(function(d){return d.data.length < g.lineDotsThreshold()})
					.selectAll("circle")
					.data(function(d){ return d.data})
					.enter()
						.append("circle")
						.attr("r",g.dotRadius())
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return "translate("+(g.xAxis().type=="date" ?
								g.xAxis().scale(g.xAxisRef()[0].data[i]):
								g.xAxis().scale(i)) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
							})
							
				
				//add scatter to chart
				scatterGroups = scatterSeries.data(sbt.scatter)
					.enter()
					.append("g")
					.attr("class","seriesScatter seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})

				scatterDots = scatterGroups
					.selectAll("circle")
					.data(function(d){ return d.data})
				scatterDots.enter()
						.append("circle")
						.attr("r",g.dotRadius())
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return "translate("+(g.xAxis().type=="date" ?
								g.xAxis().scale(g.xAxisRef()[0].data[i]):
								g.xAxis().scale(i)) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
							})
		}
		else {
			//update don't create
			
			lineSeries = g.seriesContainer.selectAll("path");
			columnSeries = g.seriesContainer.selectAll("g.seriesColumn")
			scatterSeries = g.seriesContainer.selectAll("g.seriesScatter")
			lineSeriesDotGroups = g.seriesContainer.selectAll("g.lineSeriesDots")
			var columnGroups
			var columnRects
			
			if(g.isBargrid()) {
				//add bars to chart

				columnGroups = g.seriesContainer.selectAll("g.seriesColumn")
					.data(sbt.bargrid)
					.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length]})
				
				var seriesColumns = columnGroups.enter()
					.append("g") 
						.attr("class","seriesColumn")
						.attr("fill",function(d,i){return d.color? d.color : colors[i+g.series().length]})
						.attr("transform",function(d,i){return "translate(0," + g.padding().top + ")"});
				
				var bargridLabel = columnGroups.selectAll("text.bargridLabel")
					.data(function(d,i){return [d]})
					.text(function(d,i){return d.name})
				
						
				bargridLabel.enter()
						.append("text")
						.text(function(d,i){return d.name})
						.attr("class","bargridLabel")
								
				bargridLabel.transition()
					.attr("x",g.yAxis()[0].scale(0))
					.attr("y",function(d){ 
						var y = g.defaultPadding().top + d3.select(this)[0][0].getBoundingClientRect().height
						
						//if there is a title bumb the series labels down
						y += g.titleElement().text().length > 0 ?  g.titleElement()[0][0].getBoundingClientRect().height + g.titleBottomMargin(): 0;
						
						return y
					})
					.text(function(d,i){return d.name}) //update the text in case it changed without new data
				
				bargridLabel.exit().remove()
				
				columnSeries.transition()
					.duration(500)
					.attr("transform",function(d,i){return "translate("+(i * ( g.width()-g.padding().left)/g.series().length)+",0)"})
					
				columnGroups.exit().remove()
				

				
				
				columnRects = columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
				
				
				columnRects.enter()
				.append("rect")
				.attr("height", g.bargridBarThickness()) 
				.attr("width", function(d,i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
					return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0))
				})
				.attr("x", function(d,i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
					return g.yAxis()[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis()[yAxisIndex].scale(d)):0)
				})
				.attr("y",function(d,i) {
					return g.xAxis().scale(g.xAxisRef()[0].data[i]) - g.bargridBarThickness()/2
				}) 
				
				
				columnRects.transition()
					.duration(500)
					.attr("height", g.bargridBarThickness()) 
					.attr("width", function(d,i) {
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
						return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0))
					})
					.attr("x", function(d,i) {
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
						return g.yAxis()[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0)):0)
					})
					.attr("y",function(d,i) {
						return g.xAxis().scale(g.xAxisRef()[0].data[i]) - g.bargridBarThickness()/2
					}) 
				
				
				//add label to each bar
				var barLabels = columnGroups.selectAll("text.barLabel")
					.data(function(d,i){return d.data});

				barLabels.enter()
					.append("text")
					.attr("class","barLabel")

				//update the text in each label
				//if it's the top label add the prefix and suffix
				barLabels.text(function(d,i){
					var yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					var output = g.numberFormat(d);
					if((i==0 && g.yAxis()[yAxisIndex].prefix.use == "top") || g.yAxis()[yAxisIndex].prefix.use == "all") {
						output = g.yAxis()[yAxisIndex].prefix.value + output;
					}
					else if (g.yAxis()[yAxisIndex].prefix.use == "positive" && d > 0){
						output = g.yAxis()[yAxisIndex].prefix.value + output;
					}
					else if (g.yAxis()[yAxisIndex].prefix.use == "top" && i == 0) {
						output = g.yAxis()[yAxisIndex].prefix.value + output;
					}

					if((i==0 && g.yAxis()[yAxisIndex].suffix.use == "top") || g.yAxis()[yAxisIndex].suffix.use == "all") {
						output += g.yAxis()[yAxisIndex].suffix.value;
					}
					else if (g.yAxis()[yAxisIndex].suffix.use == "positive" && d > 0){
						output += g.yAxis()[yAxisIndex].suffix.value;
					}
					else if (g.yAxis()[yAxisIndex].suffix.use == "top" && i == 0) {
						output += g.yAxis()[yAxisIndex].suffix.value;
					}

					return output;

				})

				
				//reset the padding to the default before mucking with it in the label postitioning
				
				g.padding.right = g.defaultPadding().right
					
				barLabels.transition()
					.attr("x", function(d,i) {
						var yAxisIndex = d3.select(this.parentNode).data()[0].axis,
						x = g.bargridLabelMargin() + g.yAxis()[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0)):0) + Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0)),
						
						bbox = this.getBBox()
						parentCoords = Gneiss.helper.transformCoordOf(d3.select(this.parentNode))
						if (x + bbox.width + parentCoords.x > g.width()) {
							//the label will fall off the edge and thus the chart needs more padding
							if(bbox.width + g.defaultPadding().right < (g.width()-g.padding().left)/g.series.length) {
								//add more padding if there is room for it
								g.padding().right = bbox.width + g.defaultPadding().right
								g.redraw()
							}
							
						}
						else if (x + bbox.width + parentCoords.x < g.width() - 20){
							//if there is too much left over space (typically caused by deleting a prefix or suffix) reset the padding
							g.padding().right = g.defaultPadding().right;
							g.redraw
						}
						
						
						return x
					})
					.attr("y",function(d,i) {return g.xAxis().scale(g.xAxisRef()[0].data[i]) + d3.select(this)[0][0].getBoundingClientRect().height/4})
				
				//remove non bargrid stuff
				scatterSeries.remove()
				columnRects.exit().remove()
				lineSeriesDotGroups.remove()
				lineSeries.remove()
			}
			else {
				//Not a bargrid
				
				//add columns to chart
				columnGroups = g.seriesContainer.selectAll("g.seriesColumn")
					.data(sbt.column)
					.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length]})
				
				//remove bar labels
				columnGroups.selectAll("text.barLabel").remove()

				//remove bargrid labels
				columnGroups.selectAll("text.bargridLabel").remove()
				
				columnGroups.enter()
					.append("g") 
						.attr("class","seriesColumn")
						.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length]})
						.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
					
				columnSeries.transition()
					.duration(500)
					.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
			
				columnGroups.exit().remove()
			
				columnRects = columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
				
				columnRects.enter()
						.append("rect")

				columnRects.transition()
					.duration(500)
					.attr("width",columnWidth)
					.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())))})
					.attr("x",g.xAxis().type =="date" ? 
							function(d,i) {return g.xAxis().scale(g.xAxisRef()[0].data[i])  - columnWidth/2}:
							function(d,i) {return g.xAxis().scale(i) - columnWidth/2}
					)
					.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (g.yAxis()[yAxisIndex].scale(d)-g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())) : g.yAxis()[yAxisIndex].scale(d)})
				
				columnRects.exit().remove()
			
				//add lines
				lineSeries = g.seriesContainer.selectAll("path")
					.data(sbt.line)
					.attr("stroke",function(d,i){return d.color? d.color : colors[i]});

				lineSeries.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis()[d.axis].line(d.data).split("L0,0L").join("M0,0M").split("L0,0").join(""); return pathString;})
						.attr("class","seriesLine")
						.attr("stroke",function(d,i){return d.color? d.color : colors[i]})

				lineSeries.transition()
					.duration(500)
					.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis()[d.axis].line(d.data).split("L0,0L").join("M0,0M").split("L0,0").join(""); return pathString;})

				lineSeries.exit().remove()
			
			
				//Add dots to the appropriate line series
				lineSeriesDotGroups = g.seriesContainer.selectAll("g.lineSeriesDots")
					.data(sbt.line)
					.attr("fill",function(d,i){return d.color? d.color : colors[i]})
			
				lineSeriesDotGroups
					.enter()
					.append("g")
					.attr("class","lineSeriesDots")
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})
				
				lineSeriesDotGroups.exit().remove()
			
				lineSeriesDots = lineSeriesDotGroups.filter(function(d){return d.data.length < g.lineDotsThreshold()})
					.selectAll("circle")
					.data(function(d,i){return d.data})
					
				lineSeriesDotGroups.filter(function(d){return d.data.length >= g.lineDotsThreshold()})
					.remove()
				
				
				lineSeriesDots.enter()
					.append("circle")
					.attr("r",g.dotRadius())
					.attr("transform",function(d,i){
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							var y = d || d ===0 ? g.yAxis()[yAxisIndex].scale(d) : -100;
							return "translate("+ g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + y + ")";
						})
			
				lineSeriesDots.transition()
					.duration(500)
					.attr("transform",function(d,i){
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							var y = d || d ===0 ? g.yAxis()[yAxisIndex].scale(d) : -100;
							return "translate("+ g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + y + ")";
						})
			
				lineSeriesDots.exit().remove()
								
				//add scatter
				scatterGroups = g.seriesContainer.selectAll("g.seriesScatter")
					.data(sbt.scatter)
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})
				
				scatterGroups.enter()
					.append("g")
					.attr("class","seriesScatter")
					.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length+sbt.column.length]})
				
				scatterGroups.exit().remove()
				
				scatterDots = scatterGroups
					.selectAll("circle")
					.data(function(d){return d.data})
					
				scatterDots.enter()
						.append("circle")
						.attr("r",g.dotRadius())
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							return "translate("+g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
							})
					
				scatterDots.transition()
						.duration(500)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							return "translate("+g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
							})
			}
			
		}
		
		//arrange elements in proper order	
		
		//bring bars to front
		if(sbt.column.length > 0) {
			columnGroups.each(function(){if(this.parentNode){this.parentNode.appendChild(this);}})
			columnSeries.each(function(){if(this.parentNode){this.parentNode.appendChild(this);}})
		}
		
		
		//bring lines to front
		if(sbt.line.length > 0){
			lineSeries.each(function(){if(this.parentNode){this.parentNode.appendChild(this);}})
			//bring dots to front
			lineSeriesDotGroups.each(function(){if(this.parentNode){this.parentNode.appendChild(this);}})
		}
		
		//bring scatter to front
		if(sbt.scatter.length > 0) {
			scatterGroups.each(function(){this.parentNode.appendChild(this);})
			scatterDots.each(function(){this.parentNode.appendChild(this);})
		}
		
		return this;
	};
  
  this.drawLegend = function Gneiss$drawLegend() {
		var g = this;
		var legendItemY;
		
		var colors = g.colors();
		
		//remove current legends
		g.legendItemContainer.selectAll("g.legendItem").remove()
		
		if(!g.isBargrid()) {
			//add legend to chart
			var legendGroups = g.legendItemContainer.selectAll("g")
				.data(g.series());

			var legItems = 	legendGroups.enter()
				.append("g")
				.attr("class","legendItem")
				.attr("transform","translate("+g.padding().left+","+(g.defaultPadding().top + g.titleElement()[0][0].getBoundingClientRect().height) +")");

			legendGroups.exit().remove()

			var legLabels = legItems.append("text")
					.filter(function(){return g.series().length > 1})
					.attr("class","legendLabel")
					.attr("x",12)
					.attr("y",18)
					.attr("fill",function(d,i){return d.color? d.color : colors[i]})
					.text(function(d,i){return d.name});
			
			//if there is more than one line
			if(g.series().length > 1) {
				legItems.append("rect")
					.attr("width",10)
					.attr("height",10)
					.attr("x",0)
					.attr("y",8)
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})

				legendGroups.filter(function(d){return d != g.series()[0]})
					.attr("transform",function(d,i) {
						//label isn't for the first series
						var prev = d3.select(legendGroups[0][i]);
						var prevWidth = parseFloat(prev.node().getBoundingClientRect().width);
						var prevCoords = Gneiss.helper.transformCoordOf(prev);

						var cur = d3.select(this);
						var curBoundingRect = cur.node().getBoundingClientRect();
						var curWidth = parseFloat(curBoundingRect.width);
						var curCoords = Gneiss.helper.transformCoordOf(cur);
						var curHeight = parseFloat(curBoundingRect.height)

						legendItemY = prevCoords.y;
						var x = prevCoords.x + prevWidth + g.legendLabelSpacingX(); 
						if(x + curWidth >  g.width()) {
							x = g.padding().left;
							legendItemY += curHeight + g.legendLabelSpacingY();				
						}
						return "translate("+x+","+legendItemY+")";
				})
			} else {
				//not bargrid
			}
		}
		
		return this;
	};
  
  this.updateMetaAndTitle = function Gneiss$updateMetaAndTitle() {
		var g = this;
		g.footerElement().attr("transform","translate(0," + (g.height() - g.footerMargin()) + ")");
		return this;
	};
  
  this.splitSeriesByType = function Gneiss$splitSeriesByType(series) {
		/*
			Partition the data by the way it is supposed to be displayed
		*/
		var seriesByType = {
			"line": [],
			"column": [],
			"bargrid": [],
			"scatter": []
		};
		
		for (var i = 0; i < series.length; i++) {
			seriesByType[series[i].type].push(series[i]);
		}
		
		return seriesByType;
	};
  
  this.updateGraphPropertiesBasedOnSeriesType = function Gneiss$updateGraphPropertiesBasedOnSeriesType(graph, seriesByType) {
		/* 
		  Update graph properties based on the type of data series displayed 
		*/
		graph.hasColumns(seriesByType.column.length > 0);
		graph.isBargrid(seriesByType.bargrid.length > 0);
	};
  
  this.redraw = function Gneiss$redraw() {
  		

		/*
			Redraw the chart
		*/
				
		//group the series by their type
		this.seriesByType(this.splitSeriesByType(this.series()));
		this.updateGraphPropertiesBasedOnSeriesType(this, this.seriesByType());

		this.calculateColumnWidths()

		this.setPadding()
			.setYScales()
			.setXScales()
			.setYAxes()
			.setXAxis()
			.drawSeriesAndLegend()
			.updateMetaAndTitle();
		

		return this;
	};
  
  // Call build() when someone attempts to construct a new Gneiss object
  return this.build(config);
}