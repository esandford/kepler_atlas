//Width and Height of the SVG
var 
	w = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = ((w.innerWidth || e.clientWidth || g.clientWidth) - 50),
	y = ((w.innerHeight|| e.clientHeight|| g.clientHeight) - 150);

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

//number of times we've drawn a planet view
var nPlanetViewDraws = 0;
var timer;

var formatSI = d3.format(".2f");
//Angle conversion functions

function toRadians (angle) { return angle * (Math.PI / 180);}
function toDegrees (angle) { return angle * (180 / Math.PI);}

//In the html code, we've created an object of ID "chartholder" within <x3d> tags. Here, we set the dimensions of that object. -ES
var x3d = d3.select("#chartholder")
			.attr("class","x3dom-canvas")
            .attr("width", x + "px")
            .attr("height", y + "px")
            .attr("showLog", "true")
            .attr("showStat", "true");

//create the scene
var scene = x3d.append("scene")
				        .attr("class","x3dom-scene")
                //.attr("id","theScene");

var sceneToRef = scene._groups[0][0]
sceneToRef.setAttribute("id","theScene")

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
  //.attr("description", "defaultX3DViewpointNode").attr("set_bind", "true");

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
            				 .attr('class', 'keplerstar')
                     .append('shape')                
            				 .call(makeSolid, color=function(d){
            				 return keplerstarscolorScale(d.koi_steff)}, opacity=1) //uses a function to return the STeff and apply our color scale to create differences 
            				 .append('sphere')
            				 .attr('radius', function(d) {return 0.25*rScale(d.koi_srad)}) //draw spheres to represent points, using a function to return the radius and apply the radius scale

//Draw the bright star catalog
/*var drawn_brightstars = scene.selectAll(".brightstar")
				.data(brightstars)
            	.enter()
            	.append('transform')
            	.attr('translation', function(d){ 
            		var xyz = convertXYZ(distance=d.dist, xyzinputRA=d.RA, xyzinputdec=d.dec);
					      var x = xyz[0];
					      var y = xyz[1];
					      var z = xyz[2];
            		return xScale(x) + ' ' + yScale(y) + ' ' + zScale(z);})
            	.attr('class', 'brightstar')
              .append('shape')
            	.call(makeSolid, color=function(d){return vmagcolorscale(d.Vmagnitude)}, opacity=0.8)
              .append('sphere')
            	.attr('radius', function(d) {return vmagRscale(d.Vmagnitude)});
*/


// draw a cylinder to represent the Milky Way disk
var cylinder = [{"height":20, "radius":2000, "rotaxis_xcoord":1, "rotaxis_ycoord":0, "rotaxis_zcoord":0, "rot_angle":1.570796}];

var drawn_cylinder = scene.selectAll(".cylinder") 	
					.data(cylinder)				
					.enter()					
					.append('transform')
					.attr('rotation', function(d){    //specify that this "transform" will impose a rotation of the circle
						return d.rotaxis_xcoord + ' ' + d.rotaxis_ycoord + ' ' + d.rotaxis_zcoord + ' ' + d.rot_angle;
					})
					.attr('class', 'MWdisk')
          .append('shape')					//for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
					.call(makeSolid, color='blue', opacity=0.4) 			//set the color
          			.append('cylinder')					//make the shape a 2D circle
					.attr('radius', function(d){return d.radius;})	//set the radius
					.attr('height', function(d){return d.height})
					.attr('subdivision',40)



// Enable switch to "Earth view," i.e. view from the Kepler satellite
function earthView() {
        console.log("beginning earthView");
        console.log(sceneToRef);
        console.log(sceneToRef.childNodes.length);
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

        if(nPlanetViewDraws > 0){
          timer.stop();
          $('#theScene > .planetHost').remove();
          $('#theScene > .planet').remove();
          $('#theScene > .planetpos').remove();
          $('#theScene > .orbit').remove();
          $('#theScene > .zone').remove();
          $('#theScene > .zoneUD').remove();
        }
				//drawn_keplerstars.attr('radius', function(d) {return 0.25*rScale(d.koi_srad);})
        
        //var x3dElem  = document.getElementById('chartholder');
        //console.log(x3dElem);
        //var vMatInv  = x3dElem.runtime.viewMatrix().inverse();
        //var vMat = x3dElem.runtime.viewMatrix()
        //console.log(vMat);
        //console.log(vMatInv);
				}

