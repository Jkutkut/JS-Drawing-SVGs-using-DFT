var points = [];
var result;
var file;
var offset = {x: 0, y: 0};


function setup(){
    fileInput = createFileInput(appendFile, false); //When file selected, execute appendFile (only 1 file per selection)
}
function draw(){
}

/**
 * Given a string with the svg content, returns a array of points.
 * @param {string[]} fileText -  String with the svg code
 * @returns {object[]} Array with the points of the SVG ({x: float, y: float})
 */
function svgToPoints(fileText){
    var wMax = 0, wMin = Infinity, hMax = 0, hMin = Infinity; //To calculate the properties of the SVG
    let doc = new DOMParser().parseFromString(fileText, "text/xml"); //svg as a xml
    let path = doc.getElementsByTagName("path")[0]; //get the only path on the svg (the first)
    
    for ( var i = 0, l = 600; i < l; i++ ){
        var p = path.getPointAtLength(i / l * path.getTotalLength());
        if (wMax < p.x){
            wMax = p.x;
        }
        else if (wMin > p.x){
            wMin = p.x;
        }
        if (hMax < p.y){
            hMax = p.y;
        }
        else if (hMin > p.y){
            hMin = p.y;
        }
        points.push(p); //add the point
    }
    
    let r = {
        p: {
            size: {
                w: wMax - wMin, 
                h: hMax - hMin
            },
            coord: {
                x: wMin,
                y: hMin
            }
        },
        points: points
    };

    return r;
}

function drawPoints(){
    let w = result.p.size.w;
    let h = result.p.size.h;
    let oX = result.p.coord.x - 10;
    let oY = result.p.coord.y - 10;
    
    createCanvas(w + 20, h + 20);
    background(200);
    stroke(0); // Change the color
    strokeWeight(3); // Make the points 10 pixels in size

    for (let i = 0; i < result.points.length; i++){
        point(result.points[i].x - oX, result.points[i].y - oY);
    }
}
function appendFile(file){
    print(file.name);
    try {
        if (file.type != "image"){
            throw "The file must be a svg image";
        }
        if (file.subtype != "svg+xml" || !RegExp("\.+\\.svg$").test(file.name)){
            throw "The file must be a .svg image, not just an image";
        }
    } catch (error) {
        console.warn("Error");
        console.warn(error);
        return; //end execution of this function
    }
    // if here, the file should be correct
    loadStrings(file.data, function(fileStringArr){
            result = svgToPoints(fileStringArr.join(""));
            drawPoints();
        });
}