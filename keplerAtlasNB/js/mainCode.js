//Width and Height of the SVG
var 
	w = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = ((w.innerWidth || e.clientWidth || g.clientWidth) - 50),
	y = ((w.innerHeight|| e.clientHeight|| g.clientHeight) - 150);

var pulloutCounter = 0;
d3.select("#pullout-caret").html("<")

//pullout tab --Caroline
document.getElementById('pullout').addEventListener('click', function() {
  var pullout = document.getElementById('pullout');
  pullout.classList.toggle('active');
  pulloutCounter += 1;
  var pulloutCaretDirection = pulloutCounter % 2;
  if(pulloutCaretDirection==0){
    d3.select("#pullout-caret").html("<");
  }
  else{
    d3.select("#pullout-caret").html(">");
  }
  });

//change the text inside the pullout tab
d3.select("#pullout .pullout-planet").html("<br />");
d3.select("#pullout-temperature") .html("<b>Scroll</b> or use the <b>slider</b> to zoom in/out.");
d3.select("#pullout-radius")    .html("<b>Double-click</b> on a point to center it.");
d3.select("#pullout-mass")     .html("<b>Click and drag</b> to change your perspective. ");
d3.select("#pullout-count")    .html("<b>Press the R button</b> to go back to the original viewpoint.");
d3.select("#pullout-depth")     .html("<b>Click</b> on a star to visit it and see its planets.");
d3.select("#pullout-duration")     .html("<br /> The yellow points are stars visible to the naked eye from Earth. These stars are at an average distance of 300 light-years from Earth. A small section of the midplane of the Milky Way galaxy is shown in blue. <br /> ");
d3.select("#pullout-ratio")      .html("<br /> <b>Galaxy View</b> shows you a view of the <i>Kepler</i> planet-hosting stars from a vantage point high above the Milky Way disk.");
d3.select("#pullout-button")    .html("<b>Earth View</b> shows you the view from the <i>Kepler</i> space telescope, which is very near Earth. <br />");

// window.onresize = updateWindow;	

//a function that x3dom uses to attach an "appearance" and "color" to a data selection.
//If you subsequently append a shape to that selection, x3dom will render the shape in 3D with this appearance/color. -ES
var makeSolid = function(selection, diffuseColor, emissiveColor, opacity, materialClass) {
            selection.append("appearance")
                .append("material")
                .attr("class", materialClass)
                .attr("diffuseColor", diffuseColor || "black")
                .attr("emissiveColor", emissiveColor || "black")
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
            .attr("showLog", "false")
            .attr("showStat", "false");

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
  .attr('zFar', zF);


// Make an arrow to point to the Galactic center.
var zeroArr = [0];
var arrow = scene.selectAll(".arrow")
                  .data(zeroArr)
                  .enter()
                  .append("transform")
                  .attr("class","arrow")
                  .attr("id", "theArrow")
                  .attr("translation", "500 0 0")
                  .attr("rotation", "0 0 1 1.570795")
                  .append("shape")
                  .call(makeSolid, diffuseColor='white', emissiveColor='black', opacity=1)
                  .append("cylinder")
                  .attr("height", "70")
                  .attr("radius", "3")
                  .attr("top", "false");

var arrowhead = scene.selectAll(".arrowhead")
                  .data(zeroArr)
                  .enter()
                  .append("transform")
                  .attr("class","arrowhead")
                  .attr("id", "theArrowhead")
                  .attr("translation", "535 0 0")
                  .attr("rotation", "0 0 1 4.712385") //rotate by 3pi/2
                  .append("shape")
                  .call(makeSolid, diffuseColor='white', emissiveColor='black', opacity=1)
                  .append("cone")
                  .attr("bottomRadius", "12")
                  .attr("height", "18");

var arrowlabel = scene.selectAll(".arrowlabel")
                  .data(zeroArr)
                  .enter()
                  .append("transform")
                  .attr("class","arrowlabel")
                  .attr("id", "theArrowlabel")
                  .attr("translation", "525 50 20")
                  .attr("scale", "5 5 5")
                  .append("billboard")
                  .append("shape")
                  .call(makeSolid, diffuseColor='white', emissiveColor='black', opacity=1)
                  .append("text")
                  .attr("string", "To galactic center")
                  .attr("solid", "false")
                  .append("fontstyle")
                  .attr("size","10")
                  .attr("family", "sans")
                  .attr("justify", "middle");

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

                        d.x = xScale(x);
                        d.y = yScale(y);
                        d.z = zScale(z);

            				    return xScale(x) + ' ' + yScale(y) + ' ' + zScale(z);})
                     .attr('scale', function(d){
                        var rad = 0.25*rScale(d.koi_srad);
                        return rad + ' ' + rad + ' ' + rad;
                      })
                     .append('shape')                
            				 .call(makeSolid, diffuseColor=function(d){
            				 return keplerstarscolorScale(d.koi_steff)}, emissiveColor='black', opacity=1) //uses a function to return the STeff and apply our color scale to create differences 
            				 .append('sphere');

