var Camera = function (canvas) {
    // ビュー座標変換行列
    this.lookPoint = [0.0, 0.0, 0.0];    // 注視点
    this.x = 0;
    this.y = 0;
    this.z = 20;
    this.cameraPosition = [this.x, this.y, this.z]; // カメラの位置
    this.cameraUp = [0.0, 1.0, 0.0];       // カメラの上方向
    this.vMatrix = mat4.identity(mat4.create());
    this.pMatrix = mat4.identity(mat4.create());
    this.vpMatrix = mat4.identity(mat4.create());
    mat4.lookAt(this.vMatrix,this.cameraPosition, this.lookPoint, this.cameraUp);

    // プロジェクションのための情報を揃える
    this.fov = 45 * Math.PI / 180                           // 視野角
    this.aspect = canvas.width / canvas.height; // アスペクト比
    this.near = 0.1;                            // 空間の最前面
    this.far = 200.0;                            // 空間の奥行き終端
    mat4.perspective(this.pMatrix,this.fov, this.aspect, this.near, this.far);
    mat4.multiply(this.vpMatrix,this.pMatrix, this.vMatrix);
    this.count = 0;
    this.parent = null
}
Camera.prototype = {
    setTarget: function (cameraTarget) {
        this.parent = cameraTarget
    },
    render: function () {

        if (this.parent) {
            this.lookPoint = [this.parent.x, this.parent.y, this.parent.z]
        }
        this.cameraPosition = [this.x, this.y, this.z]

        mat4.lookAt(this.vMatrix, this.cameraPosition, this.lookPoint, this.cameraUp);
        mat4.perspective(this.pMatrix , this.fov, this.aspect, this.near, this.far);
        mat4.multiply(this.vpMatrix , this.pMatrix, this.vMatrix);
    }
}
var DirectionLight = function () {
    // ビュー座標変換行列
    this.lightDirection = [0.0, 50.0, -100.0];
    this.ambientColor = [0.0, 0.0, 0.1];
}
DirectionLight.prototype = {}

Beam = function(gl,scene3D,funnel,cockpit){
    this.gl = gl;
    this.scene3D = scene3D;
    this.parent = funnel;
    this.target = cockpit;
    this.modelData = window.beam(2,[1,1,0,0.5])
    this.qtn = quat.identity(quat.create());
    this.mMatrix = mat4.identity(mat4.create());
    this.qMatrix = mat4.identity(mat4.create());
    this.invMatrix = mat4.identity(mat4.create());
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.scaleX = .15;
    this.scaleY = .03;
    this.scaleZ = 3;
    this.life = 50;
    this.startAlpha = 0.4;
    this.currentLife = this.life;
    this.speed = 1;
    this.index = 0;
    this.isLightEnable = false;

    this.defaultPosture = [0,0,1];
}

Beam.prototype = {
    init:function(){
        this.x = this.parent.x;
        this.y = this.parent.y;
        this.z = this.parent.z;
        this.alpha = this.startAlpha;
        this.currentLife = this.life;
        //クォータニオンによる姿勢制御
        this.lookVector = vec3.subtract([],[ this.target.x, this.target.y, this.target.z],[this.x, this.y, this.z])
        //回転軸(外積)
        var rotationAxis = vec3.cross([],this.lookVector, this.defaultPosture);
        vec3.normalize(rotationAxis,rotationAxis);

        this.angleArray = [this.x, this.y, this.z];
        //なす角(radian)
        var qAngle = Math.acos(vec3.dot(this.lookVector,this.defaultPosture) / vec3.length(this.lookVector) * vec3.length(this.defaultPosture))
        quat.setAxisAngle(this.qtn ,rotationAxis, -qAngle);
        mat4.identity(this.qMatrix);
        mat4.fromQuat(this.qMatrix,this.qtn);
    },
    render:function(){
        var percent = (this.currentLife / this.life > this.startAlpha)? this.startAlpha: this.currentLife / this.life;
        this.alpha = percent;
        vec3.normalize(this.lookVector,this.lookVector)
        this.x+=this.lookVector[0]*this.speed;
        this.y+=this.lookVector[1]*this.speed;
        this.z+=this.lookVector[2]*this.speed;
        var translatePosition = [this.x, this.y, this.z];
        mat4.identity(this.mMatrix);
        mat4.translate(this.mMatrix, this.mMatrix, translatePosition);
        mat4.multiply(this.mMatrix, this.mMatrix, this.qMatrix);

        var scale = [this.scaleX, this.scaleY , this.scaleZ]
        mat4.scale(this.mMatrix, this.mMatrix, scale);

        this.currentLife--;
        if(this.currentLife < 0){
            requestAnimationFrame(this.dispose.bind(this))
        }
    },
    dispose:function(){
        this.scene3D.removeChild(this)
    }
}

