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
var makeSolid = function(selection, color, opacity) {
            selection.append("appearance")
                .append("material")
                .attr("diffuseColor", color || "black")
                .attr("transparency", function(){return 1 - opacity;})
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
	radiusJupiter = 69911; //km
	phi=0;

var formatSI = d3.format(".2f");

//In the html code, we've created an object of ID "chartholder" within <x3d> tags. Here, we set the dimensions of that object. -ES
var x3d = d3.select("#chartholder")
			.attr("class","x3dom-canvas")
            .attr("width", x + 'px')
            .attr("height", y +'px')
            .attr("showLog", 'true')
            .attr("showStat", 'true');

d3.select('.x3dom-canvas') //creates a canvas to hold the 3d objects
  .attr("width", x)
  .attr("height", y);

//starts camera at ideal viewpoint
var scene = x3d.append("scene")
				.attr("class","x3dom-scene");

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


/*var xax = d3.scale.linear().range([0, 200]);
var yax = d3.scale.linear().range([0, 200]);
var zax = d3.scale.linear().range([0, 200]);

var xAxis = d3_x3dom_axis.x3domAxis('x', 'z', xax).tickSize(zax.range()[1] - zax.range()[0]).tickPadding(yax.range()[0]);
var yAxis = d3_x3dom_axis.x3domAxis('y', 'z', yax).tickSize(zax.range()[1] - zax.range()[0]);
var yAxis2 = d3_x3dom_axis.x3domAxis('y', 'x', yax).tickSize(xax.range()[1] - xax.range()[0]).tickFormat(function(d){return ''});
var zAxis = d3_x3dom_axis.x3domAxis('z', 'x', zax).tickSize(xax.range()[1] - xax.range()[0]);
scene.append('group')
    .attr('class', 'xAxis')
    .call(xAxis)
    .select('.domain').call(makeSolid, 'blue', 1.0); //parallel lines in z vs x plane
        
scene.append('group')
    .attr('class', 'yAxis')
    .call(yAxis)
    .select('.domain').call(makeSolid, 'red', 1.0); //parallel lines in y vs z plane
  
scene.append('group')
    .attr('class', 'yAxis')
    .call(yAxis2)
    .select('.domain').call(makeSolid, 'red', 1.0); //parallel lines in y vs x plane
  
scene.append('group')
    .attr('class', 'zAxis')
    .call(zAxis)
    ;//.select('.domain'); //parallel lines in x vs z plane
*/

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Plot stars //////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Draw the Kepler stars			
var drawn_keplerstars = scene.selectAll(".keplerstar")
							 .data(keplerstars)
            				 .enter()
            				 .append('transform')
            				 .attr('class', 'keplerstar')
            				 .attr('translation', function(d){ 
            					var xyz = convertXYZ(distance=d.dist, xyzinputRA=d.ra, xyzinputdec=d.dec);
          								 var x = xyz[0];
          								 var y = xyz[1];
          								 var z = xyz[2];

            					 return xScale(x) + ' ' + yScale(y) + ' ' + zScale(z);})
            				 .append('shape')
            				 .call(makeSolid, color=function(d){
            				 return keplerstarscolorScale(d.koi_steff)}, opacity=1) //uses a function to return the STeff and apply our color scale to create differences 
            				 .append('sphere')
            				 .attr('radius', function(d) {return 0.25*rScale(d.koi_srad)}) //draw spheres to represent points, using a function to return the radius and apply the radius scale

//Draw the bright star catalog
var drawn_brightstars = scene.selectAll(".brightstar")
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
            	.call(makeSolid, color=function(d){return vmagcolorscale(d.Vmagnitude)}, opacity=0.8)
            	.append('sphere')
            	.attr('radius', function(d) {return vmagRscale(d.Vmagnitude)});


// draw a cylinder to represent the Milky Way disk
var cylinder = [{"height":20, "radius":2000, "rotaxis_xcoord":1, "rotaxis_ycoord":0, "rotaxis_zcoord":0, "rot_angle":1.570796}];

var drawn_cylinder = scene.selectAll(".cylinder") 	
					.data(cylinder)				
					.enter()					
					.append('transform')
					.attr('rotation', function(d){    //specify that this "transform" will impose a rotation of the circle
						return d.rotaxis_xcoord + ' ' + d.rotaxis_ycoord + ' ' + d.rotaxis_zcoord + ' ' + d.rot_angle;
					})
					.append('shape')					//for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
					.call(makeSolid, color='silver', opacity=0.5) 			//set the color
          			.append('cylinder')					//make the shape a 2D circle
					.attr('radius', function(d){return d.radius;})	//set the radius
					.attr('height', function(d){return d.height})
					.attr('subdivision',40)


// Enable switch to "Earth view," i.e. view from the Kepler satellite
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

				//drawn_keplerstars.attr('radius', function(d) {return 0.25*rScale(d.koi_srad);})

				}

