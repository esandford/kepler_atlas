var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

console.log(zoom.scaleExtent()[0])

var slider = d3.select("body").append("p").append("input")
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
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .call(zoom);


var container = svg.append("g");

container.append("g")
    .attr("class", "x axis")
  .selectAll("line")
    .data(d3.range(0, width, 10))
  .enter().append("line")
    .attr("x1", function(d) { return d; })
    .attr("y1", 0)
    .attr("x2", function(d) { return d; })
    .attr("y2", height);

container.append("g")
    .attr("class", "y axis")
  .selectAll("line")
    .data(d3.range(0, height, 10))
  .enter().append("line")
    .attr("x1", 0)
    .attr("y1", function(d) { return d; })
    .attr("x2", width)
    .attr("y2", function(d) { return d; });

function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  slider.property("value",  d3.event.scale);
}

function slided(d){
  zoom.scale(d3.select(this).property("value"))
    .event(svg);
    console.log(zoom.scaleExtent()[0])

}