//Draw the bright star catalog
var drawn_brightstars = scene.selectAll(".brightstar")
				.data(brightstars)
            	.enter()
            	.append('transform')
              .attr('class', 'brightstar')
            	.attr('translation', function(d){ 
            		var xyz = convertXYZ(distance=d.dist, xyzinputRA=d.RA, xyzinputdec=d.dec);
					      var x = xyz[0];
					      var y = xyz[1];
					      var z = xyz[2];
            		return xScale(x) + ' ' + yScale(y) + ' ' + zScale(z);})
              .attr('scale', function(d){
                var rad = vmagRscale(d.Vmagnitude);
                return rad + ' ' + rad + ' ' + rad;
              })
              .append('shape')
              //.append("appearance")
              //.append("material")
              //.attr("diffuseColor", "white")
              //.attr("emissiveColor", "white")
              //.attr("transparency", 0)
              .call(makeSolid, diffuseColor=function(d){return vmagcolorscale(d.Vmagnitude)}, emissiveColor='black', opacity=0.8, materialClass='brightstarMaterial')
              .append('sphere');


// draw a cylinder to represent the Milky Way disk
var MWdisk = [{"height":5, "radius":2000, "rotaxis_xcoord":1, "rotaxis_ycoord":0, "rotaxis_zcoord":0, "rot_angle":1.570796}];

var drawn_MWdisk = scene.selectAll(".MWdisk") 	
					.data(MWdisk)				
					.enter()					
					.append('transform')
          .attr('class', 'MWdisk')
					.attr('rotation', function(d){    //specify that this "transform" will impose a rotation of the circle
						return d.rotaxis_xcoord + ' ' + d.rotaxis_ycoord + ' ' + d.rotaxis_zcoord + ' ' + d.rot_angle;
					})
          .append('shape')			
					//.append('appearance')
          //.append('material')
          //.attr('class', 'MWdiskMaterial')
          //.attr('diffuseColor','blue')
          //.attr('emissiveColor','black')
          //.attr('transparency',"0.6")
          .call(makeSolid, diffuseColor='blue', emissiveColor='black', opacity=0.4)
          .append('cylinder')
					.attr('radius', function(d){return d.radius;})	//set the radius
					.attr('height', function(d){return d.height;})
					.attr('subdivision',40);

// Enable switch to "Earth view," i.e. view from the Kepler satellite
function earthView() {
        console.log("beginning earthView");

        //change the text inside the pullout tab
        d3.select("#pullout .pullout-planet").html("<br />");
        d3.select("#pullout-temperature") .html("<b>Scroll</b> or use the <b>slider</b> to zoom in/out.");
        d3.select("#pullout-radius")    .html("<b>Double-click</b> on a point to center it.");
        d3.select("#pullout-mass")     .html("<b>Click and drag</b> to change your perspective. ");
        d3.select("#pullout-count")    .html("<b>Press the R button</b> to go back to the original viewpoint.");
        d3.select("#pullout-depth")     .html("<b>Click</b> on a star to visit it and see its planets.");
        d3.select("#pullout-duration")     .html("<br />")
        d3.select("#pullout-ratio")      .html("<br /> <b>Galaxy View</b> shows you a view of the <i>Kepler</i> planet-hosting stars from a vantage point high above the Milky Way disk.");
        d3.select("#pullout-button")    .html("<b>Earth View</b> shows you the view from the <i>Kepler</i> space telescope, which is very near Earth. <br />");

        //change location of arrow and "to galactic center" label
        d3.select("#theArrow").attr("translation", "73 -10 0").attr("scale", "0.3 0.3 0.3")
        d3.select("#theArrowhead").attr("translation", "85 -10 0").attr("scale", "0.3 0.3 0.3")
       //d3.select("#theArrowlabel").attr("translation", "60 -20 0").attr("scale", "0.5 0.5 0.5")

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

        //set zoom scale
        zoom = d3.behavior.zoom()
          .scaleExtent([0.0001, 0.25])
          .on("zoom", zoomed);

        //reset slider to left side of slider bar
        var sliderelement = $( "#sliderVal" );
        sliderelement.val(function( index, value ) {
          return zoom.scaleExtent()[0];
        });

        //set cylinder and bright star opacity equal to 0
        $('.brightstarMaterial').attr("transparency", 1);
        $('#theScene > .MWdisk').remove();
        
				}

