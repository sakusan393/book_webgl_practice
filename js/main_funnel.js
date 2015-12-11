var Camera = function (canvas) {
    // ビュー座標変換行列
    this.centerPoint = [0.0, 0.0, 0.0];    // 注視点
    this.x = 0
    this.y = 0
    this.z =20
    this.cameraPosition = [this.x, this.y, this.z]; // カメラの位置
    this.cameraUp = [0.0, 1.0, 0.0];       // カメラの上方向
    this.mat = new matIV();
    this.vMatrix = this.mat.identity(this.mat.create());
    this.pMatrix = this.mat.identity(this.mat.create());
    this.vpMatrix = this.mat.identity(this.mat.create());
    this.mat.lookAt(this.cameraPosition, this.centerPoint, this.cameraUp, this.vMatrix);

    // プロジェクションのための情報を揃える
    this.fov = 45;                             // 視野角
    this.aspect = canvas.width / canvas.height; // アスペクト比
    this.near = 0.1;                            // 空間の最前面
    this.far = 200.0;                            // 空間の奥行き終端
    this.mat.perspective(this.fov, this.aspect, this.near, this.far, this.pMatrix);
    this.mat.multiply(this.pMatrix, this.vMatrix, this.vpMatrix);
    this.count=0;
}
Camera.prototype = {
    render:function(){
        this.count+=1;
        this.x = Math.sin( (this.count *.003 % 360 ))  * 10;
        this.y = Math.cos( (this.count *.002 % 360) ) * 13;
        this.z = Math.cos( (this.count *.010 % 360) ) * 5;
        //this.z = (Math.sin( (this.count % 360 *.1) * Math.PI / 180))*  30 - 10
        this.cameraPosition = [this.x, this.y, this.z]

        this.mat.lookAt(this.cameraPosition, this.centerPoint, this.cameraUp, this.vMatrix);
        this.mat.perspective(this.fov, this.aspect, this.near, this.far, this.pMatrix);
        this.mat.multiply(this.pMatrix, this.vMatrix, this.vpMatrix);
    }
}
var DirectionLight = function () {
    // ビュー座標変換行列
    this.lightPosition = [10.0, 10.0, 10.0];
    this.ambientColor = [0.0, 0.0, 0.1];
}
DirectionLight.prototype = {}

