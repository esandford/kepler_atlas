//make the close button work
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
		display_name = display_name.split(".", 1); //get just the star name, not the planet name
	}
	else {
		display_name = d.kepler_name;
		display_name = display_name.split(" ", 1); //get just the star name, not the planet name
	}

	//Change the texts inside the tooltip
	d3.select("#tooltip .tooltip-planet").text(display_name);
	d3.select("#tooltip-temperature")	.html("Temperature of star: " + d.koi_steff + " K");
	d3.select("#tooltip-radius")		.html("Radius of star: " + formatSI(d.koi_srad) + " Solar radii");
	d3.select("#tooltip-mass")			.html("Mass of star: " + formatSI(d.koi_smass) + " Solar mass");
	d3.select("#tooltip-count")			.html("Number of planets: " + d.nkoi);
	//d3.select("#tooltip-depth")			.html("Transit depth: " + formatSI(d.koi_depth) + " ppm");
	//d3.select("#tooltip-duration")		.html("Transit duration: " + formatSI(d.koi_duration) + " hours");
	//d3.select("#tooltip-ratio")			.html("Planet-Star Radius Ratio: " + formatSI(d.koi_ror));
	d3.select("#tooltip-depth")			.html("");
	d3.select("#tooltip-duration")		.html("");
	d3.select("#tooltip-ratio")			.html("");
	d3.select("#tooltip-button")		.html("<button onclick=planetView("+d.kepid+")>Planet View</button>");

	//Change the texts inside the pullout tab
	d3.select("#pullout .pullout-planet").html("<br />" + display_name);
	d3.select("#pullout-temperature")	.html("Temperature of star: " + d.koi_steff + " K");
	d3.select("#pullout-radius")		.html("Radius of star: " + formatSI(d.koi_srad) + " Solar radii");
	d3.select("#pullout-mass")			.html("Mass of star: " + formatSI(d.koi_smass) + " Solar masses");
	d3.select("#pullout-count")			.html("Number of planets: " + d.nkoi);
	//d3.select("#pullout-depth")			.html("Transit depth: " + formatSI(d.koi_depth) + " ppm");
	//d3.select("#pullout-duration")		.html("Transit duration: " + formatSI(d.koi_duration) + " hours");
	//d3.select("#pullout-ratio")			.html("Planet-Star Radius Ratio: " + formatSI(d.koi_ror));
	d3.select("#pullout-depth")			.html("");
	d3.select("#pullout-duration")		.html("");
	d3.select("#pullout-ratio")			.html("");
	d3.select("#pullout-button")		.html("");

}//showTooltip	