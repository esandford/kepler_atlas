 function convertL(inputRA, inputdec){
                    var Lnaught = 122.93*(Math.PI/180.);
                    var Anaught = 192.86*(Math.PI/180.);
                    var Dnaught = 27.13*(Math.PI/180.);
                    var L;
                    var inputRA_radians = inputRA*(Math.PI/180.)
                    var inputdec_radians = inputdec*(Math.PI/180.)


                    L =  (Lnaught - Math.atan2(((Math.cos(inputdec_radians)) * (Math.sin(inputRA_radians - Anaught))), 
                        (((Math.sin(inputdec_radians)) * (Math.cos(Dnaught))) - ((Math.cos(inputdec_radians)) * 
                          (Math.sin(Dnaught)) * (Math.cos(inputRA_radians - Anaught))))));

                    return L*(180./Math.PI); }

        function convertB(inputRA, inputdec){
                    var Anaught = 192.86*(Math.PI/180.);
                    var Dnaught = 27.13*(Math.PI/180.);
                    var B;
                    var inputRA_radians = inputRA*(Math.PI/180.)
                    var inputdec_radians = inputdec*(Math.PI/180.)

                    B =  (Math.asin(((Math.sin(inputdec_radians))*(Math.sin(Dnaught)))+((Math.cos(inputdec_radians))*(Math.cos(Dnaught))*(Math.cos(inputRA_radians-Anaught)))))
                   
                    //console.log(B);
                    return B*(180./Math.PI);}

        var x = convertL(inputRA=302., inputdec=53.);
        // console.log(x);

        var y = convertB(inputRA=302., inputdec=53.);
        // console.log(y);

        

        function convertXYZ(distance, xyzinputRA, xyzinputdec){
                var l = convertL(inputRA=xyzinputRA, inputdec=xyzinputdec);
                var b = convertB(inputRA=xyzinputRA, inputdec=xyzinputdec);

                l=l*(Math.PI/180.)

                b=b*(Math.PI/180.)

                var x_star = distance * (Math.cos(l)) * (Math.cos(b))
                // console.log(x_star)

                var y_star = distance*(Math.cos(b))*(Math.sin(l))
                // console.log(y_star)

                var z_star = distance * (Math.sin(b))
                // console.log(z_star)

                var xyz_list = [x_star, y_star, z_star];

                return xyz_list;}


        var testxyz = convertXYZ(distance=1000, xyzinputRA=266.48, xyzinputdec=-28.94);
        var testx = testxyz[0];
        var testy = testxyz[1];




 
    // varaibles for page sizing
  
    var margin = {top: 20, right: 20, bottom: 20, left: 40};
    var width = 1200 - margin.left - margin.right;
    var height = 800 - margin.top - margin.bottom;

    var svg = d3.select("body")
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .append("svg")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-100 -100 1000 1000")
        //class to make it responsive
        .classed("svg-content-responsive", true)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set up the svg object (the "canvas")
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        //function to create a "star" object
        function star(id, name, RA, dec, mag, dist){
          this.id = id;
          this.name = name;
          this.RA = RA;
          this.dec = dec;
          this.mag = mag;
            this.distance = dist 


            
            this.L = convertL(this.RA, this.dec);
            this.B = convertB(this.RA, this.dec);
            this.x = convertXYZ(this.distance, this.RA, this.dec)[0];
            this.y = convertXYZ(this.distance, this.RA, this.dec)[1];
            this.z = convertXYZ(this.distance, this.RA, this.dec)[2];
        }

        //create a variable to hold an array of "star" objects
        var keplerData = [];
        //call the existing d3.csv function to read in and plot the kepler data
        d3.csv("./KOIarchive_stellar.csv", function(csvdata){
          //console.log (csvdata.length);

          //for each line in csvdata, create a "star" object and append it to the existing keplerData array
          for(i=0; i<csvdata.length; i++){
            //the + is shorthand for forcing js to interpret something as a number instead of a string.
      //create a star and put data in it
      var rowStar = new star(id = +csvdata[i].kepid,
                    name = csvdata[i].kepoi_name,
                    RA = +csvdata[i].ra,
                    dec = +csvdata[i].dec,
                    mag = +csvdata[i].koi_kepmag,
                    distance = +csvdata[i].dist);

      //append star object to keplerData
      keplerData.push(rowStar);
          }

          console.log(keplerData[0]);

          //set up x- and y- axis transformations
          var xScale = d3.scaleLinear()
            .domain([-500, 4000])
            .range([0, width]);
      var yScale = d3.scaleLinear()
            .domain([0, 10000])
            .range([height, 0.]);




          var xAxis = d3.axisBottom().scale(xScale);
          var yAxis = d3.axisLeft().scale(yScale);

          // draw the x- axis
          svg.append("g")
            .attr("class", "xaxis") // object type is now "g.axis"
            .attr("transform", "translate(0,"+height+")")
            .call(xAxis);

          svg.append("text") //adding label "RA"
            .attr("class","label")
            .attr("transform", "translate(0,"+height+")")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text("x");

          //draw y- axis
          svg.append("g")
            .attr("class", "yaxis") // object type is now "g.axis"
            // .attr("transform", "translate("+width+", height)")
            .call(yAxis);


          svg.append("text") //adding label "Dec"
            .attr("class","label")
            // .attr("transform", "translate("+width+", height)")
            .attr("x", 0)
            .attr("y", 0)
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text("y");

          //Plotting data
          svg.selectAll("circle")
              .data(keplerData)
            .enter().append("circle")
            .style("r","1px")
            .style("fill","steelblue")
            .attr("cx", function(d) {return xScale(d.x)})
            .attr("cy", function(d) {return yScale(d.y)});

})