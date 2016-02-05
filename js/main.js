/**
 * Created by 393 on 2015/10/17.
 */
window.onload = function () {

    var c = document.getElementById("canvas");
    c.width = 512;
    c.height = 512;
    var gl = c.getContext("webgl") || c.getContext("experimental-webgl");
    if (!gl) {
        alert("no support webgl");
        return
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE);

    gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.BACK);
    //gl.cullFace(gl.FRONT);

    var vertexShaderSource = document.getElementById("vs").textContent;
    var fragmentShaderSource = document.getElementById("fs").textContent;
    var programs = shaderProgram(vertexShaderSource, fragmentShaderSource);

    var sphereData = sphere(16, 16, .5);
    var vboList = []
    vboList.push(generateVBO(sphereData.p))
    vboList.push(generateVBO(sphereData.t))
    vboList.push(generateVBO(sphereData.n))
    //vboList.push(generateVBO(sphereData.c))

    var attLocation = [];
    attLocation.push(gl.getAttribLocation(programs, "position"))
    attLocation.push(gl.getAttribLocation(programs, "texCoord"))
    attLocation.push(gl.getAttribLocation(programs, "normal"))
    //attLocation.push(gl.getAttribLocation(programs, "color"))

    var attStride = [];
    attStride.push(3)
    attStride.push(2)
    attStride.push(3)
    //attStride.push(4)

    var indexBuffer = generateIBO(sphereData.i);

    setAttribute(vboList, attLocation, attStride, indexBuffer);

    var mat = new matIV();
    var mMatrix = mat.identity(mat.create());
    var vMatrix = mat.identity(mat.create());
    var pMatrix = mat.identity(mat.create());
    var vpMatrix = mat.identity(mat.create());
    var mvpMatrix = mat.identity(mat.create());
    var invMatrix = mat.identity(mat.create());

    var lightDirection = [0.0, 1.0, 0.0];
    var cameraPosition = [0.0, 50.0, 20.0];
    var centerPosition = [0.0, 0.0, 0.0];
    var cameraUp = [0.0, 1.0, 0.0];
    var ambientColor = [0.0, 0.0, 0.0];

    mat.lookAt(cameraPosition, centerPosition, cameraUp, vMatrix);
    var fov = 45;
    var aspect = c.width / c.height;
    var near = 0.1;
    var far = 200.0;
    mat.perspective(fov, aspect, near, far, pMatrix);
    mat.multiply(pMatrix, vMatrix, vpMatrix);
    //mat.multiply(vpMatrix, mMatrix, mvpMatrix);

    var uniLocation = {};
    uniLocation.mvpMatrix = gl.getUniformLocation(programs, "mvpMatrix");
    uniLocation.invMatrix = gl.getUniformLocation(programs, "invMatrix");
    uniLocation.lightDirection = gl.getUniformLocation(programs, "lightDirection");
    uniLocation.eyePosition = gl.getUniformLocation(programs, "eyePosition");
    uniLocation.centerPosition = gl.getUniformLocation(programs, "centerPosition");
    uniLocation.ambientColor = gl.getUniformLocation(programs, "ambientColor");
    uniLocation.texture = gl.getUniformLocation(programs, "texture");



    var count = 0;

    gl.drawElements(gl.LINE_LOOP, sphereData.i.length, gl.UNSIGNED_SHORT, 0);
    gl.flush();





    function textureLoadComplete(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        requestAnimationFrame(render);
    }
    generateTexure("images/test.jpg");


    function render() {
        lightDirection = [0.0, 0.2, -1.0];
        cameraPosition = [Math.sin(count *.01)*10.0,0.0,Math.cos(count *.01)*10.0];
        centerPosition = [0.0, 0.0, 0.0];

        mat.lookAt(cameraPosition, centerPosition, cameraUp, vMatrix);
        var fov = 45;
        var aspect = c.width / c.height;
        var near = 0.1;
        var far = 200.0;
        mat.perspective(fov, aspect, near, far, pMatrix);
        mat.multiply(pMatrix, vMatrix, vpMatrix);

        count += 1;
        var radians = (count % 360) * Math.PI / 180;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat.identity(mMatrix);
        var axis = [1.0, 0.0, 0.0];
        //mat.translate(mMatrix,[Math.sin(count *.01)*3,Math.sin(count *.01)*3,0],mMatrix);
        mat.rotate(mMatrix, radians, axis, mMatrix);
        mat.multiply(vpMatrix, mMatrix, mvpMatrix);
        mat.inverse(mMatrix, invMatrix);

        gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMatrix);
        gl.uniform1i(uniLocation.texture, 0);
        gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMatrix);
        gl.uniform3fv(uniLocation.lightDirection, lightDirection);
        gl.uniform3fv(uniLocation.eyePosition, cameraPosition);
        gl.uniform3fv(uniLocation.centerPosition, centerPosition);
        gl.uniform3fv(uniLocation.ambientColor, ambientColor);
        //gl.drawElements(gl.POINTS, sphereData.i.length, gl.UNSIGNED_SHORT, 0);
        //gl.drawElements(gl.LINE_LOOP, sphereData.i.length, gl.UNSIGNED_SHORT, 0);

        //gl.cullFace(gl.FRONT);
        //gl.drawElements(gl.TRIANGLES, sphereData.i.length, gl.UNSIGNED_SHORT, 0);
        gl.cullFace(gl.BACK);
        gl.drawElements(gl.TRIANGLES, sphereData.i.length, gl.UNSIGNED_SHORT, 0);

        gl.flush();
        requestAnimationFrame(render);
    }

    function generateVBO(data) {
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vertexBuffer;
    }

    function generateIBO(data) {
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return indexBuffer;
    }

    function setAttribute(vbo, attL, attS, ibo) {
        for (var i in vbo) {
            console.log(i)
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            gl.enableVertexAttribArray(attL[i]);
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    }

    function generateTexure(source) {
        var img = new Image();

        img.onload = function () {
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            textureLoadComplete(texture);
        }
        img.src = source;
    }



    function shaderProgram(vertexShaderSource, fragmentShaderSource) {

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        checkShaderCompile(gl, vertexShader)

        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        checkShaderCompile(gl, fragmentShader)

        var programs = gl.createProgram();
        gl.attachShader(programs, vertexShader);
        gl.attachShader(programs, fragmentShader);
        gl.linkProgram(programs);
        checkLinkPrograms(gl, programs)

        return programs;
    }
}


function checkShaderCompile(gl, shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader))
    }
}
function checkLinkPrograms(gl, program) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program))
    } else {
        gl.useProgram(program);
    }
}
function genTriangle() {
    var obj = {};
    obj.p = [
        0.0, 0.5, 0.0,
        0.5, -0.5, 0.0,
        -0.5, -0.5, 0.0
    ];
    return obj;
}