Funnel = function (gl,img) {
    this.gl = gl;
    this.modelData = window.funnel();
    this.mat = new matIV();
    this.mMatrix = this.mat.identity(this.mat.create());
    this.invMatrix = this.mat.identity(this.mat.create());
    this.x = 0
    this.y = 0
    this.z = 0
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.count = 0;
    this.rnd = Math.random() * 180 + 20
    this.speed = Math.random() * .1

    if(img){
        this.initTexture(img);
    }
}
Funnel.prototype = {
    initTexture:function(img){
        // テクスチャオブジェクトの生成
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        //this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    },
    render: function () {
        this.count+=this.speed
        this.x = Math.sin((this.count+this.rnd)/10) * this.rnd * .14
        this.y = Math.sin((this.count+this.rnd)/3) * this.rnd * .2
        this.z = Math.cos((this.count+this.rnd)/7) * this.rnd * .5
        var translatePosition = [this.x, this.y, this.z];
        this.mat.identity(this.mMatrix);
        this.mat.translate(this.mMatrix, translatePosition, this.mMatrix);
        var radians = (0 % 360) * Math.PI / 180;
        var axis = [1.0, 0.0, 0.0];
        this.mat.rotate(this.mMatrix, radians, axis, this.mMatrix);
        this.mat.inverse(this.mMatrix, this.invMatrix);
    }
}
Cokpit = function (gl,img) {
    this.gl = gl;
    this.modelData = window.sphere(10,10,3);
    this.mat = new matIV();
    this.mMatrix = this.mat.identity(this.mat.create());
    this.invMatrix = this.mat.identity(this.mat.create());
    this.x = 0
    this.y = 0
    this.z = 0
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.count = 0;
    this.rnd = Math.random() * 180 + 20
    this.speed = Math.random() * .1

    if(img){
        this.initTexture(img);
    }
}
Cokpit.prototype = {
    initTexture:function(img){
        // テクスチャオブジェクトの生成
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        //this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    },
    render: function () {
        this.count+=this.speed
        //this.x = Math.sin((this.count+this.rnd)/10) * this.rnd * .14
        //this.y = Math.sin((this.count+this.rnd)/3) * this.rnd * .2
        //this.z = Math.cos((this.count+this.rnd)/7) * this.rnd * .5
        var translatePosition = [this.x, this.y, this.z];
        this.mat.identity(this.mMatrix);
        this.mat.translate(this.mMatrix, translatePosition, this.mMatrix);
        var radians = (0 % 360) * Math.PI / 180;
        var axis = [1.0, 0.0, 0.0];
        //this.mat.rotate(this.mMatrix, radians, axis, this.mMatrix);
        this.mat.inverse(this.mMatrix, this.invMatrix);
    }
}


Scene3D = function (gl, camera,light) {
    this.gl = gl
    this.camera = camera;
    this.light = light;
    this.meshList = [];
    this.mat = new matIV();
    this.mvpMatrix = this.mat.identity(this.mat.create());
    this.count = 0
    this.initWebgl();
    this.generateTexture(ImageLoader.images)
    this.render()
}
Scene3D.prototype = {

    addChild: function (mesh) {
        // 頂点データからバッファを生成（りんごモデル）
        var vPositionBuffer = this.generateVBO(mesh.modelData.p);
        var vNormalBuffer = this.generateVBO(mesh.modelData.n);
        var vTexCoordBuffer = this.generateVBO(mesh.modelData.t);
        var meshVboList = [vPositionBuffer, vNormalBuffer, vTexCoordBuffer];
        var meshIndexBuffer = this.generateIBO(mesh.modelData.i);
        var obj = {"vertexBufferList":meshVboList, "indexBuffer":meshIndexBuffer,"mesh":mesh};
        this.meshList.push(obj)
    },

    render: function () {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.camera.render()
        for (var i = 0, l = this.meshList.length; i < l; i++) {
            this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation, this.attStride, this.meshList[i].indexBuffer);
            this.meshList[i].mesh.render();
            this.mat.multiply(this.camera.vpMatrix, this.meshList[i].mesh.mMatrix, this.mvpMatrix);

            this.gl.uniformMatrix4fv(this.uniLocation.mMatrix, false, this.meshList[i].mesh.mMatrix);
            this.gl.uniformMatrix4fv(this.uniLocation.mvpMatrix, false, this.mvpMatrix);
            this.gl.uniformMatrix4fv(this.uniLocation.invMatrix, false, this.meshList[i].mesh.invMatrix);
            //
            //// インデックスバッファによる描画
            this.gl.drawElements(this.gl.TRIANGLES, this.meshList[i].mesh.modelData.i.length, this.gl.UNSIGNED_SHORT, 0);
        }
        this.gl.flush();
        requestAnimationFrame(this.render.bind(this))
    },

    initWebgl: function () {
        //基本背景色の定義
        this.gl.clearColor(0.01, 0.01, 0.02, 1.0);
        //深度テストの定義
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //シェーダーの生成
        var vertexShaderSource = document.getElementById("vs").textContent;
        var fragmentShaderSource = document.getElementById("fs").textContent;
        //プログラムの生成
        this.programs = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);

        //固定となるuniformの生成
        this.uniLocation = {};
        this.uniLocation.mvpMatrix = this.gl.getUniformLocation(this.programs, "mvpMatrix");
        this.uniLocation.invMatrix = this.gl.getUniformLocation(this.programs, "invMatrix");
        this.uniLocation.lightDirection = this.gl.getUniformLocation(this.programs, "lightDirection");
        this.uniLocation.eyePosition = this.gl.getUniformLocation(this.programs, "eyePosition");
        this.uniLocation.centerPosition = this.gl.getUniformLocation(this.programs, "centerPosition");
        this.uniLocation.ambientColor = this.gl.getUniformLocation(this.programs, "ambientColor");
        this.uniLocation.texture = this.gl.getUniformLocation(this.programs, "texture");

        // attributeLocationを取得して配列に格納する
        this.attLocation = [];
        this. attLocation[0] = this.gl.getAttribLocation(this.programs, 'position');
        this.attLocation[1] = this.gl.getAttribLocation(this.programs, 'normal');
        this.attLocation[2] = this.gl.getAttribLocation(this.programs, 'texCoord');

        // attributeのストライドを配列に格納しておく
        this.attStride = [];
        this.attStride[0] = 3;
        this.attStride[1] = 3;
        this.attStride[2] = 2;

        this.gl.uniform3fv(this.uniLocation.lightPosition, this.light.lightPosition);
        this.gl.uniform3fv(this.uniLocation.eyePosition, this.camera.cameraPosition);
        this.gl.uniform3fv(this.uniLocation.centerPoint, this.camera.centerPoint);
        this.gl.uniform3fv(this.uniLocation.ambientColor, this.light.ambientColor);
        this.gl.uniform1i(this.uniLocation.texture, 0);
    },
    createShaderProgram: function (vertexShaderSource, fragmentShaderSource) {
        //shaderオブジェクトを生成
        var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        //shaderオブジェクトにソースを割り当てて、コンパイル
        this.gl.shaderSource(vertexShader, vertexShaderSource);
        this.gl.compileShader(vertexShader);
        this.checkShaderCompile(vertexShader)
        this.gl.shaderSource(fragmentShader, fragmentShaderSource);
        this.gl.compileShader(fragmentShader);
        this.checkShaderCompile(fragmentShader)

        //programを生成し、shaderとの紐づけ
        var programs = this.gl.createProgram();
        this.gl.attachShader(programs, vertexShader);
        this.gl.attachShader(programs, fragmentShader);
        this.gl.linkProgram(programs);
        this.checkLinkPrograms(programs)

        return programs;
    },
    generateTexture: function (imageArray) {
        var length = imageArray.length;
        this.texureArray = []
        for (var i = 0; i < length; i++) {
            this.texureArray[i] = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texureArray[i]);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageArray[i]);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    },

    generateVBO: function (data) {
        var vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vertexBuffer;
    },

    generateIBO: function (data) {
        var indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        return indexBuffer;
    },

    setAttribute: function (vbo, attL, attS, ibo) {
        for (var i in vbo) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
            this.gl.enableVertexAttribArray(attL[i]);
            this.gl.vertexAttribPointer(attL[i], attS[i], this.gl.FLOAT, false, 0, 0);
        }
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    },

    checkShaderCompile: function (shader) {
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader))
        }
    },

    checkLinkPrograms: function (program) {
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.log(this.gl.getProgramInfoLog(program))
        } else {
            this.gl.useProgram(program);
        }
    }

};


