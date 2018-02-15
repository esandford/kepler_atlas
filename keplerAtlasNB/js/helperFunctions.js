

//Change x and y location of each planet
d3.timer(function() {       		
		//Move the planet - DO NOT USE TRANSITION
		d3.selectAll(".planet")
			.attr("cx", locate("x"))
			.attr("cy", locate("y"))
			.attr("transform", function(d) {
				return "rotate(" + (d.theta%360) + "," + d.x + "," + d.y + ")";
			})
			;				
});
	
//Calculate the new x or y position per planet
function locate(coord) {
	return function(d){
		var k = 360 * d.major * d.minor / (d.period * resolution * speedUp);
		
		for (var i = 0; i < resolution; i++) {
			d.theta += k / (d.r * d.r);
			d.r = d.major * (1 - d.e * d.e) / (1 - d.e * Math.cos(toRadians(d.theta)));   
		}// for
				
		var x1 = d.r * Math.cos(toRadians(d.theta)) - d.focus;
		var y1 = d.r * Math.sin(toRadians(d.theta));
		
		if (d.theta > 360) {d.theta -= 360;}
				
		if (coord == "x") {
			//New x coordinates
			newX = d.cx + x1 * Math.cos(toRadians(phi)) - y1 * Math.sin(toRadians(phi));
			d.x = newX;
			return newX;
		} else if (coord == "y") {
			newY = d.cy + x1 * Math.sin(toRadians(phi)) + y1 * Math.cos(toRadians(phi));
			d.y = newY;
			return newY;
		}
	};
}//function locate

//Show the total orbit of the hovered over planet
function showEllipse(d, i, opacity) {
		var planet = i;
		//console.log(d);
		// if opacity == 0, set duration = to 2000; ptherwise set duration to 100
		var duration = (opacity == 0) ? 2000 /*slow trasnition*/ : 100/*fast transition*/; //If the opacity is zero slowly remove the orbit line
		
		//Highlight the chosen planet
		svg.selectAll(".planet")
			.filter(function(d, i) {return i == planet;})
			.transition().duration(duration)
			.style("stroke-opacity", opacity * 1.25);
		
		//Select the orbit with the same index as the planet
		svg.selectAll(".orbit")
			.filter(function(d, i) {return i == planet;})
			.transition().duration(duration)
			.style("stroke-opacity", opacity)
			.style("fill-opacity", opacity/3);

}//showEllipse	


	
//Turn degrees into radians
function toRadians (angle) { return angle * (Math.PI / 180);}
// function to Degrees (angle) {return angle * (180 / Math.P1);}


function updateWindow(){
	x = (w.innerWidth || e.clientWidth || g.clientWidth) - 50;
	y = (w.innerHeight|| e.clientHeight|| g.clientHeight) - 50;

	svg.attr("width", x).attr("height", y); //sets svg awidth and height to be equal to updated page width/height
	d3.selectAll(".container").attr("transform", "translate(" + x/2 + "," + y/2 + ")");
	d3.selectAll(".legendContainer").attr("transform", "translate(" + 30 + "," + (y - 90) + ")");
	d3.select("#crazy").style("left", (x/2 - 112/2 + 6) + "px").style("top", (y/2 - 100) + "px");
	//d3.selectAll(".introWrapper").attr("transform", "translate(" + -x/2 + "," + -y/2 + ")");
}//updateWindow