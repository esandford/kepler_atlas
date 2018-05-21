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

//Angle conversion functions
function toRadians (angle) { return angle * (Math.PI / 180);}
function toDegrees (angle) { return angle * (180 / Math.PI);}

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

//create the scene
var scene = x3d.append("scene")
				        .attr("class","x3dom-scene")
                .attr("id","theScene");
//starts camera at ideal viewpoint
var view = 'galaxy';
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
  .attr("id", "vp")
  .attr("position", view_pos.join(" "))
  .attr("orientation", view_or.join(" "))
  .attr("fieldOfView", fov)
  .attr('centerOfRotation', "0 0 0")
  .attr('zNear', zN)
  .attr('zFar', zF)
  .attr("description", "defaultX3DViewpointNode").attr("set_bind", "true");

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Plot stars //////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Draw the Kepler stars			
var drawn_keplerstars = scene.selectAll(".keplerstar")
							 .data(keplerstars)
            				 .enter()
            				 .append('transform')
            				 .attr('translation', function(d){ 
            				    var xyz = convertXYZ(distance=d.dist, xyzinputRA=d.ra, xyzinputdec=d.dec);
								        var x = xyz[0];
								        var y = xyz[1];
								        var z = xyz[2];

                        d.x = xScale(x);
                        d.y = yScale(y);
                        d.z = zScale(z);

            				    return xScale(x) + ' ' + yScale(y) + ' ' + zScale(z);})
            				 .append('shape')
                     .attr('class', 'keplerstar')
            				 .call(makeSolid, color=function(d){
            				 return keplerstarscolorScale(d.koi_steff)}, opacity=1) //uses a function to return the STeff and apply our color scale to create differences 
            				 .append('sphere')
            				 .attr('radius', function(d) {return 0.25*rScale(d.koi_srad)}) //draw spheres to represent points, using a function to return the radius and apply the radius scale

//Draw the bright star catalog
var drawn_brightstars = scene.selectAll(".brightstar")
				.data(brightstars)
            	.enter()
            	.append('transform')
            	.attr('translation', function(d){ 
            		var xyz = convertXYZ(distance=d.dist, xyzinputRA=d.RA, xyzinputdec=d.dec);
					      var x = xyz[0];
					      var y = xyz[1];
					      var z = xyz[2];
            		return xScale(x) + ' ' + yScale(y) + ' ' + zScale(z);})
            	.append('shape')
            	.call(makeSolid, color=function(d){return vmagcolorscale(d.Vmagnitude)}, opacity=0.8)
            	.attr('class', 'brightstar')
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
					.call(makeSolid, color='blue', opacity=0.4) 			//set the color
          			.append('cylinder')					//make the shape a 2D circle
					.attr('radius', function(d){return d.radius;})	//set the radius
					.attr('height', function(d){return d.height})
					.attr('subdivision',40)


// Enable switch to "Earth view," i.e. view from the Kepler satellite
function earthView() {
        view = 'earth';
        stopTooltip=false;
				var fov = 0.25;
				var view_pos = [-117.67830, -491.90906, -114.90123]
				var view_or = [0.98242, 0.00872, -0.18650, 1.87139]
				var zN = -1000.;
				var zF = 10000.;

				viewpoint.attr("position", view_pos.join(" "))
				    .attr("orientation", view_or.join(" "))
				    .attr('zNear', zN)
  				  .attr('zFar', zF)
  				  .attr("fieldOfView", fov)
            .attr('centerOfRotation', "0 0 0");

				//drawn_keplerstars.attr('radius', function(d) {return 0.25*rScale(d.koi_srad);})
        var x3dElem  = document.getElementById('chartholder');
        console.log(x3dElem);
        var vMatInv  = x3dElem.runtime.viewMatrix().inverse();
        var vMat = x3dElem.runtime.viewMatrix()
        console.log(vMat);
        console.log(vMatInv);
				}

