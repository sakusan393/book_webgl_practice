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
        var meshIndexBuffer;
        var meshVboList = [];
        if (mesh.modelData.p) {
            meshVboList[0] = this.generateVBO(mesh.modelData.p);
        }
        if (mesh.modelData.n) {
            meshVboList[1] = this.generateVBO(mesh.modelData.n);
        }
        if (mesh.modelData.t) {
            meshVboList[2] = this.generateVBO(mesh.modelData.t);
        }
        if (mesh.modelData.c) {
            meshVboList[3] = this.generateVBO(mesh.modelData.c);
        }
        if (mesh.modelData.i) {
            meshIndexBuffer = this.generateIBO(mesh.modelData.i);
        }
        var obj = {"vertexBufferList": meshVboList, "indexBuffer": meshIndexBuffer, "mesh": mesh};
        mesh.index = this.meshList.length;
        this.meshList.push(obj)
    },
    removeChild: function (mesh) {
        var length = this.meshList.length;
        for (var i = 0; i < length; i++) {
            if (this.meshList[i] && this.meshList[i].mesh) {
                if (this.meshList[i].mesh.index == mesh.index) {
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

        //各3Dオブジェクトの描画処理
        for (var i = 0, l = this.meshList.length; i < l; i++) {

            if (!this.meshList[i]) return;

            if (this.meshList[i].mesh.isPoint) {
                this.gl.useProgram(this.programs_points);
                this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation_points, this.attStride, null);
                this.meshList[i].mesh.render();
                mat4.multiply(this.mvpMatrix, this.camera.vpMatrix, this.meshList[i].mesh.mMatrix);

                this.gl.uniformMatrix4fv(this.uniLocation_points.mvpMatrix, false, this.mvpMatrix);
                //明示的に0番目を指定
                //this.gl.uniform1i(this.uniLocation_points.texture, 0);
                if (this.meshList[i].mesh.texture) this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshList[i].mesh.texture);
                this.gl.drawArrays(this.gl.POINTS, 0, this.meshList[i].mesh.modelData.p.length / 3);
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            }
            else if (this.meshList[i].mesh.isObjData) {

                this.gl.useProgram(this.programs);
                this.gl.uniform3fv(this.uniLocation.eyePosition, this.camera.cameraPosition);
                this.gl.uniform1i(this.uniLocation.isObjData, this.meshList[i].mesh.isObjData);
                this.gl.uniform1i(this.uniLocation.isLightEnable, this.meshList[i].mesh.isLightEnable);

                this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation, this.attStride);

                this.meshList[i].mesh.render();
                this.gl.uniform1f(this.uniLocation.alpha, this.meshList[i].mesh.alpha);
                mat4.multiply(this.mvpMatrix, this.camera.vpMatrix, this.meshList[i].mesh.mMatrix);


                this.gl.uniformMatrix4fv(this.uniLocation.mvpMatrix, false, this.mvpMatrix);
                if (this.meshList[i].mesh.isLightEnable) {
                    this.gl.uniform3fv(this.uniLocation.lookPoint, this.camera.lookPoint);
                    this.gl.uniformMatrix4fv(this.uniLocation.invMatrix, false, this.meshList[i].mesh.invMatrix);
                }
                //明示的に0番目
                var pos = 0;
                for (var j = 0; j < this.meshList[i].mesh.modelData.mtlInfos.length; j++) {
                    var mtlInfo = this.meshList[i].mesh.modelData.mtlInfos[j];
                    this.gl.uniform3fv(this.uniLocation.kdColor, mtlInfo.kd);
                    this.gl.drawArrays(this.gl.TRIANGLES, pos / 3, (mtlInfo.endPos - pos) / 3);
                    pos = mtlInfo.endPos;
                }
            } else {
                this.gl.useProgram(this.programs);
                this.gl.uniform3fv(this.uniLocation.eyePosition, this.camera.cameraPosition);
                this.gl.uniform1i(this.uniLocation.isObjData, false);
                this.gl.uniform1f(this.uniLocation.alpha, this.meshList[i].mesh.alpha);
                this.gl.uniform1i(this.uniLocation.isLightEnable, this.meshList[i].mesh.isLightEnable);
                //裏面をカリング(描画しない)
                //this.gl.enable(this.gl.CULL_FACE);
                //this.gl.cullFace(this.gl.BACK);

                this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation, this.attStride, this.meshList[i].indexBuffer);
                this.meshList[i].mesh.render();
                mat4.multiply(this.mvpMatrix, this.camera.vpMatrix, this.meshList[i].mesh.mMatrix);

                this.gl.uniformMatrix4fv(this.uniLocation.mvpMatrix, false, this.mvpMatrix);
                if (this.meshList[i].mesh.isLightEnable) {
                    this.gl.uniform3fv(this.uniLocation.lookPoint, this.camera.lookPoint);
                    this.gl.uniformMatrix4fv(this.uniLocation.invMatrix, false, this.meshList[i].mesh.invMatrix);
                    //this.gl.uniform3fv(this.uniLocation.lightDirection, this.light.lightDirection);
                }
                //明示的に0番目を指定
                //this.gl.uniform1i(this.uniLocation.texture, 0);
                if (this.meshList[i].mesh.texture) this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshList[i].mesh.texture);
                this.gl.drawElements(this.gl.TRIANGLES, this.meshList[i].mesh.modelData.i.length, this.gl.UNSIGNED_SHORT, 0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);

                //this.gl.disable(this.gl.CULL_FACE);
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
        this.uniLocation.isObjData = this.gl.getUniformLocation(this.programs, "isObjData");
        this.uniLocation.kdColor = this.gl.getUniformLocation(this.programs, "kdColor");

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