// Enable switch back to "Galaxy view"
function galaxyView() {
        console.log("beginning galaxyView");

        //change the text inside the pullout tab
        d3.select("#pullout .pullout-planet").html("<br />");
        d3.select("#pullout-temperature") .html("<b>Scroll</b> or use the <b>slider</b> to zoom in/out.");
        d3.select("#pullout-radius")    .html("<b>Double-click</b> on a point to center it.");
        d3.select("#pullout-mass")     .html("<b>Click and drag</b> to change your perspective. ");
        d3.select("#pullout-count")    .html("<b>Press the R button</b> to go back to the original viewpoint.");
        d3.select("#pullout-depth")     .html("<b>Click</b> on a star to visit it and see its planets.");
        d3.select("#pullout-duration")     .html("<br /> The yellow points are stars visible to the naked eye from Earth. These stars are at an average distance of 300 light-years from Earth. A small section of the midplane of the Milky Way galaxy is shown in blue. <br /> ");
        d3.select("#pullout-ratio")      .html("<br /> <b>Galaxy View</b> shows you a view of the <i>Kepler</i> planet-hosting stars from a vantage point high above the Milky Way disk.");
        d3.select("#pullout-button")    .html("<b>Earth View</b> shows you the view from the <i>Kepler</i> space telescope, which is very near Earth. <br />");

        //change location of arrow and "to galactic center" label
        d3.select("#theArrow").attr("translation", "500 0 0").attr("scale", "1 1 1")
        d3.select("#theArrowhead").attr("translation", "535 0 0").attr("scale", "1 1 1")
       
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

        //set zoom scale
        zoom = d3.behavior.zoom()
          .scaleExtent([0.0001, 0.05])
          .on("zoom", zoomed);

        //reset slider to left side of slider bar
        var sliderelement = $( "#sliderVal" );
        sliderelement.val(function( index, value ) {
          return zoom.scaleExtent()[0];
        });

        //make bright stars and MW disk visible again
        $('.brightstarMaterial').attr("transparency", 0.2);

        drawn_MWdisk = scene.selectAll(".MWdisk")   
          .data(MWdisk)       
          .enter()          
          .append('transform')
          .attr('class', 'MWdisk')
          .attr('rotation', function(d){    //specify that this "transform" will impose a rotation of the circle
            return d.rotaxis_xcoord + ' ' + d.rotaxis_ycoord + ' ' + d.rotaxis_zcoord + ' ' + d.rot_angle;
          })
          .append('shape')      
          //.append('appearance')
          //.append('material')
          //.attr('id', 'MWdiskMaterial')
          //.attr('diffuseColor','blue')
          //.attr('emissiveColor','black')
          //.attr('transparency',"0.6")
          .call(makeSolid, diffuseColor='blue', emissiveColor='black', opacity=0.4)
          .append('cylinder')
          .attr('radius', function(d){return d.radius;})  //set the radius
          .attr('height', function(d){return d.height;})
          .attr('subdivision',40);

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
  
  console.log("beginning planetView");
  
  //remove earlier-drawn planetary system ,if there is one
  if(nPlanetViewDraws > 0){
    $('#theScene > .planetHost').remove();
    $('#theScene > .planet').remove();
    $('#theScene > .orbit').remove();
    $('#theScene > .zone').remove();
    $('#theScene > .zoneUD').remove();
  }
  
  //edit pullout text
  d3.select("#pullout-depth")     .html("<br /><br /><br />");
  d3.select("#pullout-duration")    .html("The light green band represents the system's <b>habitable zone</b>, which is at the right equilibrium temperature for liquid water to exist.");
  d3.select("#pullout-ratio")     .html("<br /> The planets' sizes have been exaggerated in this view. To see planets scaled accurately relative to their star, click below.");
  d3.select("#pullout-button")    .html("<button onclick=planetViewSizes("+system_kepID+")>Size-Scaled</button>");

  //make the tooltip go away
  stopTooltip = true;

  //fly away to a random point in space to draw the planet view
  var fov = 0.001;
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

  //set zoom scale
  zoom = d3.behavior.zoom()
    .scaleExtent([0.0001, 0.001])
    .on("zoom", zoomed);

  //display the system
  var solarRad_to_AU = 0.00465046726;
  var to_draw = [];
  var scales_arr = [];
  var planetToDraw;
  
  for(i=0;i<keplerstars.length;i++){
    if(keplerstars[i].kepid == system_kepID){
      //make a copy of this object to hold its data
      planetToDraw = {};

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
                  .range([1.5, x/1.5]);

  var drawn_planetHost = scene.selectAll(".planetHost")
                        .data([to_draw[0]])
                         .enter()
                         .append('transform')
                         .attr('class', 'planetHost')
                         .attr('translation', '10000 10000 11000')
                         .attr('scale', function(d){
                          var rad = smaScale(d.koi_srad*solarRad_to_AU);
                          //console.log("star");
                          //console.log(rad);
                          return rad + ' ' + rad + ' ' + rad;
                         })
                         .append('shape')
                         .call(makeSolid, diffuseColor=function(d){
                          return keplerstarscolorScale(d.koi_steff)}, emissiveColor='black', opacity=1)
                         .append('sphere');
                         
  var drawn_planet = scene.selectAll(".planet")
                          .data(to_draw)
                           .enter()
                           .append('transform')
                           .attr('translation', function(d){return 10000+smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU) + ' ' + 10000 + ' ' + 11000})
                           .attr('scale', function(d){
                            var rad = smaScale(d.koi_srad*d.koi_ror*solarRad_to_AU);
                            //console.log("planet");
                            //console.log(rad);
                            return rad + ' ' + rad + ' ' +rad;
                           })
                           .attr('class','planet')
                           .append('shape')
                           .call(makeSolid, diffuseColor=function(d){return keplerplanetcolorScale(d.koi_teq)}, emissiveColor='black', opacity = 1) 
                           .append('sphere');
                           
  
  var drawn_orbit = scene.selectAll(".orbit")  
                  .data(to_draw)      
                  .enter()          
                  .append('transform')   
                  .attr('translation', '10000 10000 11000') 
                  .attr('scale', function(d){
                    var rad = smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU);
                    //console.log("orbit");
                    //console.log(rad);
                    return rad + ' ' + rad + ' ' + rad;
                  }) 
                  .attr('class', 'orbit')
                  .append('shape')        
                  .call(makeSolid, diffuseColor='white', emissiveColor='white', opacity=1)       
                  .append('Circle2D')        
                  .attr('subdivision',500);
  

  var drawn_zone = scene.selectAll(".zone")
                          .data([to_draw[0]])
                          .enter()
                          .append('transform')
                          .attr('class', 'zone')
                          .attr('translation', '10000 10000 11000')
                          .append('shape')
                          .call(makeSolid, diffuseColor='#85D63E', emissiveColor='#85D63E', opacity=0.5)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30);
                
  var drawn_zoneUpsideDown = scene.selectAll(".zoneUD")
                          .data([to_draw[0]])
                          .enter()
                          .append('transform')
                          .attr('class', 'zoneUD')  
                          .attr('translation', '10000 10000 11000')  
                          .attr('rotation', '1 0 0 3.14159') //flip over
                          .append('shape')
                          .call(makeSolid, diffuseColor='#85D63E', emissiveColor='#85D63E', opacity=0.5)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30);
  
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
                scene.selectAll(".planet")
                      .attr('translation', locate());
              });

  //increment counter of planet view draws
  nPlanetViewDraws += 1;

};


