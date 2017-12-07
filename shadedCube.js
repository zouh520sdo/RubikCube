"use strict";

var canvas;
var gl;

var numVertices  = 36;

var cubesArray = [];
var pointsArray = [];
var normalsArray = [];
var colorsArray = [];

// For animation
var pointsArrayA = [];
var normalsArrayA = [];
var isAnimating = false;
var rotated = 0;
var delta = 10;
var deltaR;

// For setting
var mirrorMode = true;

// For shuffling
var shuffles = [];

// Mapping between keys and direction
var keys2Dir = new Map();
keys2Dir.set("j", vec3(0, 0, 1));
keys2Dir.set("l", vec3(0, 0, -1));
keys2Dir.set("i", vec3(0, 1, 0));
keys2Dir.set("k", vec3(0, -1, 0));
keys2Dir.set("u", vec3(1, 0, 0));
keys2Dir.set("o", vec3(-1, 0, 0));
keys2Dir.set("J", vec3(0, 0, 1));
keys2Dir.set("L", vec3(0, 0, -1));
keys2Dir.set("I", vec3(0, 1, 0));
keys2Dir.set("K", vec3(0, -1, 0));
keys2Dir.set("U", vec3(1, 0, 0));
keys2Dir.set("O", vec3(-1, 0, 0));

keys2Dir.set("a", vec3(0, 0, 1));
keys2Dir.set("d", vec3(0, 0, -1));
keys2Dir.set("w", vec3(0, 1, 0));
keys2Dir.set("s", vec3(0, -1, 0));
keys2Dir.set("q", vec3(1, 0, 0));
keys2Dir.set("e", vec3(-1, 0, 0));
keys2Dir.set("A", vec3(0, 0, 1));
keys2Dir.set("D", vec3(0, 0, -1));
keys2Dir.set("W", vec3(0, 1, 0));
keys2Dir.set("S", vec3(0, -1, 0));
keys2Dir.set("Q", vec3(1, 0, 0));
keys2Dir.set("R", vec3(-1, 0, 0));

var keysArray = [];
for (var key of keys2Dir.keys()) {
    keysArray.push(key);
}

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];

var thetaLoc;

var rotateFlag = false;
var flag = false;
var lastX = null;
var lastY = null;

var eye = null;
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

//function quad(a, b, c, d) {
//
//     var t1 = subtract(vertices[b], vertices[a]);
//     var t2 = subtract(vertices[c], vertices[b]);
//     var normal = cross(t1, t2);
//     var normal = vec3(normal);
//
//
//     pointsArray.push(vertices[a]);
//     normalsArray.push(normal);
//     pointsArray.push(vertices[b]);
//     normalsArray.push(normal);
//     pointsArray.push(vertices[c]);
//     normalsArray.push(normal);
//     pointsArray.push(vertices[a]);
//     normalsArray.push(normal);
//     pointsArray.push(vertices[c]);
//     normalsArray.push(normal);
//     pointsArray.push(vertices[d]);
//     normalsArray.push(normal);
//}

function initCubes() {
    isAnimating = false;
    cubesArray = [];
    for (var i=-1; i<=1; i++) {
        for (var j=-1; j<=1; j++) {
            for (var k=-1; k<=1; k++) {
                var cube = new Cube(vec4(i, j, k, 1));
                cubesArray.push(cube);
                console.log(cube.points.length);
                colorsArray = colorsArray.concat(cube.colors);
            }
        }
    }
    updateCubes();
    numVertices = pointsArray.length;
    pointsArrayA = pointsArray;
    normalsArrayA = normalsArray;
}

function updateCubes() {
    // Re-locate arrays
    pointsArrayA = pointsArray;
    normalsArrayA = normalsArray;
    pointsArray = [];
    normalsArray = [];
    for (var i=0; i<cubesArray.length; i++) {
        var cube = cubesArray[i];
        pointsArray = pointsArray.concat(cube.points);
        normalsArray = normalsArray.concat(cube.normals);
    }
}

//function colorCube()
//{
//    quad( 1, 0, 3, 2 );
//    quad( 2, 3, 7, 6 );
//    quad( 3, 0, 4, 7 );
//    quad( 6, 5, 1, 2 );
//    quad( 4, 5, 6, 7 );
//    quad( 5, 4, 0, 1 );
//}



