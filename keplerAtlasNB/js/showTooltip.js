document.getElementById('closeButton').addEventListener('click', function(e) {
    e.preventDefault();
    stopTooltip=true;
}, false);

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
	  //Breaks from the timer function when stopTooltip is changed to true
	  //by another function
	  if (stopTooltip == true) { 
		//Hide tooltip
		d3.select("#tooltip").transition().duration(25)
			.style('opacity',0)
		}
	});

	var display_name;

	if (d.kepler_name=="--"){
		display_name = d.kepoi_name;
	}
	else {
		display_name = d.kepler_name;
	}

	//Change the texts inside the tooltip
	d3.select("#tooltip .tooltip-planet").text(display_name);
	d3.select("#tooltip-temperature")	.html("Temperature of star: " + d.koi_steff + " Kelvin");
	d3.select("#tooltip-radius")		.html("Radius of star: " + formatSI(d.koi_srad) + " Solar radii");
	d3.select("#tooltip-depth")			.html("Stellar light lost: " + formatSI(d.koi_depth) + " PPM");
	d3.select("#tooltip-duration")		.html("Duration of planet transit: " + formatSI(d.koi_duration) + " hours");
	d3.select("#tooltip-ratio")			.html("Planet-Star Radius Ratio: " + formatSI(d.koi_ror) + " AU");
	d3.select("#tooltip-count")			.html("Number of planets: " + d.nkoi);
	d3.select("#tooltip-mass")			.html("Mass of star: " + formatSI(d.koi_smass) + " Solar mass");
	d3.select("#tooltip-button")		.html("<button onclick=planetView("+d.kepid+")>Planet View</button>");
}//showTooltip	