// Enable switch back to "Galaxy view"
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
  				  
				//drawn_keplerstars.attr('radius', function(d) {return 1.5*rScale(d.koi_srad);}) //james 

				}

function getRelativeCoords(event) {
    return { x: event.offsetX, y: event.offsetY };
}

var all_keplerstars = document.getElementsByClassName("keplerstar");

for (i=0; i < all_keplerstars.length; i++) {
    all_keplerstars[i].onclick = function(d){

    	coords = getRelativeCoords(event);
      stopTooltip = false;
		  showTooltip(d.hitObject.__data__, coords);
    }
};

// function planetView() {



// var view_or = [0.58043, 0.57246, 0.57913, 2.08821]
// var zN = 0;     //near plane
// var zF = 1500000; //far plane

// var resolution = 1, //sets behavior or animation orbit
//   speedUp = 1000, //speed of planets
//   au = 149597871, //km
//   radiusSun = 695800, //km
//   radiusJupiter = 69911; //km

// var stopTooltip = false;  

//   viewpoint.attr("position", view_pos.join(" "))
//           .attr("orientation", view_or.join(" "))
//           .attr("fieldOfView", fov)
//           .attr('centerOfRotation', "0 0 0")
//           .attr('zNear', zN)
//           .attr('zFar', zF)
//           .attr("description", "defaultX3DViewpointNode").attr("set_bind", "true");


// var drawn_star = scene.selectAll(".keplerstar")
//                .data(to_draw)
//                      .enter()
//                      .append('transform')
//                      .attr('class', 'point')
//                      .attr('translation', '0 0 0')
//                      .append('shape')
//                      .call(makeSolid, color=function(d){return keplerstarscolorScale(d.koi_steff)}, opacity=1) //uses a function to return the STeff and apply our color scale to create differences 
//                      .append('sphere')
//                      .attr('radius', function(d) {return rorScale(d.koi_srad)})
//                      .attr('class', 'keplerstar')

// var drawn_planet = scene.selectAll(".keplerstar")
//                .data(to_draw)
//                      .enter()
//                      .append('transform')
//                      .attr('class', 'point')
//                      .attr('translation', function(d){return smaScale(d.koi_sma) + ' ' + 0 + ' ' + 0;})
//                      .append('shape')
//                      .call(makeSolid, color=function(d){return keplerplanetcolorScale(d.koi_teq)}, opacity = 1) //uses a function to return the STeff and apply our color scale to create differences 
//                      //.call(makeSolid, color="blue", opacity = 1) //uses a function to return the STeff and apply our color scale to create differences 
//                      .append('sphere')
//                      .attr('radius', function(d){return rorScale(d.koi_ror * d.koi_srad)}); //draw spheres to represent points, using a function to return the radius and apply the radius scale
//                      .attr('class', 'planet')
//                      .attr('class', 'orbit')


// var orbit = scene.selectAll(".orbits")   //creates a selection, which is currently empty
//           .data(to_draw)        //join "circles" list
//           .enter()          //enter "circles" into empty selection. the selection now contains all of "circles", and everything after this loops over each circle in turn
//           .append('transform')    //for each circle, append a "transform" object
//           .attr('translation', '0 0 0')   //specify that this "transform" will impose a rotation of the circle
//           .attr('rotation', '1 0 0')
//           .append('shape')          //for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
//           .call(makeSolid, color='black', opacity=1)       //set the color
//                 .append('Circle2D')         //make the shape a 2D circle
//           .attr('radius', function(d){return smaScale(d.koi_sma);})  //set the radius
//           .attr('subdivision',100)


// var drawn_zone = scene.selectAll(".zone")
//                           .data(to_draw)
//                           .enter()
//                           .append('shape')
//                           .call(makeSolid, color= 'lightskyblue', opacity=1)
//                           .append('Disk2D')
//                           .attr('innerradius', function(d){return (Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2)})
//                           .attr('outerradius', function(d){return (Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2)})
//                           .attr('subdivision', 30)
//                           .attr('class', 'zone')

// function toRadians (angle) { return angle * (Math.PI / 180);}
// function toDegrees (angle) { return angle * (180 / Math.PI);}

// //Calculate the new x or y position per planet
// function locate() {
//   return function(d){
//     var k = 360 / (d.koi_period * resolution * speedUp);
//     for (var i = 0; i < resolution; i++) {
//       d.theta += k;
//     }
    
//     if (d.theta > 360) {d.theta -= 360;}

//     var newX = d.koi_sma * Math.cos(toRadians(d.theta)); //AU
//     var newY = d.koi_sma * Math.sin(toRadians(d.theta)); //AU
    
//     return smaScale(newX) + ' ' +smaScale(newY) + ' ' + 0;};
//   };

// //Change x and y location of each planet
// d3.timer(function() {
//     scene.selectAll(".planetpos")
//             .attr('translation', locate());
// })     
}