window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    canvas.onmousedown = function(event) {
        rotateFlag = true;
        lastX = event.clientX;
        lastY = event.clientY;
    }
    
    canvas.onmouseup = function(event) {
        rotateFlag = false;
    }
    
    canvas.onmousemove = function(event) {
        if (rotateFlag) {
            var curX = event.clientX;
            var curY = event.clientY;
            
            var deltaX = curX - lastX;
            var deltaY = curY - lastY;
            
            theta[0] += (deltaX);
            //theta[1] += (deltaY);
            theta[1] = Math.min(Math.max(theta[1]+deltaY, -90), 90);
            
            // Update lastX and lastY
            lastX = curX;
            lastY = curY;
            
            //console.log("Mouse X Y " + curX + " " + curY);
        }
    }

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    initCubes();
    renderCubes();
    
    //thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0 );

    //projection = ortho(-1.2, 1.2, -1.2, 1.2, -100, 100);
    projection = perspective(60, 1, 1, 500);
    //projection = gl.frustum(-1.2, 1.2, -1.2, 1.2, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    // Handle mirror mode checkbox
    document.getElementById("MirrorMode").onchange = function() {
        mirrorMode = document.getElementById("MirrorMode").checked;
        console.log(mirrorMode);
    };
    
    // Handle keys pressing down
    document.addEventListener ("keypress", (event) => {
        
        console.log(event.shiftKey);
        console.log(event.key);
        console.log(keys2Dir.get(event.key));
        rotateSide(keys2Dir.get(event.key), event.shiftKey);    
    });

    document.getElementById("Restart").onclick = function(){
        initCubes();
        renderCubes();
    };
    
    document.getElementById("Shuffle").onclick = function() {
        for (var i=0; i<15; i++) {
            var index = Math.floor(Math.random() * keysArray.length);
            shuffles.push(keys2Dir.get(keysArray[index]));
        }
        console.log(shuffles.length);
        shuffle();
    }

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));

    render();
}

var shuffle = function() {
    console.log(shuffles.length);
    if (shuffles.length == 0) return;

    var a = shuffles.pop();
    var reverse = Math.random < 0.5? true : false;

    rotateSide(a, reverse);
}

var rotateSide = function(axis, reverse) {
    if (axis !== undefined) {
        var aaxis = [];
        if (!mirrorMode) {
            aaxis = axis;
        }
        else {
            axis.forEach(function(element) {
                aaxis.push(Math.abs(element));
            });
        }

        if (isAnimating) return;
        if (reverse) {
            deltaR = rotate(-delta, aaxis);
        }
        else {
            deltaR = rotate(delta, aaxis);
        }
        for (var i=0; i<cubesArray.length; i++) {
            var cube = cubesArray[i];

            var index = axis.indexOf(1) == -1? axis.indexOf(-1) : axis.indexOf(1);


            if (axis[index] * cube.origin[index] > 0) {
                cube.rotate(aaxis, reverse);
            }
        }
        startRotateAnim();
    }
}

var isArrayEqual = function(a, b) {
    if (a.length != b.length) {
        return false;
    }
    for (var i=0; i<a.length; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

var renderCubes = function() {
    
    rotated += delta;
    
    for (var i=0; i<pointsArray.length; i++) {
        var pos = pointsArray[i];
        var posA = pointsArrayA[i];
        if (!isArrayEqual(pos, posA)) {
            isAnimating = true;
            posA = mult(deltaR, posA);
//            for (var j=0; j<posA.length; j++) {
//                posA[j] = posA[j].toFixed(2);
//            }
            pointsArrayA[i] = posA;
        }
    }
    
    for (var i=0; i<normalsArray.length; i++) {
        var nor = normalsArray[i];
        var norA = normalsArrayA[i];
        if (!isArrayEqual(nor, norA)) {
            isAnimating = true;
            norA = mult(deltaR, vec4(norA));
//            for (var j=0; j<norA.length; j++) {
//                norA[j] = norA[j].toFixed(2);
//            }
            normalsArrayA[i] = vec3(norA);
        }
    }
    
    // Normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArrayA), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    // Locations
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArrayA), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Colors
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    if (isAnimating && rotated < 90) {
        requestAnimFrame(renderCubes);
    }
    else {
        isAnimating = false;
        shuffle();
    }
}

var startRotateAnim = function() {
    updateCubes();
    isAnimating = false;
    rotated = 0;
    renderCubes();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 2.0;

//    modelView = mat4();
//    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
//    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
//    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));

    var radius = 3;
    
//    eye = vec3(radius*Math.sin(radians(theta[0]))*Math.cos(radians(theta[1])),
//        radius*Math.sin(radians(theta[0]))*Math.sin(radians(theta[1])), radius*Math.cos(radians(theta[0])));

    eye = vec3(radius*Math.cos(radians(theta[0]))*Math.cos(radians(theta[1])), radius*Math.sin(radians(theta[1])), radius*Math.sin(radians(theta[0]))*Math.cos(radians(theta[1])));
    
    //console.log("Camera XYZ " + eye[0] + " " + eye[1] + " " + eye[2]);
    
    modelView = lookAt(eye, at , up);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


    requestAnimFrame(render);
}
