//Show the tooltip on hover
function showTooltip(d, coords) {	
	
	var xpos = coords.x;
	var ypos = coords.y; 

	d3.select("#tooltip")
		.style('top',ypos+"px")
		.style('left',xpos+"px")
		.transition().duration(500)
		.style('opacity',1);
		
	//Keep the tooltip moving with the planet, until stopTooltip 
	//returns true (when the user clicks)
	d3.timer(function(elapsed) {

	  if (elapsed > 200) {
	  	if (stopTooltip == true) { 
			//Hide tooltip
			d3.select("#tooltip").transition().duration(300)
				.style('opacity',0)
			}
		}
	});

	//Change the texts inside the tooltip
	d3.select("#tooltip .tooltip-planet").text(d.kepler_name);
	d3.select("#tooltip-temperature")	.html("Temperature of star: " + d.koi_steff + " Kelvin");
	d3.select("#tooltip-radius")		.html("Radius of star: " + formatSI(d.koi_srad) + " Solar radii");
	d3.select("#tooltip-depth")			.html("Stellar light lost:" + formatSI(d.koi_depth) + " PPM");
	d3.select("#tooltip-duration")		.html("Duration of planet transit:" + formatSI(d.koi_duration) + " hours");
	d3.select("#tooltip-ratio")			.html("Planet-Star Radius Ratio:" + formatSI(d.koi_ror) + " AU");
	d3.select("#tooltip-count")			.html("Number of planets:" + formatSI(d.koi_count));
	d3.select("#tooltip-mass")			.html("Mass of star:" + formatSI(d.koi_smass) + " Solar mass");
	


}//showTooltip	