Funnel = function (gl,scene3D, lookTarget,img) {
    this.gl = gl;
    this.scene3D = scene3D;
    this.parent = lookTarget
    this.modelData = window.funnel();
    this.mMatrix = mat4.identity(mat4.create());
    this.invMatrix = mat4.identity(mat4.create());

    this.qtn = quat.identity(quat.create());
    this.qMatrix = mat4.identity(mat4.create());

    this.x = (Math.random() - 0.5) * 30
    this.y = (Math.random() - 0.5) * 30
    this.z = (Math.random() - 0.5) * 30
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.count = 0;
    this.rnd = Math.random() * 5 + 8;
    this.rnd1 = Math.random() * 5 + 8;
    this.rnd2 = Math.random() * 5 + 8;
    this.speed = Math.random() * 2;

    this.defaultPosture = [0,0,1];

    this.speedRatio = {}, this.ratio = {};
    this.speedRatio.x = Math.random() * 30 + 50;
    this.speedRatio.y = Math.random() * 30 + 50;
    this.speedRatio.z = Math.random() * 30 + 50;
    this.ratio.x = 0.002 + Math.random() * 0.005;
    this.ratio.y = 0.002 + Math.random() * 0.005;
    this.ratio.z = 0.002 + Math.random() * 0.005;

    this.beamLength = 20;
    this.beamArray = [];
    this.curentBeamIndex = 0;
    this.currentBeam = null;
    this.isLightEnable = true;

    for(var i = 0; i < this.beamLength; i++){
        this.beamArray[i] = new Beam(this.gl,this.scene3D,this,this.parent);
    }

    if (img) {
        this.initTexture(img);
    }
}

