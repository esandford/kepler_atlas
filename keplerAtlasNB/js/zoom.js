var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var zoom = d3.behavior.zoom()
    .scaleExtent([0.0001, 0.05])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

var slider = d3.select("#sliderBar")
  .append("input")
  .attr("id", "sliderVal")
  .datum({})
  .attr("type", "range")
  .attr("value", zoom.scaleExtent()[0])
  .attr("min", zoom.scaleExtent()[0])
  .attr("max", zoom.scaleExtent()[1])
  .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
  .on("input", slided);

var svg = d3.select("body").append("svg")
    .attr("width", 10)
    .attr("height", 10)
  .append("g")
    //.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .call(zoom);

function zoomed() {
  //we want to use the slider to zoom the viewpoint by changing the field of view!

  //var current_fov = viewpoint.attr("fieldOfView");
  var max_fov = zoom.scaleExtent()[1]
  //var current_fov_scale = current_fov/(max_fov - zoom.scaleExtent()[0]); //number ranging from 0 to 1 
  //console.log("Current scale is: ")
  //console.log(current_fov_scale);

  //var desired_fov_scale = (d3.event.scale)/(max_fov - zoom.scaleExtent()[0]); 
  //console.log("desired fov scale is:")
  //console.log(desired_fov_scale);

  //give the slider the appropriate value, based on where it was dragged
  viewpoint.attr("fieldOfView", (max_fov - d3.event.scale));
  slider.property("value",  d3.event.scale);
  
  d3.select("#sliderVal").attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y)
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}

function slided(d){
  zoom.scale(d3.select(this).property("value"))
    .event(svg);
}
