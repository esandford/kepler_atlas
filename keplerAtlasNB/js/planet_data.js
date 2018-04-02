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

var x3d = d3.select("#chartholder")
            .attr("width", x + 'px')
            .attr("height", y +'px')
            .attr("showLog", 'true')
            .attr("showStat", 'true');

d3.select('.x3dom-canvas') 
  .attr("width", x)
  .attr("height", y);

var scene = x3d.append("scene");

var view_pos = [0., 500., 50000.]; 
var fov = 0.05;   
var view_or = [1., 0., 0., 0.]; 
var zN = 0;            
var zF = 150000; 

var viewpoint = scene.append("viewpoint")
  .attr("id", 'dvp')
  .attr("position", view_pos.join(" "))
  .attr("orientation", view_or.join(" "))
  .attr("fieldOfView", fov)
  .attr('centerOfRotation', "0 0 0")
  .attr('zNear', zN)
  .attr('zFar', zF)
  .attr("description", "defaultX3DViewpointNode").attr("set_bind", "true");

var drawn_keplerstars = scene.selectAll(".keplerstar")
      .data(keplerstars)
            .enter()
            .append('transform')
            .attr('class', 'point')
                              .append('shape')
                              .call(makeSolid, color=function(d){return keplerstarscolorScale(d.koi_steff)}, opacity=1) 
                              .attr('radius', function(d) {return 0.25*rScale(d.koi_srad)}); 

var drawn_keplerplanets = scene.selectAll(".keplerstar")
      .data(keplerstars)
            .enter()
            .append('transform')
            .attr('class', 'point')
                  .append('shape')
                  .call(makeSolid, color=function(d){return (d.koi_teq)}, opacity=1) 
                  .attr('radius', function(d) {return (d.koi_ror*d.koi_sma)}); 

var drawn_cylinder = scene.selectAll(".planet_datalist")     
                              .data(keplerstars)                     
                              .enter()                            
                              .append('transform')
                              .attr('rotation', function(d){    //specify that this "transform" will impose a rotation of the circle
                                    return d.dist + ' ' + d.ra + ' ' + d.dec + ' ' + d.koi_incl;
                              })
                              .append('shape')
                              .call(makeSolid, color='blue', opacity=0.4)                 
                        .append('cylinder')
                              .attr('radius', function(d){return d.koi_sma;})
                              .attr('height', 10)
                              .attr('subdivision',40)
