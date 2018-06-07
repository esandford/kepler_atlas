//Width and Height of the SVG
var 
	w = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = ((w.innerWidth || e.clientWidth || g.clientWidth) - 50),
	y = ((w.innerHeight|| e.clientHeight|| g.clientHeight) - 50);

var makeSolid = function(selection, color, opacity) {
            selection.append("appearance")
                .append("material")
                .attr("diffuseColor", color || "black")
                .attr("transparency", function(){return 1 - opacity;})
            return selection;
        };
var stopTooltip = false;	
//Planet orbit variables
//The larger this is the more accurate the speed is
var resolution = 1, //sets behavior or animation orbit
	speedUp = 1000, //speed of planets
	au = 149597871, //km
	radiusSun = 695800, //km
	radiusJupiter = 69911; //km

//In the html code, we've created an object of ID "chartholder" within <x3d> tags. Here, we set the dimensions of that object. -ES
var x3d = d3.select("#chartholder")
            .attr("width", x + "px")
            .attr("height", y + "px")
            .attr("showLog", "false")
            .attr("showStat", "false");

//starts camera at ideal viewpoint
var scene = x3d.append("scene");
var view_pos = [6261.75622, -52.15068, 43.19008]; //x, y, z relative to origin (0, 0, 0)
var fov = 0.05; 	// Preferred minimum viewing angle from this viewpoint in radians. 
				// Small field of view roughly corresponds to a telephoto lens, 
				// large field of view roughly corresponds to a wide-angle lens. 
				// Hint: modifying Viewpoint distance to object may be better for zooming. 
				// Warning: fieldOfView may not be correct for different window sizes and aspect ratios. 

var view_or = [0.58043, 0.57246, 0.57913, 2.08821]
var zN = 0; 		//near plane
var zF = 1500000;	//far plane

var viewpoint = scene.append("viewpoint")
  .attr("id", 'dvp')
  .attr("position", view_pos.join(" "))
  .attr("orientation", view_or.join(" "))
  .attr("fieldOfView", fov)
  .attr('centerOfRotation', "0 0 0")
  .attr('zNear', zN)
  .attr('zFar', zF)
  .attr("description", "defaultX3DViewpointNode").attr("set_bind", "true");


/*
// correct ratio of planet-to-star sizes; correct semi-major axes relative to each other; however, INCORRECT ratio of star & planet size to semi-major axis size
var drawn_star = scene.selectAll(".keplerstar")
							 .data(keplerstars_short)
            				 .enter()
            				 .append('transform')
            				 .attr('class', 'point')
            				 .attr('translation', '0 0 0')
            				 .append('shape')
                     .call(makeSolid, color=function(d){return keplerstarscolorScale(d.koi_steff)}, opacity=1) //uses a function to return the STeff and apply our color scale to create differences 
            				 .append('sphere')
                     .attr('radius', function(d) {return 0.75*rorScale(d.koi_srad)});

var drawn_planet = scene.selectAll(".keplerstar")
							 .data(keplerstars_short)
            				 .enter()
            				 .append('transform')
            				 .attr('class', 'point')
            				 .attr('translation', function(d){return 30*smaScale(d.koi_sma) + ' ' + 0 + ' ' + 0;})
            				 .append('shape')
                     .call(makeSolid, color=function(d){return keplerplanetcolorScale(d.koi_teq)}, opacity = 1) //uses a function to return the STeff and apply our color scale to create differences 
            				 //.call(makeSolid, color="blue", opacity = 1) //uses a function to return the STeff and apply our color scale to create differences 
            				 .append('sphere')
            				 .attr('radius', function(d){return 0.75*rorScale(d.koi_ror * d.koi_srad)}); //draw spheres to represent points, using a function to return the radius and apply the radius scale

var orbit = scene.selectAll(".orbits")   //creates a selection, which is currently empty
          .data(keplerstars_short)        //join "circles" list
          .enter()          //enter "circles" into empty selection. the selection now contains all of "circles", and everything after this loops over each circle in turn
          .append('transform')    //for each circle, append a "transform" object
          .attr('translation', '0 0 0')   //specify that this "transform" will impose a rotation of the circle
          .attr('rotation', '1 0 0')
          .append('shape')          //for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
          .call(makeSolid, color='black', opacity=1)       //set the color
                .append('Circle2D')         //make the shape a 2D circle
          .attr('radius', function(d){return 30*smaScale(d.koi_sma);})  //set the radius
          .attr('subdivision',100)      //set the"resolution" of the circle, i.e. how many line segments are drawn to make up the circle
*/


//set the scale for drawing the star, planets, and orbits according to the size of the system
var system_kepID = 10797460;

var scales_arr = [];
var solarRad_to_AU = 0.00465046726;
var to_draw = [];

