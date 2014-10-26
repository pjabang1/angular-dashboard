console.log("log");
var $container = "container";
var $element = document.getElementById($container);
var $topoUrl = "data/world-topo-min.json";
var $dataUrl = "data/country-capitals.csv";

d3.select(window).on("resize", throttle);

var zoom = d3.behavior.zoom()
		.scaleExtent([1, 9])
		.on("zoom", move);


var width = $element.offsetWidth;
var height = width / 2;
// var height = width / 4;

var topo, projection, path, svg, g;

var graticule = d3.geo.graticule();

var tooltip = d3.select("#" + $container).append("div").attr("class", "tooltip hidden");

setup(width, height);

function setup(width, height) {
	projection = d3.geo.mercator()
			.translate([(width / 2), (height / 2)])
			.scale(width / 2 / Math.PI);

	path = d3.geo.path().projection(projection);

	svg = d3.select("#" + $container).append("svg")
			.attr("width", width)
			.attr("height", height)
			.call(zoom)
			.on("click", click)
			.append("g");

	g = svg.append("g");

}

d3.json($topoUrl, function(error, world) {

	var countries = topojson.feature(world, world.objects.countries).features;

	topo = countries;
	draw(topo);

});


function getColours(r, g, b) {
	var opc = 0.1;
	var colours = [];
	while (opc <= 1) {
		colours.push("rgba(" + r + ", " + g + ", " + b + ", " + opc + ")");
		opc += 0.1;
	}
	return colours;
}

// var colours = getColours(41, 125, 185);
// var colours = getColours(52, 152, 219);
var colours = getColours(243, 156, 18);
var colours = getColours(243, 156, 18);


var heatmapColour = d3.scale.linear()
		.domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
		.range(colours);

function draw(topo) {

	svg.append("path")
			.datum(graticule)
			.attr("class", "graticule")
			.attr("d", path);


	g.append("path")
			.datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
			.attr("class", "equator")
			.attr("d", path);


	var country = g.selectAll(".country").data(topo);

	country.enter().insert("path")
			.attr("class", "country")
			.attr("d", path)
			.attr("id", function(d, i) {
				return d.id;
			})
			.attr("title", function(d, i) {
				return d.properties.name;
			})
			.attr("country", function(d, i) {
				return d.properties.name.toUpperCase();
			})
			.style("fill", function(d, i) {
				return '#ccc';
			});

	//offsets for tooltips
	var offsetL = $element.offsetLeft + 20;
	var offsetT = $element.offsetTop + 10;

	//tooltips
	country
			.on("mousemove", function(d, i) {

				var mouse = d3.mouse(svg.node()).map(function(d) {
					return parseInt(d);
				});

				tooltip.classed("hidden", false)
						.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
						.html(d.properties.name);

			})
			.on("mouseout", function(d, i) {
				tooltip.classed("hidden", true);
			});



	//EXAMPLE: adding some capitals from external CSV file
	d3.csv($dataUrl, function(err, capitals) {

		capitals.forEach(function(i) {
			addpoint(i.CapitalLongitude, i.CapitalLatitude, i.CapitalName);
			var percent = i.Percent;
			var rgb = d3.rgb('#090');
			//console.log(i.CountryName.toUpperCase());
			d3.select("[country='" + i.CountryName.toUpperCase() + "']").style("fill", function(d) {
				// console.log(rgb.toString());
				return heatmapColour(percent);
			});
		});

	});

}


function redraw() {
	width = $element.offsetWidth;
	height = width / 2;
	d3.select('svg').remove();
	setup(width, height);
	draw(topo);
}


function move() {

	var t = d3.event.translate;
	var s = d3.event.scale;
	zscale = s;
	var h = height / 4;


	t[0] = Math.min(
			(width / height) * (s - 1),
			Math.max(width * (1 - s), t[0])
			);

	t[1] = Math.min(
			h * (s - 1) + h * s,
			Math.max(height * (1 - s) - h * s, t[1])
			);

	zoom.translate(t);
	g.attr("transform", "translate(" + t + ")scale(" + s + ")");

	//adjust the country hover stroke width based on zoom level
	d3.selectAll(".country").style("stroke-width", 1.5 / s);

}



var throttleTimer;
function throttle() {
	window.clearTimeout(throttleTimer);
	throttleTimer = window.setTimeout(function() {
		redraw();
	}, 200);
}


//geo translation on mouse click in map
function click() {
	var latlon = projection.invert(d3.mouse(this));
	console.log(latlon);
}


//function to add points and text to the map (used in plotting capitals)
function addpoint(lat, lon, text) {

	var gpoint = g.append("g").attr("class", "gpoint");
	var x = projection([lat, lon])[0];
	var y = projection([lat, lon])[1];

	gpoint.append("svg:circle")
			.attr("cx", x)
			.attr("cy", y)
			.attr("class", "point")
			.attr("r", 1.5);

	//conditional in case a point has no associated text
	if (text.length > 0) {

		gpoint.append("text")
				.attr("x", x + 2)
				.attr("y", y + 2)
				.attr("class", "text")
				.text(text);
	}

}
