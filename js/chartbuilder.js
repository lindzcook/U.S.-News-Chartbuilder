var chart;
ChartBuilder = {
	allColors: ['a3bfdb','75a0c8','4780b6','1860a4','15508a','0d3e70','062955','011038',
						'f5a4ac','f17783','ec4959','e71b30','bf1426','9a0917','760506','510002',
						'fbd9ad','f9c685','f7b45c','f5a133','ca8629','a26b1b','7c510b','543305'], 
	curRaw: "",
	advancedMode: false,
	separators: {},
	getNewData: function(csv) {
		var i;
		if(!csv) {
			return null;
		}
		
		// Split the csv information by lines
		var csv_array = csv.split("\n");
		
		// Split the first element of the array by the designated separator, tab in this case
		var csv_matrix = [];
		var delim = String.fromCharCode(9);

		if (delim == this.separators.thousands || delim == this.separators.decimal) {
			console.warn("Your text deliminator is the same as your locale's thousands separator or decimal separator")
		}
		
		// Trim leading and trailing spaces from rows and split
		csv_matrix.push($.trim(csv_array[0]).split(delim));

		// Get the number of columns
		var cols_num = csv_matrix[0].length;

		// If there aren't at least two columns, return null
		if(cols_num < 2) {
			return null;
		}

		// Trim leading and trailing spaces from headers
		for(i = 0; i < cols_num; i++) {
			csv_matrix[0][i] = $.trim(csv_matrix[0][i]);
		}
			
		// Knowing the number of columns that every line should have, split
		// those lines by the designated separator. While doing this, count
		// the number of rows
		var rows_num = 0;
		for(i=1; i<csv_array.length; i++) {
			// If the row is empty, that is, if it is just an \n symbol, continue
			if(csv_array[i] === "") {
				continue;
			}

			// Split the row. If the row doesn't have the right amount of cols
			// then the csv is not well formated, therefore, return null
			var row = $.trim(csv_array[i]).split(delim);
			if(row.length != cols_num) {
				return null;
			}
			
			// Trim leading and trailing spaces from entries
			for(var j = 0; j < row.length; j++) {
				row[j] = $.trim(row[j]);
			}
			
			// Push row to matrix, increment row count, loop
			csv_matrix.push(row);
			rows_num++;
		}

		// If there aren't at least two non empty rows, return null
		if(rows_num < 2) {
			return null;
		}

		return csv_matrix;
	},
	// Given the matrix containing the well formated csv, create the object that
	// is going to be used later
	makeDataObj: function(csv_matrix) {
		// Make the data array
		var data = [];
		var value;
		for(var i=0; i<csv_matrix[0].length; i++) {
			// Object for a single column
			var obj = {name: csv_matrix[0][i], data: []};

			// Make the obj
			for(var j=1; j<csv_matrix.length; j++) {
				// If this is a date column
				if((/date/gi).test(obj.name)) {
					value = Date.create(csv_matrix[j][i]);
					if(value == "Invalid Date") {
						return null;
					}
					obj.data.push(value);
				}
				// If it is the first column, containing the names
				else if(i === 0) {
					obj.data.push(csv_matrix[j][i]);
				}
				// If it's a data point
				else {
					value = csv_matrix[j][i];

					//strip out currency symbol, measurement symbol and thousands separator
					//replace decimal separator with period
					value = value.split("$").join("")
								.split("£").join("")
								.split("€").join("")
								.split("%").join("")
								.split(this.separators.thousands).join("")
								.split(this.separators.decimal).join(".");

					if(value === "null" || value === "" || (/^\s+$/).test(value) || (/^\#[A-Z\\\d\/]+!{0,}$/).test(value)) {
						//allow for nulls, blank, whitespace only cells (if somehow trim didn't work), and excel errors
						value = null;
					}
					else if (isNaN(value)){
						//data isn't valid
						return null;
					}
					else {
						value = parseFloat(value);
					}
					
					obj.data.push(value);
				}
			}

			data.push(obj);
		}

		return {data: data, datetime: (/date/gi).test(data[0].name)};
	},
	parseData: function(a) {
		var d = [];
		var parseFunc;
		var i;
		for (i=0; i < a.length; i++) {
			if((/date/gi).test(a[i][0])){ //relies on the word date 
				parseFunc = this.dateAll;
			}
			else if (i === 0) {
				parseFunc = this.doNothing;
			}
			else {
				parseFunc = this.floatAll;
			}
			
			d.push({
				"name": a[i].shift().split("..").join("\n"),
				"data":parseFunc(a[i]),
			});
			
		}
		for (i = d.length - 1; i >= 0; i--){
			for (var j = d[i].length - 1; j >= 0; j--){
				if(d[i][j] === "" || d[i][j]===" ") {
					d[i][j] = null;
				}
			}
		}
		return d;
	},
	mergeData: function(a) {
		var d;
		for (var i=0; i < a.data.length; i++) {
			d = a.data[i];
			if(i < chart.series().length) {
				a.data[i] = $.extend({},chart.series()[i],d);
			}
			else {
				//defaults for new series
				a.data[i].type = "line";
			}
			
		}
		
		return a;
	},
	pivotData: function(a){
		var o = [];
		for (var i=0; i < a.length; i++) {
			if(a[i]) {
				for (var j=0; j < a[i].length; j++) {
					if(i === 0) {
						o.push([]);
					}
					if(a[i][j] !== "") {
						o[j][i] = a[i][j];
					}
				}
			}
			
		}
		return o;
	},
	createTable: function(r,d){
		$table = $("#dataTable table");
		$table.text("");


		$table.append("<tr><th>"+r[0].join("</th><th>")+"</th></tr>");

		for (var i=1; i < r.length; i++) {
			if(r[i]) {
				if(d) {
					r[i][0] = Date.create(r[i][0]).format("{M}/{d}/{yy} {hh}:{mm}");
				}
				
				//add commas to the numbers
				for (var j = 0; j < r[i].length; j++) {
					r[i][j] = this.addCommas(r[i][j]);
				}

				$("<tr><td>"+r[i].join("</td><td>")+"</td></tr>")
					.addClass(i%2 === 0? "otherrow":"row")
					.appendTo($table);
			}
		}

		// append to 
		this.outputTableAsHtml($table);
	},


	// table_el is a jQuery element
	outputTableAsHtml: function(table_el){
		var html_str = table_el.parent().html();
		// throw in some sloppy newline subbing
		html_str = html_str.replace(/(<(?:tbody|thead))/g, "\n$1");
		html_str = html_str.replace(/(<\/(?:tr|tbody|thead)>)/g, "$1\n");
		html_str = html_str.split("<tbody><tr>").join("<tbody>\n<tr>");
		html_str = $.trim(html_str);
		$('#table-html').val(html_str);
	},
	floatAll: function(a) {
		for (var i=0; i < a.length; i++) {
			if(a[i] && a[i].length > 0 && (/[\d\.\$£€\%]+/).test(a[i])) {
				a[i] = parseFloat(a[i]);
			}
			else {
				a[i] = null;
			}
		}
		return a;
	},
	dateAll: function(a) {
		for (var i=0; i < a.length; i++) {
			a[i] = Date.create(a[i]);
		}
		return a;
	},
	doNothing: function(a) {
		return a;
	},
	inlineAllStyles: function() {
		var chartStyle, selector, cssText;

		// Get rules from gneisschart.css
		for (var i = 0; i <= document.styleSheets.length - 1; i++) {
			if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf('gneisschart.css') != -1) {
				if (document.styleSheets[i].rules != undefined) {
					chartStyle = document.styleSheets[i].rules
				} else {
					chartStyle = document.styleSheets[i].cssRules
				}
			}
		}

		if (chartStyle != null && chartStyle != undefined) {
			for (var i = 0; i < chartStyle.length; i++) {
				if (chartStyle[i].type == 1) {
					selector = chartStyle[i].selectorText;
					styles = ChartBuilder.makeStyleObject(chartStyle[i]);
					d3.selectAll(selector).style(styles)
				}
			};
		}
	},
	makeStyleObject: function(rule) {
		var styleDec = rule.style;
		var output = {};
		var s;

		for (s = 0; s < styleDec.length; s++) {
			output[styleDec[s]] = styleDec[styleDec[s]];
		}

		return output;
	},
	createChartImage: function() {
		// Create PNG image
		var canvas = document.getElementById("canvas");
		canvas.width = $("#chartContainer").width() * 2;
		canvas.height = $("#chartContainer").height() *2;

		var canvasContext = canvas.getContext("2d");
		var svg = $.trim(document.getElementById("chartContainer").innerHTML);

		canvasContext.drawSvg(svg,0,0);

		var logo = new Image();
		logo.src = 'data:image/png;base64,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';
			canvasContext.drawImage(logo, 20, 648);
	
		
		var filename = [];
		for (var i=0; i < chart.series().length; i++) {
			filename.push(chart.series()[i].name);
		}
		
		if(chart.title().length > 0) {
			filename.unshift(chart.title());
		}
		
		filename = filename.join("-").replace(/[^\w\d]+/gi, '-');

		console.log(canvas.toDataURL("png"));
		
		$("#downloadImageLink").attr("href",canvas.toDataURL("png"))
			.attr("download",function(){ return filename + "_chartbuilder.png";
			});
			
			
		var svgContent = this.createSVGContent(document.getElementById("chart"));
		
		$("#downloadSVGLink").attr("href","data:text/svg,"+ svgContent.source[0])
			.attr("download",function(){ return filename + "_chartbuilder.svg";});

			var icon = this.setFavicon();
			this.storeLocalChart(filename);

		if(!(/Apple/).test(navigator.vendor)) {
			//blobs dont work in Safari so don't use that method

			var link = document.getElementById('downloadImageLink');
			var base64 = canvas.toDataURL("png").split(",")[1];
			var bytes = window.atob(base64);
			var ui8a = new Uint8Array(bytes.length);

			for (var i = 0; i < bytes.length; i++)
				ui8a[i] = bytes[i].charCodeAt(0);

			var blob = new Blob([ui8a], { type: 'image/png' });
			var url = URL.createObjectURL(blob);
			link.href = url;
			
			link = document.getElementById('downloadSVGLink');
			blob = new Blob(svgContent.source, { type: '"text\/xml"' });
			url = URL.createObjectURL(blob);
			link.href = url;
		}
		
	},
	createSVGContent: function(svg) {
		/*
			Copyright (c) 2013 The New York Times

			Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
			The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

			SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
		*/

		//via https://github.com/NYTimes/svg-crowbar

		var prefix = {
			xmlns: "http://www.w3.org/2000/xmlns/",
			xlink: "http://www.w3.org/1999/xlink",
			svg: "http://www.w3.org/2000/svg"
		};

		var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';


		svg.setAttribute("version", "1.1");

		var defsEl = document.createElement("defs");
		svg.insertBefore(defsEl, svg.firstChild); //TODO   .insert("defs", ":first-child")

		var styleEl = document.createElement("style");
		defsEl.appendChild(styleEl);
		styleEl.setAttribute("type", "text/css");


		// removing attributes so they aren't doubled up
		svg.removeAttribute("xmlns");
		svg.removeAttribute("xlink");

		// These are needed for the svg
		if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
			svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
		}

		if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
			svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
		}

		var source = (new XMLSerializer()).serializeToString(svg).replace('</style>', '<![CDATA[' + styles + ']]></style>');

		return {svg: svg, source: [doctype + source]};
	},
	setFavicon: function() {
		//set favicon to image of chart
		var favicanvas = document.getElementById("favicanvas");
		favicanvas.width = 64;
		favicanvas.height = 64;
		
		var faviCanvasContext = favicanvas.getContext("2d");
		faviCanvasContext.translate(favicanvas.width / 2, favicanvas.height / 2);
		
		var svg = $.trim(document.getElementById("chartContainer").innerHTML);
		faviCanvasContext.drawSvg(svg,-16,-8,32,32);
		
		var icon = favicanvas.toDataURL("png");
		$("#favicon").attr("href",icon);
		
		return icon;
	},
	redraw: function() {
		$(".seriesItemGroup").detach();
		var g = chart;
		var s;
		var picker;
		var typer;
		var axer;
		this.customLegendLocaion = false;
		var colIndex = g.seriesByType().line.length;
		var lineIndex = 0;
		var bargridIndex = 0;
		var scatterIndex = 0;
		var seriesContainer = $("#seriesItems");
		var isMultiAxis = false;
		var colors = g.colors();
		var i;
		
		for (i=0; i < g.series().length; i++) {
			s = g.series()[i];
			seriesItem = $('<div class="seriesItemGroup">\
				<label for="'+this.idSafe(s.name)+'_color">'+s.name+'</label>\
				<input id="'+this.idSafe(s.name)+'_color" name="'+this.idSafe(s.name)+'" type="text" />\
				<select class="typePicker" id="'+this.idSafe(s.name)+'_type">\
					<option '+(s.type=="line"?"selected":"")+' value="line">Line</option>\
					<option '+(s.type=="column"?"selected":"")+' value="column">Column</option>\
					<option '+(s.type=="bargrid"?"selected":"")+' '+(g.xAxis().type == "date"?"disabled":"")+' value="bargrid">Bar Grid</option>\
					<option '+(s.type=="scatter"?"selected":"")+' value="scatter">Scatter</option>\
				</select>\
				<div class="clearfix"></div>\
			</div>');
			var color = s.color ? s.color.replace("#","") : colors[i].replace("#","");
			s.color = "#" + color;
			
			seriesContainer.append(seriesItem);
			picker = seriesItem.find("#"+this.idSafe(s.name)+"_color").colorPicker({pickerDefault: color, colors:this.allColors});
			typer = seriesItem.find("#"+this.idSafe(s.name)+"_type");
			axer = seriesItem.find("#"+this.idSafe(s.name)+"_check");
			
			if(g.series()[i].axis == 1) {
				axer.prop("checked",true);
				if(!g.yAxis()[1].color || !isMultiAxis) {
					g.yAxis()[1].color = picker.val();
				}
				isMultiAxis = true;
			}
			else {
				axer.prop("checked",false);
			}
												
			seriesItem.data("index",i);
			picker.change(function() {
				chart.series()[$(this).parent().data().index].color = $(this).val();
				ChartBuilder.redraw();
			});
			typer.change(function() {
				var val = $(this).val();
				var index = $(this).parent().data().index;
				chart.series()[index].type = val;
				if(val == "column") {
					//if you're making a column chart, force the yAxis to span 0
					var axis = chart.yAxis()[chart.series()[$(this).parent().data().index].axis];
					if(axis.domain[1] > 0) {
						axis.domain[0] = Math.min(axis.domain[0],0);
					}
					else {
						axis.domain[1] = 0;
					}
				}

				var hasBargrid = false;
				chart.setPadding();
				ChartBuilder.setChartArea();
				chart.setXScales()
					.resize();
				ChartBuilder.redraw();

			});
			
			axer.change(function() {
				var axis = $(this).is(':checked') ? 1 : 0;
				chart.series()[$(this).parent().data().index].axis = axis;
				
				if(!chart.yAxis()[axis]) {
					chart.yAxis()[axis] = {
						domain: [null, null],
						tickValues: null,
						prefix: {
							value: "",
							use: "top" //can be "top", "all", "positive", or "negative"
						},
						suffix: {
							value: "",
							use: "top"
						},
						ticks: 4,
						formatter: null,
						color: null
					};
				}
				
				var leftAxisIsUsed = false;
				for(var i = 0; i < chart.series().length; i++) {
					if(chart.series()[i].axis == 1) {
						leftAxisIsUsed = true;
					}
				}
				
				if(chart.yAxis().length > 1 && !leftAxisIsUsed)
				{
					chart.yAxis().pop();
				}
				
				chart.setYScales()
					.setYAxes()
					.setLineMakers();
				ChartBuilder.redraw();
			});
			
			chart.redraw();
			this.makeLegendAdjustable();
		}
		
		
		var yAxisObj = [];
		for (i = g.yAxis().length - 1; i >= 0; i--){
			var cur = g.yAxis()[i];
			yAxisObj[i] = {
				domain: cur.domain,
				tickValues: cur.tickValues,
				prefix: cur.prefix,
				suffix: cur.suffix,
				ticks: cur.ticks,
				formatter: cur.formatter
			};
		}
		
		var xAxisObj = {
			domain: g.xAxis().domain,
			prefix: g.xAxis().prefix,
			suffix: g.xAxis().suffix,
			type: g.xAxis().type,
			formatter: g.xAxis().formatter
		};
		
		if(isMultiAxis){
			$("#leftAxisControls").removeClass("hide");
		}
		else {
			$("#leftAxisControls").addClass("hide");
		}
		
		var state = {
			container: g.containerElement(),
			colors: g.colors(),
			title: g.title(),
			padding : g.padding(),
			xAxis: xAxisObj,
			yAxis: yAxisObj,
			series: g.series(),
			xAxisRef: g.xAxisRef(),
			sourceline: g.source(),
			creditline: ""
		};
		
		//chart = g;
		ChartBuilder.updateInterface();
		ChartBuilder.inlineAllStyles();
	},
	updateInterface: function() {
		if(chart.xAxis().type == "date") {
			$(".showonlywith-date").removeClass("hide");
		}

		if(chart.xAxis().type == "ordinal") {
			$(".showonlywith-ordinal").removeClass("hide");
		}

		if(chart.xAxis().type != "date") {
			$(".showonlywith-date").addClass("hide");
		}

		if(chart.xAxis().type != "ordinal") {
			$(".showonlywith-ordinal").addClass("hide");
		}

		if(this.advancedMode) {
			$(".advanced").removeClass("hide");
		}
		else {
			$(".advanced").addClass("hide");
		}
	},
	setChartArea: function() {
		var hasBargrid = false;
		for (var i = chart.series().length - 1; i >= 0; i--){
			if(chart.series()[i].type == "bargrid") {
				hasBargrid = true;
				break;
			}
		}
		
		if(hasBargrid) {
			$("#chartContainer").css("height",
				chart.series()[0].data.length * (chart.bargridBarThickness() + 2) + //CHANGE - MAGIC NUMBER
				chart.padding().top +
				chart.padding().bottom
				);
		}
		else {
			$("#chartContainer").removeAttr("height").css("height","");
		}
	},
	makeLegendAdjustable: function() {
		
		var legendLabelDrag = d3.behavior.drag()
			.origin(Object)
			.on("dragstart",function(d){
				elem = d3.select(this);
				d3.select(elem[0][0].parentNode).selectAll("rect").style("display","none");
				if(!ChartBuilder.customLegendLocaion) {
					chart.legend(false);
					chart.redraw();
					ChartBuilder.inlineAllStyles();
					ChartBuilder.makeLegendAdjustable();
					ChartBuilder.customLegendLocaion = true;
				}
				
			})
			.on("drag", function(d){
				elem = d3.select(this);
				elem.attr("x", Number(elem.attr("x")) + d3.event.dx)
					.attr("y", Number(elem.attr("y")) + d3.event.dy);
					
				
		});
		d3.selectAll("text.legendLabel").call(legendLabelDrag);
		
		
	},
	getAllInputData: function() {
		var d = {}, $el;
		var elems = $("input, textarea, select:not(#previous_charts)").each(function() {
			$el = $(this);
			d[$el.attr("id")] = $el.val();
		});
		return d;
	},
	storeLocalChart: function(name) {
		try {
			var testassignment = localStorage["savedCharts"][0];
		}
		catch(e) {
			localStorage["savedCharts"] = JSON.stringify([]);
		}
		
		var allcharts = JSON.parse(localStorage["savedCharts"]);
		newChart = this.getAllInputData();
		newChart.name = name;
		allcharts.push(newChart);
		localStorage["savedCharts"] = JSON.stringify(allcharts);
	},
	getLocalCharts: function() {
		var charts = [];
		try {
			charts = JSON.parse(localStorage["savedCharts"]);
		}
		catch(e){ /* Fail Silently */}
		
		return charts;
	},
	loadLocalChart: function(d) {
		for (var key in d) {
			if(key != "name") {
				$("#"+key).val(d[key]);
				//$("#"+key).text(d[key])
			}
		}
		$("input, textarea, select:not(#previous_charts)").keyup().change();
	},
	idSafe: function(s) {
		s = s.replace(/[^\w\d]+/gi,"-");
		return s;
	},
	addCommas: function(nStr)
	{
		if(Number(nStr) + "" == nStr) {
			//if the string is a number return a localized string
			return Number(nStr).toLocaleString()
		}

		//else return the string
		return nStr
	},
	determineLocaleNumberSeps: function() {
		var n = 1000.50;
		var l = n.toLocaleString();
		if(l === n.toString()) {
			//CHANGE and actually deduce the proper format
			return {decimal: ".", thousands: ","}
		}
		return {decimal: l.substring(5,6), thousands: l.substring(1,2)};
	},
	actions: {
		axis_prefix_change: function(index,that) {
			chart.yAxis()[index].prefix.value = $(that).val();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_suffix_change: function(index,that) {
			chart.yAxis()[index].suffix.value = $(that).val();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_tick_num_change: function(index,that) {
			chart.yAxis()[index].ticks = parseInt($(that).val(),10);
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_max_change: function(index,that) {
			var val = parseFloat($(that).val());
			if(isNaN(val)) {
				val = null;
			}
			chart.yAxis()[index].domain[1] = val;
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_min_change: function(index,that) {
			var val = parseFloat($(that).val());
			if(isNaN(val)) {
				val = null;
			}
			chart.yAxis()[index].domain[0] = val;
			chart.setYScales();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_tick_override_change: function(index,that) {
			var val = $(that).val();
			val = val.split(",");
			if(val.length > 1) {
				for (var i = val.length - 1; i >= 0; i--){
					val[i] = parseFloat(val[i]);
				}
			}
			else {
				val = null;
			}
			chart.yAxis()[index].tickValues = val;
			chart.setYScales();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		}
	},
	showInvalidData: function() {
		$("#inputDataHeading").addClass("inputDataHInvData");
		$("#invalidDataSpan").removeClass("hide");
	},
	hideInvalidData: function() {
		$("#inputDataHeading").removeClass("inputDataHInvData");
		$("#invalidDataSpan").addClass("hide");
	}
};

// Create default config for chartbuilder
ChartBuilder.getDefaultConfig = function() {
  var chartConfig = {};
  chartConfig.colors = ['#a3bfdb','#75a0c8','#4780b6','#1860a4','#15508a','#0d3e70','#062955','#011038',
						'#f5a4ac','#f17783','#ec4959','#e71b30','#bf1426','#9a0917','#760506','#510002',
						'#fbd9ad','#f9c685','#f7b45c','#f5a133','#ca8629','#a26b1b','#7c510b','#543305'];
  
  return chartConfig;
};

// Starts applicatoin given config object
ChartBuilder.start = function(config) {

  // Create config
  var chartbuilderDefaultConfig = ChartBuilder.getDefaultConfig();
  var chartConfig = $.extend(true, Gneiss.defaultGneissChartConfig, chartbuilderDefaultConfig, config);
  
  $(document).ready(function() {
	
	//construct a Gneisschart using default data
	//this should change to be more like this http://bost.ocks.org/mike/chart/
  chart = new Gneiss(chartConfig);
  
	// Scale the chart up so the outputted image looks good on retina displays
	$("#chart").attr("transform", "scale(2)");
	
	//populate the input with the data that is in the chart
	$("#csvInput").val(function() {
		var data = [];
		var val = "";
		var i;

		data[0] = chart.xAxisRef()[0].data;
		data[0].unshift(chart.xAxisRef()[0].name);

		for (i = 0; i < chart.series().length; i++) {
			data[i+1] = chart.series()[i].data;
			data[i+1].unshift(chart.series()[i].name);
		}

		data = ChartBuilder.pivotData(data);

		for (i = 0; i < data.length; i++) {
			data[i] = data[i].join("\t");
		}
		return data.join("\n");
	});


	//load previously made charts
	var savedCharts = ChartBuilder.getLocalCharts();
	var chartSelect = d3.select("#previous_charts")
					.on("change",function() {
						ChartBuilder.loadLocalChart(d3.select(this.selectedOptions[0]).data()[0]);
					});
	
	chartSelect.selectAll("option")
			.data(savedCharts)
			.enter()
			.append("option")
			.text(function(d){return d.name?d.name:"Untitled Chart";});
			
	
	$("#createImageButton").click(function() {
		ChartBuilder.inlineAllStyles();

		if($("#downloadLinksDiv").hasClass("hide")) {
			ChartBuilder.createChartImage();
		}
		$("#downloadLinksDiv").toggleClass("hide");
	});

	$("#csvInput").bind("paste", function(e) {
	//do nothing special
	});

	/*
	//
	// add interactions to chartbuilder interface
	//
	*/
	
	$("#csvInput").keyup(function() {
		//check if the data is different
		if( $(this).val() != ChartBuilder.curRaw) {
			//cache the the raw textarea value
			ChartBuilder.curRaw = $(this).val();
			
			if($("#right_axis_max").val().length === 0 && $("#right_axis_min").val().length === 0) {
					chart.yAxis()[0].domain = [null,null];
			}
			
			if(chart.yAxis().length > 1 && $("#left_axis_max").val().length === 0 && $("#left_axis_min").val().length === 0) {
					chart.yAxis()[1].domain = [null,null];
			}
			
			var csv = $("#csvInput").val();
			var newData = ChartBuilder.getNewData(csv);
			if(newData === null) {
					ChartBuilder.showInvalidData();
				return;
			}
  
			dataObj = ChartBuilder.makeDataObj(newData);
			if(dataObj === null) {
					ChartBuilder.showInvalidData();
				return;
			}
				ChartBuilder.hideInvalidData();

			if(dataObj.datetime) {
				chart.xAxis().type = "date";
				
				//when there is new datetime data, always autopick the the xaxis format
				var formatter = "";
				var firstDate = dataObj.data[0].data[0];
				var secondDate = dataObj.data[0].data[dataObj.data[0].data.length - 1];
				var timeSpan = Math.max(firstDate,secondDate) - Math.min(firstDate,secondDate);
				months = timeSpan/2592000000;
				years = timeSpan/31536000000;
				days = timeSpan/86400000;
				hours = timeSpan/3600000;
								
				if(years > 15) {
					formatter = "yy";
				}
				else if(years > 1) {
					formatter = "yyyy";
				}
				else if(months > 2){
					formatter = "M";
				}
				else if (days > 3){
					formatter = "Mdd";
				}
				else {
					formatter = "hmm"
				}

				chart.xAxis().formatter = formatter;
				
			}
			else {
				chart.xAxis().type = "ordinal";
				chart.xAxis().formatter = null;
			}
  
			ChartBuilder.createTable(newData, dataObj.datetime);
			
			chart.series().unshift(chart.xAxisRef);
			dataObj = ChartBuilder.mergeData(dataObj);
			
			//TODO add a linear scale type

			chart.xAxisRef([dataObj.data.shift()]);
			
			chart.series(dataObj.data);

			//if there is only one series (and isn't a bargrid), make the name of it the title and fill the title box
			if(!chart.isBargrid()) {
				if(chart.series().length === 1 && chart.title().length === 0 || chart.title() === chart.series()[0].name) {
					chart.title(chart.series()[0].name);
					chart.titleElement().text(chart.title());
					$("#chart_title").val(chart.title());
				}
			}

			chart.setPadding();
			
			ChartBuilder.setChartArea();
			
			chart.setYScales()
				.setXScales()
				.setLineMakers();
				
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		}
  
	}).keyup();
	
	$("#right_axis_prefix").keyup(function() {
		ChartBuilder.actions.axis_prefix_change(0,this);
	});
	
	$("#right_axis_suffix").keyup(function() {
		ChartBuilder.actions.axis_suffix_change(0,this);
	});
	
	$("#right_axis_tick_num").change(function() {
		ChartBuilder.actions.axis_tick_num_change(0,this);
	});
	
	$("#right_axis_max").keyup(function() {
		ChartBuilder.actions.axis_max_change(0,this);
	});
	
	$("#right_axis_min").keyup(function() {
		ChartBuilder.actions.axis_min_change(0,this);
	});
	
	$("#right_axis_tick_override").keyup(function() {
		ChartBuilder.actions.axis_tick_override_change(0,this);
	});
	
	$("#x_axis_tick_num").change(function() {
		chart.xAxis().ticks = parseInt($(this).val(),10);
		ChartBuilder.redraw();
		ChartBuilder.inlineAllStyles();
	});
	
	$("#x_axis_tick_date_frequency").change(function(){
		var val = $(this).val().split(" ");
		//if the selected option has two words set it as the number of ticks
		//else set ticks to null
		chart.xAxis().ticks = val.length > 1 ? val : null;
		ChartBuilder.redraw();
		ChartBuilder.inlineAllStyles();
	});
	
	$("#left_axis_prefix").keyup(function() {
		ChartBuilder.actions.axis_prefix_change(1,this);
	});
  
	$("#left_axis_suffix").keyup(function() {
		ChartBuilder.actions.axis_suffix_change(1,this);
	});
  
	$("#left_axis_tick_num").change(function() {
		ChartBuilder.actions.axis_tick_num_change(1,this);
	});
  
	$("#left_axis_max").keyup(function() {
		ChartBuilder.actions.axis_max_change(1,this);
	});
  
	$("#left_axis_min").keyup(function() {
		ChartBuilder.actions.axis_min_change(1,this);
	});
  
	$("#left_axis_tick_override").keyup(function() {
		ChartBuilder.actions.axis_tick_override_change(1,this);
	});
	
	$("#x_axis_date_format").change(function() {
		var val = $(this).val();
		chart.xAxis().formatter = val;

		if(val == "QJul" || val == "QJan") {
			$("#x_axis_tick_date_frequency")
			.val("3 months")
			.change()
			.attr("disabled","");
		}
		else {
			$("#x_axis_tick_date_frequency").removeAttr("disabled");
		}


		ChartBuilder.redraw();
		ChartBuilder.inlineAllStyles();
	});
	
	// $("#creditLine").keyup(function() {
	// 	var val = $(this).val();
	// 	chart.credit(val);
	// 	chart.creditElement().text(chart.credit());
	// });
		
	$("#sourceLine").keyup(function() {
		var val = $(this).val();
		chart.source(val);
		chart.sourceElement().text(chart.source());
	});
	
	$("#chart_title").keyup(function() {
		var val = $(this).val();
		chart.title(val);
		chart.resize()
			.setPadding();
		ChartBuilder.setChartArea();
		chart.setYScales()
			.redraw();
		ChartBuilder.makeLegendAdjustable();
		
		chart.titleElement().text(chart.title());
	});
	
	$(".downloadLink").click(function() {
		$("#downloadLinksDiv").toggleClass("hide");
	});

	//store the decimal and thousands separators
	ChartBuilder.separators = ChartBuilder.determineLocaleNumberSeps();

  });
};
