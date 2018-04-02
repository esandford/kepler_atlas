///////////////////////////////////////////////////////////////////////////
//////////////////////////// Create Scales ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Create color gradient for stars based on their size and temperature
var keplerstarscolors = ["#9C1E1E","#D62828","#E16262","#F3C4C4","#738E9B","#45687A","#2E556A","#174259","#001F2F"];
var keplerstarscolorScale = d3.scale.linear()
	 .domain([2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]) // Temperatures
	 .range(keplerstarscolors);
	
var kepleropacityScale = d3.scale.linear()	
	.domain([0, 1000])
	.range([0, 1]);

//Set scale for radius of circles
//new function to find minimum and maximum stellar radius across the entire data set -James
function return_radius_minmax(keplerstars){
	var currentMinimum = 1000000;
	var currentMaximum = 0;
	var currentRadius;

	for(i=0; i<keplerstars.length; i++){
		currentRadius = keplerstars[i].koi_srad;

		if(currentRadius < currentMinimum){
			currentMinimum = currentRadius;
		}

		if(currentRadius > currentMaximum){
			currentMaximum = currentRadius;
		}

	}
	return [currentMinimum, currentMaximum];
	
	}

radMin = return_radius_minmax(keplerstars)[0] //get minimum and maximum radii -James
radMax = return_radius_minmax(keplerstars)[1]
var rScale = d3.scale.linear()
	.domain([radMin, radMax])
	.range([5, 30]); //james

//set scale for size of Bright Star Catalog stars -James & Chris
function return_vmagnitude_minmax(brightstars){
	var currentMinimum = 1000000;
	var currentMaximum = 0;
	var currentVmagnitude;

	for(i=0; i<brightstars.length; i++){
		currentVmag = brightstars[i].Vmagnitude;

		if(currentVmag< currentMinimum){
			currentMinimum = currentVmag;
		}

		if(currentVmag > currentMaximum){
			currentMaximum = currentVmag;
		}

	}
	return [currentMinimum, currentMaximum];
	
	}
vmagMin = return_vmagnitude_minmax(brightstars)[0]
vmagMax = return_vmagnitude_minmax(brightstars)[1]

var vmagRscale = d3.scale.linear()	
	.domain([vmagMin, vmagMax])
	.range([1.5, 1]);

var vmagcolors = ["#FFF585", "#FFFCEA", "#FFFEFD"];
var vmagcolorscale = d3.scale.linear()
	.domain([vmagMin, vmagMax])
	.range(vmagcolors);

//scale x and y "axes"
var xScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000]);
var yScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000])
var zScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000]);