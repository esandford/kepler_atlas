//Width and Height of the SVG
var 
	w = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = ((w.innerWidth || e.clientWidth || g.clientWidth) - 50),
	y = ((w.innerHeight|| e.clientHeight|| g.clientHeight) - 50);

// window.onresize = updateWindow;	

var makeSolid = function(selection, color) {
            selection
                .append("appearance")
                .append("material")
                .attr("diffuseColor", color || "black");
            return selection;
        };

///////////////////////////////////////////////////////////////////////////
///////////////////////// Initiate elements ///////////////////////////////
///////////////////////////////////////////////////////////////////////////

var stopTooltip = false;	
//Planet orbit variables
//The larger this is the more accurate the speed is
var resolution = 1, //sets behavior or animation orbit
	speedUp = 400, //speed of planets
	au = 149597871, //km
	radiusSun = 695800, //km
	radiusJupiter = 69911, //km
	phi = 0, //rotation of ellipses
	radiusSizer = 6, //Size increaser of radii of planets
	planetOpacity = 0.6;

//Create SVG
/*var svg = d3.select("#planetarium").append("svg")
	.attr("width", x)
	.attr("height", y);*/

var x3d = d3.select("#chartholder") // creates scene/canvas -ca
            .attr("width", x + 'px')
            .attr("height", y +'px')
            .attr("showLog", 'true')
            .attr("showStat", 'true');

d3.select('.x3dom-canvas') //creates a canvas to hold the 3d objects -ca
  .attr("width", x)
  .attr("height", y);

var scene = x3d.append("scene");   
var view_pos = [-4154.18997, -4159.01197, 288.68446]; //starts camera at an ideal viewpoint -ca
var fov = 1.0;
var view_or = [0.89635, -0.26416, -0.35606, 2.18083];
var zN = 3600;
var zF = 10000;

var viewpoint = scene.append("viewpoint") //click and drag -ca
  .attr("id", 'dvp')
  .attr("position", view_pos.join(" "))
  .attr("orientation", view_or.join(" "))
  .attr("fieldOfView", fov)
  .attr('centerOfRotation', "0 0 0")
  // .attr('zNear', zN)
  // .attr('zFar', zF)
  .attr("description", "defaultX3DViewpointNode").attr("set_bind", "true");

//Create a container for everything with the centre in the middle
//var container = svg.append("g").attr("class","container")
//					.attr("transform", "translate(" + x/2 + "," + y/2 + ")")
  
///////////////////////////////////////////////////////////////////////////
//////////////////////////// Create Scales ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Create color gradient for planets based on the temperature of the star that they orbit
var colors = ["#9C1E1E","#D62828","#E16262","#F3C4C4","#738E9B","#45687A","#2E556A","#174259","#001F2F"];
var colorScale = d3.scale.linear()
	 .domain([2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]) // Temperatures
	 .range(colors);
	
var opacityScale = d3.scale.linear()	
	.domain([0, 1000])
	.range([0, 1]);

//Set scale for radius of circles
var rScale = d3.scale.linear()
	.range([1, 20])
	.domain([0, d3.max(planets, function(d) { return d.Radius; })]);	

//scale x and y "axes"
var xScale = d3.scale.linear()
    .domain([20, 500])
    //.range([-250, x]);
    .range([0,x]);
var yScale = d3.scale.linear()
    .domain([-700, 700])
    //.range([y, 0]);
    .range([y,0])
var zScale = d3.scale.linear()
    .domain([-50, 50])
    .range([0,y]);

//Format with 2 decimals
var formatSI = d3.format(".2f");

//Create the gradients for the planet fill
var gradientChoice = "Temp";
// createGradients();

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Plot and move planets /////////////////////////
///////////////////////////////////////////////////////////////////////////

//Drawing a line for the orbit
// var orbitsContainer = container.append("g").attr("class","orbitsContainer"); // append "g" to "container" and give it class "orbitsContainer"
// var orbits = orbitsContainer.selectAll("g.orbit") //select everything of type g with class "orbit"
// 				.data(planets).enter().append("ellipse") //attaches planets data to currently empty selection; enters data into selection; appends an ellipse for each planet
// 				.attr("class", "orbit") //give the ellipse class "orbit"
// 				.attr("cx", function(d) {return d.cx;}) //set x-position of center
// 				.attr("cy", function(d) {return d.cy;}) //set y-position of center
// 				.attr("rx", function(d) {return d.major;}) //set major axis
// 				.attr("ry", function(d) {return d.minor;}) //set minor axis
// 				.style("fill", "#3E5968")
// 				.style("fill-opacity", 0)
// 				.style("stroke", "white")
// 				.style("stroke-opacity", 0);	


//Drawing the planets			
var planets = scene.selectAll(".planet")
				.data(planets)
            	.enter()
            	.append('transform')
            	.attr('class', 'point')
            	//.attr('translation', '0 0 1') //example of the syntax that "translation" expects
            	.attr('translation', function(d){ 
            		var xyz = convertXYZ(distance=d.dist, xyzinputRA=d.ra, xyzinputdec=d.dec);
					var x = xyz[0];
					var y = xyz[1];
					var z = xyz[2];

            		return xScale(x) + ' ' + yScale(y) + ' ' + zScale(z);})
            	.append('shape')
            	.call(makeSolid, function(d) {return colorScale(d.koi_steff)})
            	//.call(makeSolid, 'white')
            	.append('sphere')
            	//.attr('radius', 5.0); //draw spheres to represent points
            	.attr('radius', function(d) {return 5 *d.koi_srad;}); //draw spheres to represent points

function earthView() { 
				var view_pos = [-1677.11173, 2131.25139, -5981.29509]; //starts camera at an ideal viewpoint -ca
				var fov = 1.0;
				var view_or = [0.72929, 0.67504, -0.11162, 3.87833];

				viewpoint.attr("position", view_pos.join(" "))
				  .attr("orientation", view_or.join(" "))
				  .attr("fieldOfView", fov)
				  .attr('centerOfRotation', "0 0 0");

				 planets.attr('radius', function(d) {return d.koi_srad;}); //draw spheres to represent points

}

// view_pos ="-74.55768, 389.25155, 262.60390" orientation="0.85174 -0.47466 -0.22191 3.26234" 
// 	zNear="4.50389"


// <Viewpoint position="-1677.11173 2131.25139 -5981.29509" orientation="0.72929 0.67504 -0.11162 3.87833" 
// 	zNear="5161.10156" zFar="42691.60824" description="defaultX3DViewpointNode"></Viewpoint>




