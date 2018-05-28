var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var zoom = d3.behavior.zoom()
    .scaleExtent([0, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

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
  //we want to use the slider to zoom the viewpoint in and out relative to the current
  //center of rotation (which is always located at the center of the screen).

  //to do this, we have to:
  // 1. measure the viewpoint's current distance from the COR;
  // 2. figure out what "scaling factor" the current distance represents, on our scale from 1 (least zoomed) to 10 (most zoomed);
  // 3. calculate a new scaling factor based on the slider's position;
  // 4. divide by the old scaling factor to account for the camera's old position;
  // 5. multiply by the new scaling factor to move the camera to the new position.
  
  //calculate the current distance between the camera and COR
  //get the viewer's 3D local frame
  var x3dElem  = document.getElementById('chartholder');
  var vMatInv  = x3dElem.runtime.viewMatrix().inverse();

  //galaxy view:
  //viewMatrix[:,0] = (1, 0, 0, 0) 
  //viewMatrix[:,1] = (0, 0.97, 0.97, 0)
  //viewMatrix[:,2] = (0, 0.25, -0.25, 0)
  //viewMatrix[:,3] = (0, -500, -50000, 1) 
  
  //viewMatrix_inv[:,0] = (1, -0, 0, -0)
  //viewMatrix_inv[:,1] = (-0, 1, -0, 0)
  //viewMatrix_inv[:,2] = (0, -0, 1, -0)
  //viewMatrix_inv[:,3] = (-0, 500, 50000, 1)

  //earth view:
  //var view_pos = [-117.67830, -491.90906, -114.90123]
  //var view_or = [0.98242, 0.00872, -0.18650, 1.87139]

  //viewMatrix[:,0] = (0.95, 0.19, -0.23, 0) 
  //viewMatrix[:,1] = (-0.17, -0.30, -0.94, 0)
  //viewMatrix[:,2] = (-0.25, 0.94, -0.25, 0)
  //viewMatrix[:,3] = (1.95, -15.8, -518, 1) 

  //viewMatrix_inv[:,0] = (0.95, -0.167, -0.246, -0)
  //viewMatrix_inv[:,1] = (0.189, -0.296, 0.936, 0)
  //viewMatrix_inv[:,2] = (-0.229, -0.94, -0.251, -0)
  //viewMatrix_inv[:,3] = (-117.76, -491.9, -114.9, 1)

  //var currentPos = [];
  var currentPos  = vMatInv.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 0.0, -1.0));
  
  console.log(currentPos);
  //console.log(currentPos.x);
  //var currentPos = viewpoint.attr("position").split(" ");
  var currentCOR = viewpoint.attr("centerOfRotation").split(" ");
  //console.log(currentPos);
  //console.log(currentCOR);
  var currentDist_x = currentPos[0] - currentCOR[0];
  var currentDist_y = currentPos[1] - currentCOR[1];
  var currentDist_z = currentPos[2] - currentCOR[2];
  var currentDist = Math.pow((Math.pow(currentDist_x, 2) + Math.pow(currentDist_y, 2) + Math.pow(currentDist_z, 2)), 0.5)
  
  //calculate the old scaling factor
  var galaxyView_pos = [0., 500., 50000.];
  var earthView_pos = [-117.67830*4.5, -491.90906*4.5, -114.90123*4.5];
  var maxDist = 0;

  if (view=="galaxy"){
    for (i=0; i<3; i++){
      maxDist += Math.pow(galaxyView_pos[i], 2);
      maxDist = Math.pow(maxDist, 0.5);
    }
  }
  else if (view=="earth"){
    for (i=0; i<3; i++){
      maxDist += Math.pow(earthView_pos[i], 2);
      maxDist = Math.pow(maxDist, 0.5);
    }
  }

  if (currentDist > maxDist){
    currentDist = maxDist;
  }
  else if (currentDist < 0){
    currentDist = 0;
  }

  //console.log("Current dist is: ")
  //console.log(currentDist);

  //console.log("Max dist is: ")
  //console.log(maxDist)

  //console.log("Dist ratio is: ")
  //console.log(currentDist/maxDist);
  //calculate the old distance scale
  
  var current_scale = (currentDist/maxDist)*10 //number ranging from 0 (least zoomed) to 10 (most zoomed)

  //console.log("Current scale is: ")
  //console.log(current_scale);

  //calculate the new scale, based on the slider's current position
  //console.log("Desired scale is: ")
  var desired_scale = 10.00001 - d3.event.scale; //d3.event.scale is a number ranging from 0.0001 (least zoomed) to 10 (most zoomed);
                                                //desired_scale is a number ranging from 10 (least zoomed) to 0 (most zoomed)
  //console.log(desired_scale);

  //console.log("Scale ratio is: ")
  //console.log(desired_scale/current_scale)

  //calculate the new desired camera position, and move the camera there.
  var newPos = [];
  for (i=0; i<3; i++) {
    //console.log(currentPos[i]);
    //console.log(desired_scale/current_scale);
    console.log(currentPos[i]*(desired_scale/current_scale));
    newPos.push(currentPos[i]*(desired_scale/current_scale));
  }

  //move the camera!
  viewpoint.attr("position", newPos.join(" "));

  //console.log(viewpoint.attr("position").split(" "))
  //give the slider the appropriate value, based on where it was dragged
  slider.property("value",  d3.event.scale);
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
