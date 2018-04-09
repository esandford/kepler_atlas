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
	speedUp = 400, //speed of planets
	au = 149597871, //km
	radiusSun = 695800, //km
	radiusJupiter = 69911; //km

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
var view_pos = [109638.27886, -87882.84581, 10160.65712]; //x, y, z relative to origin (0, 0, 0)
var fov = 0.05; 	// Preferred minimum viewing angle from this viewpoint in radians. 
				// Small field of view roughly corresponds to a telephoto lens, 
				// large field of view roughly corresponds to a wide-angle lens. 
				// Hint: modifying Viewpoint distance to object may be better for zooming. 
				// Warning: fieldOfView may not be correct for different window sizes and aspect ratios. 

var view_or = [0.81848, 0.38215, 0.42901, 1.70872]; //relative to default (0, 0, 1, 0)
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
    .select('.domain').call(makeSolid, 'blue', 1.0); //parallel lines in z vs x plane
        
scene.append('group')
    .attr('class', 'yAxis')
    .call(yAxis)
    .select('.domain').call(makeSolid, 'red', 1.0); //parallel lines in y vs z plane
  
scene.append('group')
    .attr('class', 'yAxis')
    .call(yAxis2)
    .select('.domain').call(makeSolid, 'red', 1.0); //parallel lines in y vs x plane



// var drawn_star = scene.selectAll(".keplerstar")
// 							 .data(keplerstars)
//             				 .enter()
//             				 .append('transform')
//             				 .attr('class', 'point')
//             				 .attr('translation', '0 0 0')
//             				 .append('shape')
//                      .call(makeSolid, color=function(d){return keplerstarscolorScale(d.koi_steff)}, opacity = .8) //uses a function to return the STeff and apply our color scale to create differences 
//                      //.append("appearance")
//                      //.append("material")
//                      //.attr("diffuseColor", "red")
//                      /*.attr("transparency", function(d){
//                         var opacity;
//                         if (d.kepoi_name.slice(-1) == 1){
//                           opacity = 0.8;
//                         }
//                         else{iki
//                           opacity = 0;
//                         }
//                         console.log(opacity);
//                         console.log(1-opacity);
//                       return (1 - opacity);})*/ //doesn't currently work
//                      //.attr("transparency",0)
//             				 .append('sphere')
//                      .attr('radius', function(d) {return 0.01*rorScale(d.koi_srad)});

// var drawn_planet = scene.selectAll(".keplerstar")
// 							 .data(keplerstars)
//             				 .enter()
//             				 .append('transform')
//             				 .attr('class', 'point')
//             				 .attr('translation', function(d){return smaScale(d.koi_sma) + ' ' + 0 + ' ' + 0;})
//             				 .append('shape')
//                      .call(makeSolid, color=function(d){return keplerplanetcolorScale(d.koi_teq)}, opacity = 1) //uses a function to return the STeff and apply our color scale to create differences 
//             				 //.call(makeSolid, color="blue", opacity = 1) //uses a function to return the STeff and apply our color scale to create differences 
//             				 .append('sphere')
//             				 .attr('radius', function(d) {return 0.01*rorScale(d.koi_ror * d.koi_srad)}); //draw spheres to represent points, using a function to return the radius and apply the radius scale                     

// var orbit = scene.selectAll(".orbits")   //creates a selection, which is currently empty
//           .data(keplerstars)        //join "circles" list
//           .enter()          //enter "circles" into empty selection. the selection now contains all of "circles", and everything after this loops over each circle in turn
//           .append('transform')    //for each circle, append a "transform" object
//           .attr('translation', '0 0 0')   //specify that this "transform" will impose a rotation of the circle
//           .attr('rotation', '1 0 0')
//           .append('shape')          //for each circle, append an as-yet-unspecified shape to be drawn on our 3D canvas
//           .call(makeSolid, color='black', opacity=1)       //set the color
//                 .append('Circle2D')         //make the shape a 2D circle
//           .attr('radius', function(d){return smaScale(d.koi_sma);})  //set the radius
//           .attr('subdivision',100)      //set the"resolution" of the circle, i.e. how many line segments are drawn to make up the circle


