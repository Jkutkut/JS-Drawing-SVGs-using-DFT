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
 * @param {number} nPointsPath - Number of points to generate. Default: 600
 * @param {number} sizeX - Optional parameter to set the desired width. If NaN, this is ignored.
 * @param {number} sizeY - Optional parameter to set the desired height. If NaN, this is ignored.
 * @returns {object[]} Array with the points of the SVG ({x: float, y: float})
 */
function svgToPoints(fileText, nPointsPath = 600, sizeX, sizeY){
    var wMax = 0, wMin = Infinity, hMax = 0, hMin = Infinity; //To calculate the properties of the SVG
    let doc = new DOMParser().parseFromString(fileText, "text/xml"); //svg as a xml
    let points = [];
    let paths = doc.getElementsByTagName("path"); // Array of paths on the svg
    for (let pi = 0; pi < paths.length; pi++){
        let path = paths[pi]; //get the pº path

        //Get the points of the path
        for ( var i = 0; i < nPointsPath; i++ ){
            let p = path.getPointAtLength(i / nPointsPath * path.getTotalLength());
            // Update the properties based on this point
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
    }
    points.push(points[0]);

    let w = wMax - wMin; //This value is the width of the SVG
    let h = hMax - hMin; //This value is the height of the SVG
    
    // Convert the coordinates origin to the center of the SVG
    for (let i = 0; i < points.length; i++){
        points[i] = {
            x: (points[i].x - wMin) - w * 0.5, 
            y: (points[i].y - hMin) - h * 0.5
        }
    }
    
    if (sizeX || sizeY){ //If the svg must fit on some dimensions, this code will scale it
        let wR = (sizeX)? sizeX / w : sizeY / h; // Ratio
        let hR = (sizeY)? sizeY / h : sizeX / w; // Ratio

        for (let i = 0; i < points.length; i++){
            points[i] = {
                x: points[i].x * wR,
                y: points[i].y * hR
            }
        }
        w *= wR; //The size of the svg has changed
        h *= hR; //The size of the svg has changed
    }
    let r = {
        p: { // Center: {x: 0, y: 0}
            width: w,
            height: h,
        },
        points: points //Here are the points
    };


    return r;
}

function drawPoints(){
    let w = result.p.width;
    let h = result.p.height;
    let oX = result.p.width * 0.5 + 10;
    let oY = result.p.height * 0.5 + 10;
    
    createCanvas(w + 20, h + 20);
    background(200);
    stroke(0); // Change the color
    strokeWeight(3);

    for (let i = 0; i < result.points.length; i++){
        point(result.points[i].x + oX, result.points[i].y + oY);
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
            result = svgToPoints(fileStringArr.join(""), 600, 500);
            drawPoints();
        });
}