// Enable switch back to "Galaxy view"
function galaxyView() {
        console.log("beginning galaxyView");
        console.log(sceneToRef);
        console.log(sceneToRef.childNodes.length);

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
  			
        if(nPlanetViewDraws > 0){
          timer.stop();
          $('#theScene > .planetHost').remove();
          $('#theScene > .planet').remove();
          $('#theScene > .planetpos').remove();
          $('#theScene > .orbit').remove();
          $('#theScene > .zone').remove();
          $('#theScene > .zoneUD').remove();
        }

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
  //console.log(system_kepID);

  //console.log(scene);
  //console.log(scene._groups[0]);
  //console.log(scene._groups[0][0]);
  console.log("beginning planetView");
  console.log(sceneToRef);
  console.log(sceneToRef.childNodes.length);

  //remove earlier-drawn planetary system ,if there is one
  if(nPlanetViewDraws > 0){
    $('#theScene > .planetHost').remove();
    $('#theScene > .planet').remove();
    $('#theScene > .planetpos').remove();
    $('#theScene > .orbit').remove();
    $('#theScene > .zone').remove();
    $('#theScene > .zoneUD').remove();
  }
  
  console.log(sceneToRef);
  console.log(sceneToRef.childNodes.length);
  //make the tooltip go away
  stopTooltip = true;

  //fly away to a random point in space to draw the planet view
  var fov = 0.005;
  var view_pos = [49995.04201, 9644.33980, 11267.33030]
  var view_or = [0.58043, 0.57246, 0.57913, 2.08821]
  var zN = 0.;
  var zF = 5000000.;
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
      
      //make a copy of this object to hold its data
      var planetToDraw;

      //empty this object out
      for (var member in planetToDraw) delete planetToDraw[member];

      //make a copy of this object to use its data
      var planetToDraw = $.extend(true,{},keplerstars[i]) //JSON.parse(JSON.stringify(keplerstars[i]))

      to_draw.push(planetToDraw);

      scales_arr.push(planetToDraw.koi_srad * solarRad_to_AU);
      scales_arr.push(planetToDraw.koi_srad * planetToDraw.koi_ror * solarRad_to_AU);
      scales_arr.push(planetToDraw.koi_srad * planetToDraw.koi_dor * solarRad_to_AU);
      scales_arr.push((Math.pow(planetToDraw.koi_steff,2)/Math.pow(273,2))*((planetToDraw.koi_srad * solarRad_to_AU)/2)); //outer HZ radius
      };
  };
  
  var smaMin = d3.min(scales_arr);
  var smaMax = d3.max(scales_arr);

  //var max_to_min_ratio = smaMax/smaMin;

  //while(max_to_min_ratio > x){
  //  max_to_min_ratio = max_to_min_ratio/2;
  //}
  
  var smaScale = null;                          
  smaScale = d3.scale.linear()
                  .domain([smaMin, smaMax])
                  //.range([1, max_to_min_ratio]);
                  .range([1.5, x/1.5])

  console.log(to_draw);
  // all correct ratios
  var drawn_planetHost = scene.selectAll(".planetHost")
                        .data(to_draw)
                         .enter()
                         .append('transform')
                         .attr('class', 'planetHost')
                         .attr('translation', '10000 10000 11000')
                         .append('shape')
                         .call(makeSolid, color=function(d){
                          console.log('drawn')
                          return keplerstarscolorScale(d.koi_steff)}, opacity=1)
                         //.append('sphere')
                         //.attr('radius', 2)
                         //.attr('radius', function(d){return smaScale(d.koi_srad*solarRad_to_AU);})
                         //.attr('radius', function(d) {return 0.75*rorScale(d.koi_srad)})
                         .append('box')
                         .attr('size', function(d){
                          console.log(smaScale(d.koi_srad*solarRad_to_AU));
                          return smaScale(d.koi_srad*solarRad_to_AU) + ' ' + smaScale(d.koi_srad*solarRad_to_AU) + ' ' + smaScale(d.koi_srad*solarRad_to_AU)})
                         
  //console.log(drawn_planetHost)
  var drawn_planet = scene.selectAll(".planet")
                          .data(to_draw)
                           .enter()
                           .append('transform')
                           .attr('class', 'planet')
                           .attr('translation', function(d){return 10000+smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU) + ' ' + 10000 + ' ' + 11000})
                           .attr('class','planetpos')
                           .append('shape')
                           .call(makeSolid, color=function(d){return keplerplanetcolorScale(d.koi_teq)}, opacity = 1) 
                           //.append('sphere')
                           //.attr('radius', '2')
                           //.attr('radius', function(d){
                           //    console.log(smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU))
                           //    return smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU) + 1;})
                           //.attr('subdivision', 40)
                           //.attr('radius', function(d){return 0.75*rorScale(d.koi_ror * d.koi_srad)}); //draw spheres to represent points, using a function to return the radius and apply the radius scale
                           .append('box')
                           .attr('size', function(d){
                            console.log(smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU))
                            return smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU) + ' ' + smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU) + ' ' + smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU)})

  var drawn_orbit = scene.selectAll(".orbit")   //creates a selection, which is currently empty
                  .data(to_draw)        //join "circles" list
                  .enter()          //enter "circles" into empty selection. the selection now contains all of "circles", and everything after this loops over each circle in turn
                  .append('transform')    //for each circle, append a "transform" object
                  .attr('class', 'orbit')
                  .attr('translation', '10000 10000 11000')   //specify that this "transform" will impose a rotation of the circle
                  .append('shape')          //for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
                  .call(makeSolid, color='black', opacity=1)       //set the color
                        .append('Circle2D')         //make the shape a 2D circle
                  .attr('radius', function(d){
                  return smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU);})  //set the radius
                  //.attr('radius', function(d){return 30*smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU);})  //set the radius
                  .attr('subdivision',5000)      //set the"resolution" of the circle, i.e. how many line segments are drawn to make up the circle

  var drawn_zone = scene.selectAll(".zone")
                          .data(to_draw)
                          .enter()
                          .append('transform')
                          .attr('class', 'zone')
                          .attr('translation', '10000 10000 11000')
                          .append('shape')
                          .call(makeSolid, color= 'lightskyblue', opacity=1)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30)
                          

  var drawn_zoneUpsideDown = scene.selectAll(".zoneUD")
                          .data(to_draw)
                          .enter()
                          .append('transform')
                          .attr('class', 'zoneUD')  
                          .attr('translation', '10000 10000 11000')  
                          .attr('rotation', '1 0 0 3.14159') //flip over
                          .append('shape')
                          .call(makeSolid, color= 'lightskyblue', opacity=1)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30)
                          

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

      var newX_shifted = smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU)*Math.cos(toRadians(d.theta)) + 10000;
      var newY_shifted = smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU)*Math.sin(toRadians(d.theta)) + 10000;

      //console.log(Math.pow(newX, 2) + Math.pow(newY, 2));

      return newX_shifted + ' ' + newY_shifted + ' ' + 11000;};
  };

  //Change x and y location of each planet
  timer = d3.timer(function() {
                scene.selectAll(".planetpos")
                      .attr('translation', locate());
              });

  //increment counter of planet view draws
  nPlanetViewDraws += 1;
  //console.log(nPlanetViewDraws);
};