var World = function (canvasId) {
    this.init(canvasId);
    this.camera = new Camera(this.canvas);
    this.light = new DirectionLight();
    this.scene3D = new Scene3D(this.gl, this.camera,this.light);

    for(var i = 0; i < 300; i++){
        var funnel = new Funnel(this.gl,ImageLoader.images[0]);
        this.scene3D.addChild(funnel)
    }
    var cokpit = new Cokpit(this.gl,ImageLoader.images[1]);
    this.scene3D.addChild(cokpit)


}
World.prototype = {

    init: function (canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.setCanvasSize();
        this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
        if (!this.gl) {
            alert("no support webgl");
            return null
        }
    },
    setCanvasSize: function () {
        this.canvas.width = this.canvasWidth = document.documentElement.clientWidth;
        this.canvas.height = this.canvasHeight = document.documentElement.clientHeight;
        //this.canvas.width = this.canvasWidth = 500;
        //this.canvas.height = this.canvasHeight = 500;
    }
}


window.onload = function () {

    var loadCompleteHandler = function () {
        console.log("loaded", ImageLoader.images);
        new World("canvas")
    }

    var pashArray = ["images/texturefunnel.png","images/texturesazabycokpit.jpg"];
    ImageLoader.load(pashArray, loadCompleteHandler);

}


ImageLoader = {
    length: 0,
    images: [],
    load: function (pathArray, callback) {
        this.length = pathArray.length;
        for (var i = 0; i < this.length; i++) {
            var img = new Image();
            var counter = 0;
            img.onload = function () {
                counter++;
                ImageLoader.images.push(this)
                if (counter >= ImageLoader.length) {
                    callback()
                }
            };
            img.src = pathArray[i];

        }
    }
}