// Enable switch back to "Galaxy view"
function galaxyView() {
        view = 'galaxy';
	      stopTooltip=false;
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


function planetView(system_kepID){
  console.log(system_kepID);

  //remove earlier-drawn planetary system, if there is one
  var nodesToDelete = document.getElementsByClassName("planetHost");
  while(nodesToDelete[0]){
    nodesToDelete[0].parentNode.removeChild(nodesToDelete[0]);
  }

  var nodesToDelete = document.getElementsByClassName("planet");
  while(nodesToDelete[0]){
    nodesToDelete[0].parentNode.removeChild(nodesToDelete[0]);
  }

  var nodesToDelete = document.getElementsByClassName("orbit");
  while(nodesToDelete[0]){
    nodesToDelete[0].parentNode.removeChild(nodesToDelete[0]);
  }

  var nodesToDelete = document.getElementsByClassName("zone");
  while(nodesToDelete[0]){
    nodesToDelete[0].parentNode.removeChild(nodesToDelete[0]);
  }

  var nodesToDelete = document.getElementsByClassName("zoneUD");
  while(nodesToDelete[0]){
    nodesToDelete[0].parentNode.removeChild(nodesToDelete[0]);
  }

  //make the tooltip go away
  stopTooltip = true;

  //fly away to a random point in space to draw the planet view
  var fov = 0.005;
  var view_pos = [49995.04201, 9644.33980, 11267.33030]
  var view_or = [0.58043, 0.57246, 0.57913, 2.08821]
  var zN = -150000.;
  var zF = 150000.;
  var cor = [10000, 10000, 11000]

  viewpoint.attr("position", view_pos.join(" "))
    .attr("orientation", view_or.join(" "))
    .attr('zNear', zN)
    .attr('zFar', zF)
    .attr("fieldOfView", fov)
    .attr("centerOfRotation", cor);

  //display the system
  var solarRad_to_AU = 0.00465046726;
  var to_draw = [];
  to_draw.length = 0;
  var scales_arr = [];
  scales_arr.length = 0;
  var planetToDraw = {};

  for(i=0;i<keplerstars.length;i++){
    if(keplerstars[i].kepid == system_kepID){
      keplerstars[i].theta = 0; //for the animation, below
      //make a copy of this object to use its data
      var starcopy = JSON.parse(JSON.stringify(keplerstars[i]))
      //empty this object out
      for (var member in planetToDraw) delete planetToDraw[member];

      planetToDraw.koi_period = starcopy.koi_period;
      planetToDraw.koi_srad = starcopy.koi_srad;
      planetToDraw.koi_ror = starcopy.koi_ror;
      planetToDraw.koi_sma = starcopy.koi_sma;
      planetToDraw.koi_steff = starcopy.koi_steff;
      planetToDraw.koi_teq = starcopy.koi_teq;
      planetToDraw.theta = starcopy.theta;

      to_draw.push(planetToDraw);

      scales_arr.push(planetToDraw.koi_srad * solarRad_to_AU);
      scales_arr.push(planetToDraw.koi_srad * planetToDraw.koi_ror * solarRad_to_AU);
      scales_arr.push(planetToDraw.koi_sma);
      };
  };

  var smaMin = d3.min(scales_arr);
  var smaMax = d3.max(scales_arr);

  var max_to_min_ratio = smaMax/smaMin;
                          
  var smaScale = d3.scale.linear()
                  .domain([smaMin, smaMax])
                  .range([1, max_to_min_ratio]);

  // all correct ratios
  var drawn_planetHost = scene.selectAll(".planetHost")
                        .data(to_draw)
                         .enter()
                         .append('transform')
                         .attr('translation', '10000 10000 11000')
                         .append('shape')
                         .call(makeSolid, color='blue',opacity=1)//color=function(d){return keplerstarscolorScale(d.koi_steff)}, opacity=1) //uses a function to return the STeff and apply our color scale to create differences 
                         .append('box')
                         .attr('size', function(d){
                          return smaScale(d.koi_srad*solarRad_to_AU) + ' ' + smaScale(d.koi_srad*solarRad_to_AU) + ' ' + smaScale(d.koi_srad*solarRad_to_AU)
                          })
                         //.append('sphere')
                         //.attr('radius', function(d){
                         // return smaScale(d.koi_srad*solarRad_to_AU);})
                         //.attr('radius', function(d) {return 0.75*rorScale(d.koi_srad)})
                         .attr('class', 'planetHost')

                         

  var drawn_planet = scene.selectAll(".planet")
                          .data(to_draw)
                           .enter()
                           .append('transform')
                           .attr('translation', function(d){return 10000+smaScale(d.koi_sma) + ' ' + 10000 + ' ' + 11000})
                           .attr('class','planetpos')
                           .append('shape')
                           .call(makeSolid, color=function(d){return keplerplanetcolorScale(d.koi_teq)}, opacity = 1) 
                           .attr('class', 'planet')
                           //.append('sphere')
                           //.attr('radius', function(d){return smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU);})//draw spheres to represent points, using a function to return the radius and apply the radius scale
                           //.attr('radius', function(d){return 0.75*rorScale(d.koi_ror * d.koi_srad)}); //draw spheres to represent points, using a function to return the radius and apply the radius scale
                           
                           .append('cone')
                           .attr('bottomRadius', function(d){return smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU);})
                           .attr('height', function(d){return smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU);})
                           

  var drawn_orbit = scene.selectAll(".orbit")   //creates a selection, which is currently empty
                  .data(to_draw)        //join "circles" list
                  .enter()          //enter "circles" into empty selection. the selection now contains all of "circles", and everything after this loops over each circle in turn
                  .append('transform')    //for each circle, append a "transform" object
                  .attr('translation', '10000 10000 11000')   //specify that this "transform" will impose a rotation of the circle
                  .append('shape')          //for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
                  .call(makeSolid, color='black', opacity=1)       //set the color
                        .append('Circle2D')         //make the shape a 2D circle
                  .attr('radius', function(d){
                  //console.log(smaScale(d.koi_sma));
                  return smaScale(d.koi_sma);})  //set the radius
                  //.attr('radius', function(d){return 30*smaScale(d.koi_sma);})  //set the radius
                  .attr('subdivision',5000)      //set the"resolution" of the circle, i.e. how many line segments are drawn to make up the circle
                  .attr('class', 'orbit');

  var drawn_zone = scene.selectAll(".zone")
                          .data(to_draw)
                          .enter()
                          .append('transform')
                          .attr('translation', '10000 10000 11000')
                          .append('shape')
                          .call(makeSolid, color= 'lightskyblue', opacity=1)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30)
                          .attr('class', 'zone');

  var drawn_zoneUpsideDown = scene.selectAll(".zoneUD")
                          .data(to_draw)
                          .enter()
                          .append('transform')  
                          .attr('translation', '10000 10000 11000')  
                          .attr('rotation', '1 0 0 3.14159') //flip over
                          .append('shape')
                          .call(makeSolid, color= 'lightskyblue', opacity=1)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30)
                          .attr('class', 'zoneUD');

  //Calculate the new x or y position per planet
  function locate() {
    return function(d){
      var k = 360 / (d.koi_period * resolution * speedUp);
      for (var i = 0; i < resolution; i++) {
        d.theta += k;
      }
    
      if (d.theta > 360){
        d.theta -= 360;
      }

      var newX = d.koi_sma * Math.cos(toRadians(d.theta)); //AU
      var newY = d.koi_sma * Math.sin(toRadians(d.theta)); //AU
      
      var newX_shifted = smaScale(newX)+10000;
      var newY_shifted = smaScale(newY)+10000;

      return newX_shifted + ' ' + newY_shifted + ' ' + 11000;};
  };

  //Change x and y location of each planet
  d3.timer(function() {
      scene.selectAll(".planetpos")
            .attr('translation', locate());
  });
};
