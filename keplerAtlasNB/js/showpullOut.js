function showpullOut(){


var display_name;

	if (d.kepler_name=="--"){
		display_name = d.kepoi_name;
	}
	else {
		display_name = d.kepler_name;
	}

	//Change the texts inside the pullout
	d3.select("#pullout .pullout-planet").text(display_name);
	d3.select("#pullout-temperature")	.html("Temperature of star: " + d.koi_steff + " Kelvin");
	d3.select("#pullout-radius")		.html("Radius of star: " + formatSI(d.koi_srad) + " Solar radii");
	d3.select("#pullout-depth")			.html("Stellar light lost:" + formatSI(d.koi_depth) + " PPM");
	d3.select("#pullout-duration")		.html("Duration of planet transit:" + formatSI(d.koi_duration) + " hours");
	d3.select("#pullout-ratio")			.html("Planet-Star Radius Ratio:" + formatSI(d.koi_ror) + " AU");
	d3.select("#pullout-count")			.html("Number of planets:" + formatSI(d.koi_count));
	d3.select("#pullout-mass")			.html("Mass of star:" + formatSI(d.koi_smass) + " Solar mass");
	d3.select("#pullout-button")		.html("<button onclick=planetView("+d.kepid+")>Planet View</button>");
}//showpullout	
