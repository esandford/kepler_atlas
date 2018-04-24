//Show the tooltip on hover
function showTooltip(d) {	
	//console.log("is this being called?");
	//Make a different offset for really small planets
	var xOffset = ((10*d.koi_srad)/2 < 3) ? 6 : (10*d.koi_srad)/2;
	var yOffset = ((10*d.koi_srad)/2 < 3) ? 0 : (10*d.koi_srad)/2;

	//Set first location of tooltip and change opacity
	var xpos = d.x + x/2 - xOffset + 3;
	var ypos = d.y + y/2 - yOffset - 5;
	
	d3.select("#tooltip")
		.style('top',ypos+"px")
		.style('left',xpos+"px")
		.transition().duration(500)
		.style('opacity',1);
		
	//Keep the tooltip moving with the planet, until stopTooltip 
	//returns true (when the user clicks)
	d3.timer(function(elapsed) {

	  //xpos = d.x + x/2 - xOffset + 3;
	  //ypos = d.y + y/2 - yOffset - 5;
	  
	  //Keep changing the location of the tooltip
	  //d3.select("#tooltip")
		//.style('top',ypos+"px")
		//.style('left',xpos+"px");
	
	  //Breaks from the timer function when stopTooltip is changed to true
	  //by another function
	  if (elapsed > 200) {
	  	if (stopTooltip == true) { 
			//Hide tooltip
			d3.select("#tooltip").transition().duration(300)
				.style('opacity',0)
			}
		}
	});


	d3.select("#tooltip .tooltip-planet").text(d.kepler_name);
	d3.select("#tooltip .tooltip-year").html("Discovered in: " + d.discovered);
	d3.select("#tooltip-radius").html("Radius of star: " + formatSI(d.Radius) + " Earth radii");
}//showTooltip	