Funnel.prototype = {
    initTexture: function (img) {
        // テクスチャオブジェクトの生成
        this.useTexture = true;
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    },
    setTarget: function (cameraTarget) {
        this.parent = cameraTarget
    },
    shoot: function(){
        this.curentBeamIndex++;
        if(this.curentBeamIndex >= this.beamLength) {
            this.curentBeamIndex = 0;
        }
        this.currentBeam = this.beamArray[this.curentBeamIndex];
        this.currentBeam.init();
        this.scene3D.addChild(this.beamArray[this.curentBeamIndex])
    },
    render: function () {
        this.count += this.speed

        var translatePosition = [this.x, this.y, this.z];
        mat4.identity(this.mMatrix);
        mat4.translate(this.mMatrix, this.mMatrix, translatePosition);
        var targetPosition = {x: 0, y: 0, z: 0};
        if (this.parent) {
            targetPosition.x = this.parent.x;
            targetPosition.y = this.parent.y;
            targetPosition.z = this.parent.z;
        }

        //オイラー角による向き制御
        //var subtractPosition = {
        //    x: targetPosition.x - this.x,
        //    y: targetPosition.y - this.y,
        //    z: targetPosition.z - this.z
        //}
        //var sin = subtractPosition.y / Math.sqrt(subtractPosition.x * subtractPosition.x + subtractPosition.y * subtractPosition.y + subtractPosition.z * subtractPosition.z)
        //var radX = Math.asin(-sin)
        //var radY = Math.atan2(subtractPosition.x, subtractPosition.z);
        //var radZ = Math.PI / 180 * this.rotationZ;
        //var axisX = [1.0, 0.0, 0.0];
        //var axisY = [0.0, 1.0, 0.0];
        //var axisZ = [0.0, 0.0, 1.0];
        //mat4.rotate(this.mMatrix, this.mMatrix, radY, axisY);
        //mat4.rotate(this.mMatrix, this.mMatrix, radX, axisX);
        //mat4.rotate(this.mMatrix, this.mMatrix, radZ, axisZ);


        //クォータニオンによる姿勢制御
        var lookVector = vec3.subtract([],[targetPosition.x,targetPosition.y,targetPosition.z],[this.x, this.y, this.z])
        //回転軸(外積)
        var rotationAxis = vec3.cross([],lookVector, this.defaultPosture);
        vec3.normalize(rotationAxis,rotationAxis);

        //なす角(radian)
        var qAngle = Math.acos(vec3.dot(lookVector,this.defaultPosture) / vec3.length(lookVector) * vec3.length(this.defaultPosture))
        quat.setAxisAngle(this.qtn  ,rotationAxis,-qAngle);
        mat4.identity(this.qMatrix);
        mat4.fromQuat(this.qMatrix , this.qtn);
        mat4.multiply(this.mMatrix, this.mMatrix, this.qMatrix);

        mat4.invert(this.invMatrix , this.mMatrix);
    }

}
Cokpit = function (gl, img) {
    this.gl = gl;
    this.modelData = window.sphere(10, 10, .3);
    this.mMatrix = mat4.identity(mat4.create());
    this.invMatrix = mat4.identity(mat4.create());
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.count = 0;
    this.gainRatio = 100;
    this.rnd = Math.random() * 10 + 30;
    this.rnd1 = Math.random() * 10 + 30;
    this.rnd2 = Math.random() * 10 + 30;
    this.rnd3 = Math.random() * 10 + 30;
    this.speed = .06
    this.isLightEnable = true;

    if (img) {
        this.initTexture(img);
    }
}
Cokpit.prototype = {
    initTexture: function (img) {
        this.useTexture = true;
        // テクスチャオブジェクトの生成
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    },
    render: function () {
        var translatePosition = [this.x, this.y, this.z];
        mat4.identity(this.mMatrix);
        mat4.translate(this.mMatrix, this.mMatrix,translatePosition);
        //var radians = (0 % 360) * Math.PI / 180;
        //var axis = [1.0, 0.0, 0.0];
        //mat4.rotate(this.mMatrix, radians, axis, this.mMatrix);
        mat4.invert(this.invMatrix , this.mMatrix);
    }
}

Stars = function (gl,img) {
    this.gl = gl;
    this.modelData = window.star();
    this.mMatrix = mat4.identity(mat4.create());
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.count = 0;
    this.isPoint = true;
    this.isLightEnable = false;
    if (img) {
        this.initTexture(img);
    }

}



