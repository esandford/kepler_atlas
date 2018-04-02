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

////////////////////////////////////////////////////////////////////////////////////////////////////////
//set up x3dom scene

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

var view_pos = [0., 50., 5000.]; //x, y, z relative to origin (0, 0, 0)
//var view_pos = [-37902.27708, -31717.63386, -17253.83076]; //new view_pos and fov -Chris
var fov = 0.05; 	// Preferred minimum viewing angle from this viewpoint in radians. 
				// Small field of view roughly corresponds to a telephoto lens, 
				// large field of view roughly corresponds to a wide-angle lens. 
				// Hint: modifying Viewpoint distance to object may be better for zooming. 
				// Warning: fieldOfView may not be correct for different window sizes and aspect ratios. 

var view_or = [1., 0., 0., 0.]; //relative to default (0, 0, 1, 0)
//var zN = 0; 		//near plane
//var zF = 150000;	//far plane

var viewpoint = scene.append("viewpoint")
  .attr("id", 'dvp')
  .attr("position", view_pos.join(" "))
  .attr("orientation", view_or.join(" "))
  .attr("fieldOfView", fov)
  .attr('centerOfRotation', "0 0 0")
  //.attr('zNear', zN)
  //.attr('zFar', zF)
  .attr("description", "defaultX3DViewpointNode").attr("set_bind", "true");

////////////////////////////////////////////////////////////////////////////////////////////////////////
// set up x, y, z axes

var xax = d3.scale.linear().range([0, 100]);
var yax = d3.scale.linear().range([0, 100]);
var zax = d3.scale.linear().range([0, 100]);

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
    .call(zAxis)
    ;//.select('.domain'); //parallel lines in x vs z plane 

////////////////////////////////////////////////////////////////////////////////////////////////////////
// draw a circle!

//declare a list of circles. currently only contains one circle
var spheres_and_circles = [{"sphereradius":10,"circleradius":50,"xcenter":10, "ycenter":10, "zcenter":10, "rotaxis_xcoord":0 ,"rotaxis_ycoord":1, "rotaxis_zcoord":0, "rot_angle":0.5236}] //this rotation angle = 30 degrees, in radians.

//draw them in the x3dom scene!
var drawn_spheres_and_circles = scene.selectAll(".sphereandcircle") 	//creates a selection, which is currently empty
					.data(spheres_and_circles)				//join "circles" list
					.enter()					//enter "circles" into empty selection. the selection now contains all of "circles", and everything after this loops over each circle in turn
					.append('transform')		//for each circle, append a "transform" object
					.attr('translation', function(d){    //specify that this "transform" will impose a translation of the circle's spatial position
						return d.xcenter + ' ' + d.ycenter + ' ' + d.zcenter;
					})
					.attr('rotation', function(d){    //specify that this "transform" will impose a rotation of the circle
						return d.rotaxis_xcoord + ' ' + d.rotaxis_ycoord + ' ' + d.rotaxis_zcoord + ' ' + d.rot_angle;
					})
					.append('shape')					//for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
					.call(makeSolid, 'black') 			//set the color
            		.append('Circle2D')					//make the shape a 2D circle
					.attr('radius', function(d){return d.circleradius;})	//set the radius
					.attr('subdivision',100) 			//set the"resolution" of the circle, i.e. how many line segments are drawn to make up the circle
					//.append('shape')					//for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
					//.call(makeSolid, 'red') 			//set the color
          //  		.append('sphere')					//make the shape a 2D circle
					//.attr('radius', function(d){return d.sphereradius;})	//set the radius

var cylinders = [{"height":10, "radius":10, "rotaxis_xcoord":1}];

var drawn_cylinders = scene.selectAll(".cylinder") 	
					.data(cylinders)				
					.enter()					
					.append('transform')		
					.append('shape')					//for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
					.call(makeSolid, 'black') 			//set the color
          .append('cylinder')					//make the shape a 2D circle
					.attr('radius', function(d){return d.radius;})	//set the radius
					.attr('height', function(d){return d.height})









