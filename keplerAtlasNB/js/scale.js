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

var keplerstarscolors = ["#D86865","#F3C4C4","#DOEEFD","#99DAFB","#1B90CB"];
var keplerstarscolorScale = d3.scale.linear()
	 .domain([steffMin, steffMax]) // Temperatures
	 .range(keplerstarscolors);

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
var keplerplanetscolorScale= d3.scale.linear()
	.domain([teqMin, teqMax])
	.range(keplerplanetcolors);
	
var kepleropacityScale = d3.scale.linear()	
	.domain([0, 1000])
	.range([0, 1]);

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
var smaScale = d3.scale.linear()
      .domain([smaMin, smaMax])
      .range([500, 5000]); //james
//Set scale for radius of circles
//new function to find minimum and maximum stellar radius across the entire data set -James
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
      .domain([rorMin, rorMax])
      .range([1, 100]); //james

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
	.range([5, 30]); //james*/

//set scale for size of Bright Star Catalog stars -James & Chris
/*function return_vmagnitude_minmax(brightstars){
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
/*vmagMin = return_vmagnitude_minmax(brightstars)[0]
vmagMax = return_vmagnitude_minmax(brightstars)[1]

var vmagRscale = d3.scale.linear()	
	.domain([vmagMin, vmagMax])
	.range([1.5, 1]);

var vmagcolors = ["#FFF585", "#FFFCEA", "#FFFEFD"];
var vmagcolorscale = d3.scale.linear()
	.domain([vmagMin, vmagMax])
	.range(vmagcolors);*/

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