Stars.prototype = {
    render: function () {

    },
    initTexture: function (img) {
        // テクスチャオブジェクトの生成
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}

SkySphere = function (gl,img) {
    this.gl = gl;
    this.modelData = window.sphere(20, 20, 100);
    this.mMatrix = mat4.identity(mat4.create());
    this.invMatrix = mat4.identity(mat4.create());
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.count = 0;
    this.isLightEnable = false;

    if (img) {
        this.initTexture(img);
    }
}
SkySphere.prototype = {
    render: function () {
        mat4.identity(this.mMatrix);
        var radians = -90 * Math.PI / 180;
        var axis = [0.0, 1.0, 0.0];
        mat4.rotate(this.mMatrix, this.mMatrix, radians, axis);
    },
    initTexture: function (img) {
        // テクスチャオブジェクトの生成
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}
Scene3D = function (gl, camera, light) {
    this.gl = gl
    this.camera = camera;
    this.light = light;
    this.meshList = [];
    this.mvpMatrix = mat4.identity(mat4.create());
    this.count = 0;
    this.initWebgl();
    this.render()
}
Scene3D.prototype = {

    addChild: function (mesh) {
        var vPositionBuffer, vNormalBuffer, vTexCoordBuffer,vColorBuffer,meshIndexBuffer;
        var meshVboList = [];
        if (mesh.modelData.p){
            vPositionBuffer = this.generateVBO(mesh.modelData.p);
            meshVboList[0] = (vPositionBuffer)
        }
        if (mesh.modelData.n){
            vNormalBuffer = this.generateVBO(mesh.modelData.n);
            meshVboList[1] = (vNormalBuffer)
        }
        if (mesh.modelData.t){
            vTexCoordBuffer = this.generateVBO(mesh.modelData.t);
            meshVboList[2] = (vTexCoordBuffer)
        }
        if (mesh.modelData.c){
            vColorBuffer = this.generateVBO(mesh.modelData.c);
            meshVboList[3] = (vColorBuffer)
        }
        if (mesh.modelData.i) meshIndexBuffer = this.generateIBO(mesh.modelData.i);
        var obj = {"vertexBufferList": meshVboList, "indexBuffer": meshIndexBuffer, "mesh": mesh};
        mesh.index = this.meshList.length;
        this.meshList.push(obj)
    },
    removeChild: function (mesh) {
        var length = this.meshList.length;
        for(var i=0; i<length; i++){
            if(this.meshList[i] && this.meshList[i].mesh){
                if(this.meshList[i].mesh.index == mesh.index) {
                    this.meshList[i].vertexBufferList = null;
                    this.meshList[i].indexBuffer = null;
                    this.meshList[i].mesh = null;
                    this.meshList.splice(i, 1);
                    return
                }
            }
        }
    },

    render: function () {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //カメラに座標変換行列の更新
        this.camera.render();
        this.gl.uniform3fv(this.uniLocation.eyePosition, this.camera.cameraPosition);

        //各3Dオブジェクトの描画処理
        for (var i = 0, l = this.meshList.length; i < l; i++) {

            if (!this.meshList[i].mesh.isPoint) {
                this.gl.useProgram(this.programs);
                this.gl.uniform1f(this.uniLocation.alpha, this.meshList[i].mesh.alpha);
                this.gl.uniform1i(this.uniLocation.isLightEnable, this.meshList[i].mesh.isLightEnable);
                //裏面をカリング(描画しない)
                //this.gl.enable(this.gl.CULL_FACE);
                //this.gl.cullFace(this.gl.BACK);

                this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation, this.attStride, this.meshList[i].indexBuffer);
                this.meshList[i].mesh.render();
                mat4.multiply(this.mvpMatrix , this.camera.vpMatrix, this.meshList[i].mesh.mMatrix);

                this.gl.uniformMatrix4fv(this.uniLocation.mvpMatrix, false, this.mvpMatrix);
                if(this.meshList[i].mesh.isLightEnable){
                    this.gl.uniform3fv(this.uniLocation.lookPoint, this.camera.lookPoint);
                    this.gl.uniformMatrix4fv(this.uniLocation.invMatrix, false, this.meshList[i].mesh.invMatrix);
                    //this.gl.uniform3fv(this.uniLocation.lightDirection, this.light.lightDirection);
                }
                //明示的に0番目を指定
                //this.gl.uniform1i(this.uniLocation.texture, 0);
                if(this.meshList[i].mesh.texture) this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshList[i].mesh.texture);
                this.gl.drawElements(this.gl.TRIANGLES, this.meshList[i].mesh.modelData.i.length, this.gl.UNSIGNED_SHORT, 0);

                this.gl.disable(this.gl.CULL_FACE);
            } else {
                this.gl.useProgram(this.programs_points);
                this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation_points, this.attStride, null);
                this.meshList[i].mesh.render();
                mat4.multiply(this.mvpMatrix , this.camera.vpMatrix, this.meshList[i].mesh.mMatrix);

                this.gl.uniformMatrix4fv(this.uniLocation_points.mvpMatrix, false, this.mvpMatrix);
                //明示的に0番目を指定
                //this.gl.uniform1i(this.uniLocation_points.texture, 0);
                if(this.meshList[i].mesh.texture) this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshList[i].mesh.texture);
                this.gl.drawArrays(this.gl.POINTS, 0, this.meshList[i].mesh.modelData.p.length / 3);
            }
        }
        this.gl.flush();
    },

    initWebgl: function () {
        //基本背景色の定義
        this.gl.clearColor(0.01, 0.01, 0.02, 1.0);
        //深度テストの定義
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        //アルファブレンディングの有効化
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE);

        //色と深度の初期化
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //シェーダーの生成
        var vertexShaderSource = document.getElementById("vs").textContent;
        var fragmentShaderSource = document.getElementById("fs").textContent;
        var vertexShaderPointsSource = document.getElementById("vs_points").textContent;
        var fragmentShaderPointsSource = document.getElementById("fs_points").textContent;
        //プログラムの生成
        this.programs_points = this.createShaderProgram(vertexShaderPointsSource, fragmentShaderPointsSource);
        this.programs = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);

        //uniformのindexの取得
        this.uniLocation = {};
        this.uniLocation.texture = this.gl.getUniformLocation(this.programs, "texture");
        this.uniLocation.mvpMatrix = this.gl.getUniformLocation(this.programs, "mvpMatrix");
        this.uniLocation.invMatrix = this.gl.getUniformLocation(this.programs, "invMatrix");
        this.uniLocation.lightDirection = this.gl.getUniformLocation(this.programs, "lightDirection");
        this.uniLocation.eyePosition = this.gl.getUniformLocation(this.programs, "eyePosition");
        this.uniLocation.lookPoint = this.gl.getUniformLocation(this.programs, "lookPoint");
        this.uniLocation.ambientColor = this.gl.getUniformLocation(this.programs, "ambientColor");
        this.uniLocation.alpha = this.gl.getUniformLocation(this.programs, "alpha");
        this.uniLocation.isLightEnable = this.gl.getUniformLocation(this.programs, "isLightEnable");

        this.uniLocation_points = {};
        this.uniLocation_points.texture = this.gl.getUniformLocation(this.programs_points, "texture");
        this.uniLocation_points.mvpMatrix = this.gl.getUniformLocation(this.programs_points, "mvpMatrix");

        // attributeLocationを取得して配列に格納する
        this.attLocation = [];
        this.attLocation[0] = this.gl.getAttribLocation(this.programs, 'position');
        this.attLocation[1] = this.gl.getAttribLocation(this.programs, 'normal');
        this.attLocation[2] = this.gl.getAttribLocation(this.programs, 'texCoord');
        this.attLocation[3] = this.gl.getAttribLocation(this.programs, 'color');

        this.attLocation_points = [];
        this.attLocation_points[0] = this.gl.getAttribLocation(this.programs_points, 'position');

        // attributeのストライドを配列に格納しておく
        this.attStride = [];
        this.attStride[0] = 3;
        this.attStride[1] = 3;
        this.attStride[2] = 2;
        this.attStride[3] = 4;

        //モデルに左右しない固定情報を先に転送する
        this.gl.useProgram(this.programs);
        this.gl.uniform3fv(this.uniLocation.lightDirection, this.light.lightDirection);
        this.gl.uniform3fv(this.uniLocation.ambientColor, this.light.ambientColor);
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
        var l = attL.length
        for (var j = 0; j < l; j++) {
            this.gl.disableVertexAttribArray(attL[j]);
        }
        for (var i in vbo) {
            if (vbo[i]) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
                this.gl.enableVertexAttribArray(attL[i]);
                this.gl.vertexAttribPointer(attL[i], attS[i], this.gl.FLOAT, false, 0, 0);
            }
        }
        if (ibo) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
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
            //this.gl.useProgram(program);
        }
    }
};


