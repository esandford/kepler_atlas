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

function convertXYZ(distance, xyzinputRA, xyzinputdec){
                var l = convertL(inputRA=xyzinputRA, inputdec=xyzinputdec);
                var b = convertB(inputRA=xyzinputRA, inputdec=xyzinputdec);

                l=l*(Math.PI/180.);

                b=b*(Math.PI/180.);

                var x_star = distance * (Math.cos(l)) * (Math.cos(b));
                // console.log(x_star)

                var y_star = distance*(Math.cos(b))*(Math.sin(l));
                // console.log(y_star)

                var z_star = distance * (Math.sin(b));
                // console.log(z_star)

                var xyz_list = [x_star, y_star, z_star];

                return xyz_list;}