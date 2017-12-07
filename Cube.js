function Cube(origin) {
    
    var vertices = [
        vec4( -0.47, -0.47,  0.47, 1.0 ),
        vec4( -0.47,  0.47,  0.47, 1.0 ),
        vec4( 0.47,  0.47,  0.47, 1.0 ),
        vec4( 0.47, -0.47,  0.47, 1.0 ),
        vec4( -0.47, -0.47, -0.47, 1.0 ),
        vec4( -0.47,  0.47, -0.47, 1.0 ),
        vec4( 0.47,  0.47, -0.47, 1.0 ),
        vec4( 0.47, -0.47, -0.47, 1.0 )
    ];
    
    var colours = [0xC41E3A, 0x009E60, 0x0051BA, 0xFF5800, 0xFFD500, 0xFFFFFF];
    
    var colors = [
        vec4(0xC4/0xFF, 0x1E/0xFF, 0x3A/0xFF, 1.0),
        vec4(0x00/0xFF, 0x9E/0xFF, 0x60/0xFF, 1.0),
        vec4(0x00/0xFF, 0x51/0xFF, 0xBA/0xFF, 1.0),
        vec4(0xFF/0xFF, 0x58/0xFF, 0x00/0xFF, 1.0),
        vec4(0xFF/0xFF, 0xD5/0xFF, 0x00/0xFF, 1.0),
        vec4(0xFF/0xFF, 0xFF/0xFF, 0xFF/0xFF, 1.0),
    ];
    
    this.points = [];
    this.normals = [];
    this.colors = [];
    this.origin = origin;
    
    this.quad = function(a, b, c, d, origin, cIndex) {
        aa = add(vertices[a], origin);
        bb = add(vertices[b], origin);
        cc = add(vertices[c], origin);
        dd = add(vertices[d], origin);

        var t1 = subtract(bb, aa);
        var t2 = subtract(cc, bb);
        var normal = cross(t1, t2);
        var normal = vec3(normal);

        this.points.push(aa);
        this.normals.push(normal);
        this.colors.push(colors[cIndex]);
        this.points.push(bb);
        this.normals.push(normal);
        this.colors.push(colors[cIndex]);
        this.points.push(cc);
        this.normals.push(normal);
        this.colors.push(colors[cIndex]);
        this.points.push(aa);
        this.normals.push(normal);
        this.colors.push(colors[cIndex]);
        this.points.push(cc);
        this.normals.push(normal);
        this.colors.push(colors[cIndex]);
        this.points.push(dd);
        this.normals.push(normal);
        this.colors.push(colors[cIndex]);
    }
    
    this.colorCube = function(origin)
    {
        this.quad( 1, 0, 3, 2, origin, 0 );
        this.quad( 2, 3, 7, 6, origin, 1 );
        this.quad( 3, 0, 4, 7, origin, 2 );
        this.quad( 6, 5, 1, 2, origin, 3 );
        this.quad( 4, 5, 6, 7, origin, 4 );
        this.quad( 5, 4, 0, 1, origin, 5 );
    }
    
    this.colorCube(origin);
    
    this.getInfo = function() {
        return origin[0].toString() + ' ' + origin[1].toString() + ' ' + origin[2].toString();
    }
    
    this.round = function(input) {
        output = [];
        for (var i=0; i<input.length; i++) {
            output.push(Math.round(input[i]));
        }
        return output;
    }
    
    this.roundTo = function(input, pre) {
        output = [];
        for (var i=0; i<input.length; i++) {
            output.push(input[i].toFixed(pre));
        }
        return output;
    }
    
    this.rotate = function(axis, reverse) {
        var degree = 90;
        if (reverse) {
            degree = -degree;
        }
        r = rotate(degree, axis);
//        switch(type) {
//            case 'x':
//                r = rotateX(90);
//                console.log("rotate x");
//                break;
//            case 'y':
//                r = rotateY(90);
//                console.log("rotate y");
//                break;
//            case 'z':
//                r = rotateZ(90);
//                console.log("rotate z");
//                break;
//        }
        
        // origin
        o = this.origin;
        this.origin = this.roundTo(mult(r, o), 2);
        //console.log(this.origin);
        //console.log("========================");
        // points
        for (var i=0; i<this.points.length; i++) {
            p = this.points[i];
            //console.log(p);
            this.points[i] = this.roundTo(mult(r, p), 2);
            //console.log(this.points[i]);
        }
        // normals
        for (var i=0; i<this.normals.length; i++) {
            n = vec4(this.normals[i]);
            this.normals[i] = vec3(this.roundTo(mult(r, n), 2));
        }
    }
    
}