function planetViewSizes(system_kepID){
  
  console.log("beginning planetView, size-scaled");
  
  //remove earlier-drawn planetary system ,if there is one
  if(nPlanetViewDraws > 0){
    $('#theScene > .planetHost').remove();
    $('#theScene > .planet').remove();
    $('#theScene > .orbit').remove();
    $('#theScene > .zone').remove();
    $('#theScene > .zoneUD').remove();
  }
  
  //edit pullout text
  d3.select("#pullout-depth")     .html("<br />");
  d3.select("#pullout-duration")    .html("The light green band represents the system's <b>habitable zone</b>, which is at the right equilibrium temperature for liquid water to exist.");
  d3.select("#pullout-ratio")     .html("<br /> The star and planets' sizes have been exaggerated relative to their distances apart in this view. To see correctly-scaled distances, click below.");
  d3.select("#pullout-button")    .html("<button onclick=planetView("+system_kepID+")>Distance-Scaled</button>");

  //make the tooltip go away
  stopTooltip = true;

  //fly away to a random point in space to draw the planet view
  var fov = 0.02;
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

  //set zoom scale
  zoom = d3.behavior.zoom()
    .scaleExtent([0.0001, 0.02])
    .on("zoom", zoomed);

  //display the system
  var solarRad_to_AU = 0.00465046726;
  var to_draw = [];
  var scales_arr = [];
  var planetToDraw;
  
  for(i=0;i<keplerstars.length;i++){
    if(keplerstars[i].kepid == system_kepID){
      //make a copy of this object to hold its data
      planetToDraw = {};

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
                  .range([1.5, x/1.5]);

  var drawn_planetHost = scene.selectAll(".planetHost")
                        .data([to_draw[0]])
                         .enter()
                         .append('transform')
                         .attr('class', 'planetHost')
                         .attr('translation', '10000 10000 11000')
                         .attr('scale', function(d){
                          var rad =  rorScale(d.koi_srad);
                          //console.log("star");
                          //console.log(rad);
                          return rad + ' ' + rad + ' ' + rad;
                         })
                         .append('shape')
                         .call(makeSolid, diffuseColor=function(d){
                          return keplerstarscolorScale(d.koi_steff)}, emissiveColor='black', opacity=1)
                         .append('sphere');
                         
  var drawn_planet = scene.selectAll(".planet")
                          .data(to_draw)
                           .enter()
                           .append('transform')
                           .attr('translation', function(d){return 10000+50*smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU) + ' ' + 10000 + ' ' + 11000})
                           .attr('scale', function(d){
                            var rad = rorScale(d.koi_ror * d.koi_srad);
                            //console.log("planet");
                            //console.log(rad);
                            return rad + ' ' + rad + ' ' +rad;
                           })
                           .attr('class','planet')
                           .append('shape')
                           .call(makeSolid, diffuseColor=function(d){return keplerplanetcolorScale(d.koi_teq)}, emissiveColor='black', opacity = 1) 
                           .append('sphere');
                           
  
  var drawn_orbit = scene.selectAll(".orbit")  
                  .data(to_draw)      
                  .enter()          
                  .append('transform')   
                  .attr('translation', '10000 10000 11000') 
                  .attr('scale', function(d){
                    var rad = 50*smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU);
                    //console.log("orbit");
                    //console.log(rad);
                    return rad + ' ' + rad + ' ' + rad;
                  }) 
                  .attr('class', 'orbit')
                  .append('shape')        
                  .call(makeSolid, diffuseColor='white', emissiveColor='white', opacity=1)       
                  .append('Circle2D')        
                  .attr('subdivision',500);
  

  var drawn_zone = scene.selectAll(".zone")
                          .data([to_draw[0]])
                          .enter()
                          .append('transform')
                          .attr('class', 'zone')
                          .attr('translation', '10000 10000 11000')
                          .append('shape')
                          .call(makeSolid, diffuseColor='#85D63E', emissiveColor='#85D63E', opacity=0.5)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return 50*smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return 50*smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30);
                
  var drawn_zoneUpsideDown = scene.selectAll(".zoneUD")
                          .data([to_draw[0]])
                          .enter()
                          .append('transform')
                          .attr('class', 'zoneUD')  
                          .attr('translation', '10000 10000 11000')  
                          .attr('rotation', '1 0 0 3.14159') //flip over
                          .append('shape')
                          .call(makeSolid, diffuseColor='#85D63E', emissiveColor='#85D63E', opacity=0.5)
                          .append('Disk2D')
                          .attr('innerradius', function(d){return 50*smaScale((Math.pow(d.koi_steff,2)/Math.pow(373,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('outerradius', function(d){return 50*smaScale((Math.pow(d.koi_steff,2)/Math.pow(273,2))*((d.koi_srad * solarRad_to_AU)/2))})
                          .attr('subdivision', 30);
  
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

      var newX_shifted = 50*smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU)*Math.cos(toRadians(d.theta)) + 10000;
      var newY_shifted = 50*smaScale(d.koi_srad*d.koi_dor*solarRad_to_AU)*Math.sin(toRadians(d.theta)) + 10000;

      //console.log(Math.pow(newX, 2) + Math.pow(newY, 2));

      return newX_shifted + ' ' + newY_shifted + ' ' + 11000;};
  };

  //Change x and y location of each planet
  timer = d3.timer(function() {
                scene.selectAll(".planet")
                      .attr('translation', locate());
              });

  //increment counter of planet view draws
  nPlanetViewDraws += 1;

};