for(i=0;i<keplerstars_short.length;i++){
  if(keplerstars_short[i].kepid == system_kepID){
    to_draw.push(keplerstars_short[i]);
    scales_arr.push(keplerstars_short[i].koi_srad * solarRad_to_AU);
    scales_arr.push(keplerstars_short[i].koi_srad * keplerstars_short[i].koi_ror * solarRad_to_AU);
    scales_arr.push(keplerstars_short[i].koi_sma);
    //for the animation, below
    keplerstars_short[i].theta = 0;
  };
};

var smaMin = d3.min(scales_arr);
var smaMax = d3.max(scales_arr);

var max_to_min_ratio = smaMax/smaMin;
//console.log(max_to_min_ratio);
                          
var smaScale = d3.scale.linear()
                  .domain([smaMin, smaMax])
                  .range([1, max_to_min_ratio]);

//for(i=0;i<6;i++){
//  console.log(smaScale(scales_arr[i]));
//}

// all correct ratios
var drawn_star = scene.selectAll(".keplerstar")
                        .data(to_draw)
                         .enter()
                         .append('transform')
                         .attr('translation', '0 0 0')
                         .append('shape')
                         .call(makeSolid, color=function(d){return keplerstarscolorScale(d.koi_steff)}, opacity=1) //uses a function to return the STeff and apply our color scale to create differences 
                         .append('sphere')
                         .attr('radius', function(d) {return smaScale(d.koi_srad*solarRad_to_AU)})
                         .attr('class', 'keplerstar')

var drawn_planet = scene.selectAll(".planet")
                          .data(to_draw)
                           .enter()
                           .append('transform')
                           .attr('translation', function(d){return smaScale(d.koi_sma) + ' ' + 0 + ' ' + 0;})
                           .attr('class','planetpos')
                           .append('shape')
                           .call(makeSolid, color=function(d){return keplerplanetcolorScale(d.koi_teq)}, opacity = 1) //uses a function to return the STeff and apply our color scale to create differences 
                           //.call(makeSolid, color="blue", opacity = 1) //uses a function to return the STeff and apply our color scale to create differences 
                           .append('sphere')
                           .attr('radius', function(d){return smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU);})//draw spheres to represent points, using a function to return the radius and apply the radius scale
                           .attr('class', 'planet')

var drawn_orbit = scene.selectAll(".orbit")   //creates a selection, which is currently empty
                  .data(to_draw)        //join "circles" list
                  .enter()          //enter "circles" into empty selection. the selection now contains all of "circles", and everything after this loops over each circle in turn
                  .append('transform')    //for each circle, append a "transform" object
                  .attr('translation', '0 0 0')   //specify that this "transform" will impose a rotation of the circle
                  .append('shape')          //for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
                  .call(makeSolid, color='black', opacity=1)       //set the color
                        .append('Circle2D')         //make the shape a 2D circle
                  //.append('appearance')
                  //.append('material')
                  //.attr('emissiveColor', 'white')
                  //.attr('diffuseColor', 'white')
                  //.attr('transparency', function(){
                  //  console.log(opacity);
                  //  return 1 - opacity;})
                  .attr('radius', function(d){return smaScale(d.koi_sma);})  //set the radius
                  .attr('subdivision',5000)      //set the"resolution" of the circle, i.e. how many line segments are drawn to make up the circle
                  .attr('class', 'orbit')



var drawn_zone = scene.selectAll(".zone")
                          .data(to_draw)
                          .enter()
                          .append('shape')
                          .call(makeSolid, color= 'lightskyblue', opacity=1)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30)
                          .attr('class', 'zone')

var drawn_zoneUpsideDown = scene.selectAll(".zoneUD")
                          .data(to_draw)
                          .enter()
                          .append('transform')    
                          .attr('rotation', '1 0 0 3.14159') //flip over
                          .append('shape')
                          .call(makeSolid, color= 'lightskyblue', opacity=1)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30)
                          .attr('class', 'zoneUD')


//Turn degrees into radians
function toRadians (angle) { return angle * (Math.PI / 180);}
function toDegrees (angle) { return angle * (180 / Math.PI);}

//Calculate the new x or y position per planet
function locate() {
  return function(d){
    var k = 360 / (d.koi_period * resolution * speedUp);
    for (var i = 0; i < resolution; i++) {
      d.theta += k;
    }
    
    if (d.theta > 360) {d.theta -= 360;}

    var newX = d.koi_sma * Math.cos(toRadians(d.theta)); //AU
    var newY = d.koi_sma * Math.sin(toRadians(d.theta)); //AU
    
    return smaScale(newX) + ' ' +smaScale(newY) + ' ' + 0;};
  };

//Change x and y location of each planet
d3.timer(function() {
    scene.selectAll(".planetpos")
            .attr('translation', locate());
});
              