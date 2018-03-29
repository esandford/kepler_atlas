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

var view_pos = [0., 500., 50000.]; //x, y, z relative to origin (0, 0, 0)
//var view_pos = [-37902.27708, -31717.63386, -17253.83076]; //new view_pos and fov -Chris
var fov = 0.05; 	// Preferred minimum viewing angle from this viewpoint in radians. 
				// Small field of view roughly corresponds to a telephoto lens, 
				// large field of view roughly corresponds to a wide-angle lens. 
				// Hint: modifying Viewpoint distance to object may be better for zooming. 
				// Warning: fieldOfView may not be correct for different window sizes and aspect ratios. 

var view_or = [1., 0., 0., 0.]; //relative to default (0, 0, 1, 0)
var zN = 0; 		//near plane
var zF = 150000;	//far plane

var viewpoint = scene.append("viewpoint")
  .attr("id", 'dvp')
  .attr("position", view_pos.join(" "))
  .attr("orientation", view_or.join(" "))
  .attr("fieldOfView", fov)
  .attr('centerOfRotation', "0 0 0")
  .attr('zNear', zN)
  .attr('zFar', zF)
  .attr("description", "defaultX3DViewpointNode").attr("set_bind", "true");


var xax = d3.scale.linear().range([0, 200]);
var yax = d3.scale.linear().range([0, 200]);
var zax = d3.scale.linear().range([0, 200]);

var xAxis = d3_x3dom_axis.x3domAxis('x', 'z', xax).tickSize(zax.range()[1] - zax.range()[0]).tickPadding(yax.range()[0]);
var yAxis = d3_x3dom_axis.x3domAxis('y', 'z', yax).tickSize(zax.range()[1] - zax.range()[0]);
var yAxis2 = d3_x3dom_axis.x3domAxis('y', 'x', yax).tickSize(xax.range()[1] - xax.range()[0]).tickFormat(function(d){return ''});
var zAxis = d3_x3dom_axis.x3domAxis('z', 'x', zax).tickSize(xax.range()[1] - xax.range()[0]);
scene.append('group')
    .attr('class', 'xAxis')
    .call(xAxis)
    .select('.domain').call(makeSolid, 'blue'); //parallel lines in z vs x plane
        
scene.append('group')
    .attr('class', 'yAxis')
    .call(yAxis)
    .select('.domain').call(makeSolid, 'red'); //parallel lines in y vs z plane
  
scene.append('group')
    .attr('class', 'yAxis')
    .call(yAxis2)
    .select('.domain').call(makeSolid, 'red'); //parallel lines in y vs x plane
  
scene.append('group')
    .attr('class', 'zAxis')
    .call(zAxis);
    

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
	.domain([radMin, radMax])
	.range([5, 30]); //james

//set scale for size of Bright Star Catalog stars -James & Chris
function return_vmagnitude_minmax(brightstars){
	var currentMinimum = 1000000;
	var currentMaximum = 0;
	var currentVmagnitude;

	for(i=0; i<brightstars.length; i++){
		currentVmag = brightstars[i].Vmagnitude;

		if(currentVmag< currentMinimum){
			currentMinimum = currentVmag;
		}

		if(currentVmag > currentMaximum){
			currentMaximum = currentVmag;
		}

	}
	return [currentMinimum, currentMaximum];
	
	}
vmagMin = return_vmagnitude_minmax(brightstars)[0]
vmagMax = return_vmagnitude_minmax(brightstars)[1]

var vmagScale = d3.scale.linear()	
	.domain([vmagMin, vmagMax])
	.range([0.5, 1]);

//scale x and y "axes"
var xScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000]);
var yScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000])
var zScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000]);

//Format with 2 decimals
var formatSI = d3.format(".2f");

//Create the gradients for the planet fill
var gradientChoice = "Temp";
// createGradients();


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
            	.attr('radius', function(d) {return 0.25*rScale(d.koi_srad)}); //draw spheres to represent points, using a function to return the radius and apply the radius scale

//Drawing BSC	
var brightstars = scene.selectAll(".brightstars")
				.data(brightstars)
            	.enter()
            	.append('transform')
            	.attr('class', 'point')
            	.attr('translation', function(d){ 
            		var xyz = convertXYZ(distance=d.dist, xyzinputRA=d.RA, xyzinputdec=d.dec);
					var x = xyz[0];
					var y = xyz[1];
					var z = xyz[2];

            		return xScale(x) + ' ' + yScale(y) + ' ' + zScale(z);})
            	.append('shape')
            	.call(makeSolid, function(d) {return "Gold"})
            	.append('sphere')
            	.attr('radius', function(d) {return d.vmagScale});


//add cylinder to the site - Catherine & Caroline
//note: we need to rotate this so that the cylinder lies in the xy-plane insead pf the xz-plane! -Emily
var cylinders = [{"height":70, "radius":2000}]; //Catherine
//var cylinders = [{"height":30, "radius":2000}]; //Caroline


var drawn_cylinders = scene.selectAll(".cylinder") 	
					.data(cylinders)				
					.enter()					
					.append('shape')					//for each cylinder, append an as-yet-unspecified shape to be drawn on our 3D canvas
					.call(makeSolid, 'blue') 			//set the color
            		.append('cylinder')				//make the shape a 3D cylinder
					.attr('radius', function(d){return d.radius;})	//set the radius
					.attr('height', function(d){return d.height;}) // set the height
					.attr('diffuseColor',0.6) //attempt to make transparent


//new function to switch camera position to Earth sky view -Caroline & Catherine
function earthView() {
				var fov = 0.25;
				var view_pos = [-117.67830, -491.90906, -114.90123]
				var view_or = [0.98242, 0.00872, -0.18650, 1.87139]
				var zN = -1000.;
				var zF = 10000.;

				viewpoint.attr("position", view_pos.join(" "))
				  .attr("orientation", view_or.join(" "))
				  .attr('zNear', zN)
  				  .attr('zFar', zF)
  				  .attr("fieldOfView", fov);

				//planets.attr('radius', function(d) {return 0.25*rScale(d.koi_srad);})

				}

function galaxyView() {
	
				var view_pos = [0., 500., 50000.];
				var view_or = [1., 0., 0., 0.]; 
				var fov = 0.05;
				var zN = 0; 
				var zF = 150000;

				viewpoint.attr("position", view_pos.join(" "))
				  .attr("orientation", view_or.join(" "))
				  .attr("fieldOfView", fov)
				  .attr('centerOfRotation', "0 0 0")
				  .attr('zNear', zN)
  				  .attr('zFar', zF)
  				  
				//planets.attr('radius', function(d) {return 1.5*rScale(d.koi_srad);}) //james 

				}


