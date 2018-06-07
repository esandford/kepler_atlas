///////////////////////////////////////////////////////////////////////////
//////////////////////////// Create Scales ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Create color gradient for stars based on their size and temperature

function return_steff_minmax(keplerstars){
      var currentMinimum = 1000000;
      var currentMaximum = 0;
      var currentSteff;

      for(i=0; i<keplerstars.length; i++){
            currentSteff = keplerstars[i].koi_steff;

            if(currentSteff < currentMinimum){
                  currentMinimum = currentSteff;
            }

            if(currentSteff > currentMaximum){
                  currentMaximum = currentSteff;
            }

      }
      return [currentMinimum, currentMaximum];
      
      }
steffMin = return_steff_minmax(keplerstars)[0]
steffMax = return_steff_minmax(keplerstars)[1]      

//var keplerstarscolors = ["#D86865","#F3C4C4","#D0EEFD","#99DAFB","#1B90CB"]; //color scale from James
var keplerstarscolors = ["#9C1E1E","#D62828","#E16262","#F3C4C4","#738E9B","#45687A","#2E556A","#174259","#001F2F"];
var keplerstarscolorScale = d3.scale.linear()
	 .domain([2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]) // Temperatures
	 //.domain([steffMin, steffMax]) //james
	 .range(keplerstarscolors);
	
var kepleropacityScale = d3.scale.linear()	
	.domain([0, 1000])
	.range([0, 1]);

function return_teq_minmax(keplerstars){
      var currentMinimum = 1000000;
      var currentMaximum = 0;
      var currentTeq;

      for(i=0; i<keplerstars.length; i++){
            currentTeq = keplerstars[i].koi_teq;

            if(currentTeq < currentMinimum){
                  currentMinimum = currentTeq;
            }

            if(currentTeq > currentMaximum){
                  currentMaximum = currentTeq;
            }

      }
      return [currentMinimum, currentMaximum];
      
      }
teqMin = return_teq_minmax(keplerstars)[0]
teqMax = return_teq_minmax(keplerstars)[1]
var keplerplanetcolors = ["#FAD8D7","#F5A5A3","#F49896","#F0726F","#EF6461"];
var keplerplanetcolorScale= d3.scale.linear()
	.domain([teqMin, teqMax])
	.range(keplerplanetcolors);

function return_sma_minmax(keplerstars){
      var currentMinimum = 1000000;
      var currentMaximum = 0;
      var currentSMA;

      for(i=0; i<keplerstars.length; i++){
            currentSMA = keplerstars[i].koi_sma;

            if(currentSMA < currentMinimum){
                  currentMinimum = currentSMA;
            }

            if(currentSMA > currentMaximum){
                  currentMaximum = currentSMA;
            }

      }
      return [currentMinimum, currentMaximum];
      
      }

smaMin = return_sma_minmax(keplerstars)[0] //get minimum and maximum radii -James
smaMax = return_sma_minmax(keplerstars)[1]
//console.log(smaMin);
//console.log(smaMax);
var smaScale = d3.scale.linear()
      .domain([0, smaMax])
      .range([500, 5000]); //james

function return_ror_minmax(keplerstars){
      var currentMinimum = 1000000;
      var currentMaximum = 0;
      var currentRadius;

      for(i=0; i<keplerstars.length; i++){
            currentRadius = keplerstars[i].koi_ror;

            if(currentRadius < currentMinimum){
                  currentMinimum = currentRadius;
            }

            if(currentRadius > currentMaximum){
                  currentMaximum = currentRadius;
            }

      }
      return [currentMinimum, currentMaximum];
      
      }

rorMin = return_ror_minmax(keplerstars)[0] //get minimum and maximum radii -James
rorMax = return_ror_minmax(keplerstars)[1]

var rorScale = d3.scale.linear()
      .domain([0, rorMax])
      .range([1, rorMax/rorMin]); //james

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
	.domain([0, radMax])
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

//caroline & catherine: planet size
var pScale = d3.scale.linear()
	.domain([0, 5])
	.range([5, 200]); 

vmagMin = return_vmagnitude_minmax(brightstars)[0]
vmagMax = return_vmagnitude_minmax(brightstars)[1]

var vmagRscale = d3.scale.linear()	
	.domain([vmagMin, vmagMax])
	.range([1.5, 1]);

var vmagcolors = ["#FFF585", "#FFFCEA", "#FFFEFD"];
var vmagcolorscale = d3.scale.linear()
	.domain([vmagMin, vmagMax])
	.range(vmagcolors);

//scale x, y, and z "axes"
var xScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000]);
var yScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000])
var zScale = d3.scale.linear()
    .domain([0, 15000])
    .range([0,15000]);