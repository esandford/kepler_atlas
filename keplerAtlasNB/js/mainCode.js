//Width and Height of the SVG
var 
	w = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = ((w.innerWidth || e.clientWidth || g.clientWidth) - 50),
	y = ((w.innerHeight|| e.clientHeight|| g.clientHeight) - 50);

// window.onresize = updateWindow;	

//a function that x3dom uses to attach an "appearance" and "color" to a data selection.
//If you subsequently append a shape to that selection, x3dom will render the shape in 3D with this appearance/color. -ES
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

//In the html code, we've created an object of ID "chartholder" within <x3d> tags. Here, we set the dimensions of that object. -ES
var x3d = d3.select("#chartholder")
            .attr("width", x + 'px')
            .attr("height", y +'px')
            .attr("showLog", 'true')
            .attr("showStat", 'true');

d3.select('.x3dom-canvas') //creates a canvas to hold the 3d objects
  .attr("width", x)
  .attr("height", y);

//starts camera at ideal viewpoint
var scene = x3d.append("scene");
var view_pos = [-71481.90522, -19085.21779, -64575.32094];
//var view_pos = [-37902.27708, -31717.63386, -17253.83076]; //new view_pos and fov -Chris
var fov = 0.1;
var view_or = [0.87137, -0.35927, -0.33412, 2.68349];
//var zN = 3600;
//var zF = 10000;

var viewpoint = scene.append("viewpoint")
  .attr("id", 'dvp')
  .attr("position", view_pos.join(" "))
  .attr("orientation", view_or.join(" "))
  .attr("fieldOfView", fov)
  .attr('centerOfRotation', "0 0 0")
  //.attr('zNear', zN)
  //.attr('zFar', zF)
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
//new function to find minimum and maximum stellar radius across the entire data set -James
function return_radius_minmax(planets){
	var currentMinimum = 1000000;
	var currentMaximum = 0;
	var currentRadius;

	for(i=0; i<planets.length; i++){
		currentRadius = planets[i].koi_srad;

		if(currentRadius < currentMinimum){
			currentMinimum = currentRadius;
		}

		if(currentRadius > currentMaximum){
			currentMaximum = currentRadius;
		}

	}
	return [currentMinimum, currentMaximum];
	
	}

radMin = return_radius_minmax(planets)[0] //get minimum and maximum radii -James
radMax = return_radius_minmax(planets)[1]
var rScale = d3.scale.linear()
	//.range([1, 20])
	//.domain([0, d3.max(planets, function(d) { return d.Radius; })]);	
	.domain([radMin, radMax])
	.range([5, 60]); //set domain and range according to minimum and maximum found above -James

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
            	.call(makeSolid, function(d) {return colorScale(d.koi_steff)}) //uses a function to return the STeff and apply our color scale to create differences 
            	.append('sphere')
            	.attr('radius', function(d) {return rScale(d.koi_srad)}); //draw spheres to represent points, using a function to return the radius and apply the radius scale

//new function to switch camera position to Earth sky view -Caroline & Catherine
//note: Catherine & Caroline had different numbers for view_pos, view_or, and centerOfRotation, so I reproduced both versions here! -Emily
function earthView() { 
				//var view_pos = [-1677.11173, 2131.25139, -5981.29509]; //Catherine's version
				var view_pos = [-67.28213, 546.76677, 553.49863]; //Caroline's version
				var fov = 1.0;
				//var view_or = [0.72929, 0.67504, -0.11162, 3.87833]; //Catherine's version
				var view_or = [0.80990, 0.58521, -0.03993, 3.54568]; //Caroline's version


				viewpoint.attr("position", view_pos.join(" "))
				  .attr("orientation", view_or.join(" "))
				  .attr("fieldOfView", fov)
				  //.attr('centerOfRotation', "0 0 0"); //Catherine's version
				  .attr('centerOfRotation', "-18.345760512980718 500.9411560290405 706.9935215264597"); //Caroline's version

				 planets.attr('radius', function(d) {return d.koi_srad;}); //draw spheres to represent points

				}



/*var planetContainer = container.append("g").attr("class","planetContainer");
var planets = planetContainer.selectAll("g.planet")
				.data(planets).enter()
				//.append("g")
				//.attr("class", "planetWrap")					
				.append("circle")
				.attr("class", "planet")
				// .attr("r", function(d) {return radiusSizer*d.Radius;})//rScale(d.Radius);})
				// .attr("cx", function(d) {return d.x;})											//doesn't work because we don't have the data to plot
				// .attr("cy", function(d) {return d.y;})
				.attr("r",  function(d) {return d.koi_srad;}) //set radius to d.koi_srad
				.attr("cx", function(d) {
					var x = convertXYZ(distance=d.dist, xyzinputRA=d.ra, xyzinputdec=d.dec)[0]
					//console.log(x);
					return xScale(x);}) 	//"d" = the planet I'm currently on, in the implicit for-loop
				.attr("cy", function(d) {
					var y = convertXYZ(distance=d.dist, xyzinputRA=d.ra, xyzinputdec=d.dec)[1];
					//console.log(y);
					return yScale(y);})
				.style("fill", function(d) {return colorScale(d.koi_steff)}) //d.koi_steff
				// .style("fill", function(d){return "url(#gradientRadial-" + d.ID + ")";}) 		//no more d.ID
					// .style("opacity", function(d) {
					// 	var z = convertXYZ(distance=d.dist, xyzinputRA=d.ra, xyzinputdec=d.dec)[2];
					// 	// console.log(z)
					// 	return opacityScale(z);})
				.style("opacity", .6)
				.style("stroke-opacity", 0)//depend on z 
				.style("stroke-width", "3px")
				.style("stroke", "white")
				// .on("mouseover", function(d, i) {		/relies on showEllipse function in helperFunctions.js
				// 	stopTooltip = false					
				// 	showTooltip(d);
				// 	showEllipse(d, i, 0.8);
				// })
				// .on("mouseout", function(d, i) {
				// 	showEllipse(d, i, 0);
				// });

//Remove tooltip when clicking anywhere in body
d3.select("svg")
	.on("click", function(d) {stopTooltip = true;});*/