var World = function (canvasId) {
    this.gl = this.initWebglContext(canvasId);
    this.init();
}

World.prototype = {
    initWebglContext: function (canvasId) {

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "canvasId");
        document.body.appendChild(this.canvas);
        this.setCanvasSize();

        this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
        if (!this.gl) {
            alert("no support webgl");
            return null
        }
        return this.gl
    },
    setCanvasSize: function () {
        this.canvas.width = document.documentElement.clientWidth;
        this.canvas.height = document.documentElement.clientHeight;
    },


    init: function(){

        this.camera = new Camera(this.canvas);
        this.light = new DirectionLight();
        this.scene3D = new Scene3D(this.gl, this.camera, this.light);

        var stars = new Stars(this.gl,ImageLoader.images["texturestar"]);
        this.scene3D.addChild(stars);

        this.cockpit = new Cokpit(this.gl, ImageLoader.images["texturesazabycokpit"]);
        this.scene3D.addChild(this.cockpit);

        this.funnellArray = [];
        this.funnelLength = 30;
        for (var i = 0; i < this.funnelLength; i++) {
            var funnel = new Funnel(this.gl,this.scene3D, this.cockpit,ImageLoader.images["texturefunnel"]);
            this.funnellArray.push(funnel);
            this.scene3D.addChild(funnel)
        }

        var skySphere = new SkySphere(this.gl,ImageLoader.images["space"]);
        this.scene3D.addChild(skySphere);


        this.camera.setTarget(this.cockpit);

        var self = this;
        setInterval( function(){
            for (var i = 0; i < self.funnelLength; i++) {
                self.funnellArray[i].shoot();
            }
        },100);

        this.enterFrameHandler()
    },

    enterFrameHandler: function () {

        this.camera.count += 1;
        this.camera.x = Math.sin((this.camera.count * .003 % 360 )) * 5;
        this.camera.y = Math.cos((this.camera.count * .002 % 360)) * 7;
        this.camera.z = Math.cos((this.camera.count * .003 % 360)) * 13;

        this.cockpit.count += this.cockpit.speed / 3;
        this.cockpit.x = Math.sin((this.cockpit.count + this.cockpit.rnd1) / 3) * this.cockpit.gainRatio * .2 * (Math.sin(this.cockpit.count / 1.5) + 1)
        this.cockpit.y = Math.cos((this.cockpit.count + this.cockpit.rnd) / 3) * this.cockpit.gainRatio * .2 * (Math.sin(this.cockpit.count) + 1.3)
        this.cockpit.z = Math.cos((this.cockpit.count + this.cockpit.rnd2) / 7) * this.cockpit.gainRatio * .1 * (Math.sin(this.cockpit.count) + 1)

        for (var i = 0; i < this.funnelLength; i++) {
            this.funnellArray[i].count += this.funnellArray[i].speed;
            this.funnellArray[i].rotationZ = Math.sin(this.funnellArray[i].count/ this.funnellArray[i].speedRatio.y) * this.funnellArray[i].speedRatio.z
            this.funnellArray[i].x += (this.cockpit.x - this.funnellArray[i].x) * (Math.sin(this.funnellArray[i].count / this.funnellArray[i].speedRatio.x) + 1) * this.funnellArray[i].ratio.x;
            this.funnellArray[i].y += (this.cockpit.y - this.funnellArray[i].y) * (Math.cos(this.funnellArray[i].count / this.funnellArray[i].speedRatio.y + this.funnellArray[i].speedRatio.y) + 1) * this.funnellArray[i].ratio.y;
            this.funnellArray[i].z += (this.cockpit.z - this.funnellArray[i].z) * (Math.sin(this.funnellArray[i].count / this.funnellArray[i].speedRatio.z + this.funnellArray[i].speedRatio.z) + 1) * this.funnellArray[i].ratio.z;
        }
        this.scene3D.render();
        requestAnimationFrame(this.enterFrameHandler.bind(this))
    }
}


window.onload = function () {

    //テクスチャ読み込み後の処理
    var loadCompleteHandler = function () {

        for (var val in ImageLoader.images) {
            console.log("loaded", ImageLoader.images[val]);
        }
        //ドキュメントクラス的なもの canvasのIDを渡す
        new World()
    }

    //テクスチャ画像リスト
    var texturePashArray = ["images/texturefunnel.png", "images/texturesazabycokpit.jpg","images/texturestar.png","images/space.jpg"];
    //テクスチャ画像をImage要素としての読み込み
    ImageLoader.load(texturePashArray, loadCompleteHandler);
}

ImageLoader = {
    length: 0,
    images: {},
    load: function (pathArray, callback) {
        this.length = pathArray.length;
        for (var i = 0; i < this.length; i++) {
            var img = new Image();
            var counter = 0;
            img.onload = function () {
                counter++;
                id = this.src.split("/")[this.src.split("/").length - 1].split(".")[0]
                ImageLoader.images[id] = this;
                if (counter >= ImageLoader.length) {
                    callback()
                }
            };
            img.src = pathArray[i];

        }
    }
}


