onload = function(){
	// canvasエレメントを取得
	var c = document.getElementById('canvas');
	c.width = c.height = 300;

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//programオブジェクト(1)
	var v_shader1 = create_shader('vs1');
	var f_shader1 = create_shader('fs1');
	var prg1 = create_program(v_shader1, f_shader1);

    var attLocationPosition1 = gl.getAttribLocation(prg1, 'position');
    var attLocationColor1 = gl.getAttribLocation(prg1, 'color');
	var attStridePosition1 = 3;
	var attStrideColor1 = 4;
	var stride1 = 4 * (attStridePosition1 + attStrideColor1);
	var uniLocation1 = gl.getUniformLocation(prg1, "mvpMatrix");

	//programオブジェクト(2)
	var v_shader2 = create_shader('vs2');
	var f_shader2 = create_shader('fs2');
	var prg2 = create_program(v_shader2, f_shader2);

    var attLocationPosition2 = gl.getAttribLocation(prg2, 'position');
    var attLocationPointSize2 = gl.getAttribLocation(prg2, 'point_size');
	var attStridePosition2 = 3;
	var attStridePointSize2 = 1;
	var uniLocation2 = gl.getUniformLocation(prg2, "mvpMatrix");

	var vertex1  = [
		0.0, 0.5, 0.0,1.0, 0.0, 0.0,1.0,
		0.5, -0.5, 0.0,0.0, 1.0, 0.0,1.0,
		-0.5, -0.5, 0.0,0.0, 0.0, 1.0,1.0
	]
	var vbo = create_vbo(vertex1);

    // 頂点情報のBufferObjectの生成2
	var vertex2 = [
		0.0, -0.5, 0.0,20.0,
		0.5, 0.5, 0.0,50.0,
		-0.5, 0.5, 0.0,10.0
	];
    var vbo2 = create_vbo(vertex2);

    //ビュー座標空間用
    //(カメラの位置・姿勢を示す行列)
    var vMatrix = mat4.identity(mat4.create());
    var cameraPosition = [0,0,2];
    var cameraUp = [0,1,0];
    var lookPosition = [0,0,0];
    mat4.lookAt(vMatrix,cameraPosition,lookPosition, cameraUp);

    //プロジェクション座標空間用
    //(視野角、遠近の有効、表示エリアのアスペクト比の設定して3D空間を2Dに投影)
    var pMatrix = mat4.identity(mat4.create());
    var fov = 45 * Math.PI / 180;
    var aspect = c.width / c.height;
    var near = 0.1;
    var far = 100;
    mat4.perspective(pMatrix,fov, aspect, near, far);

    //ビュープロジェクション行列
    //(基本的に固定値)
    var vpMatrix = mat4.identity(mat4.create());
    mat4.multiply(vpMatrix,pMatrix, vMatrix);

    //ワールド座標空間用
    //(各モデルの位置・姿勢を示す行列)
	var mMatrix = mat4.identity(mat4.create());

    //最終的な変換行列
    var mvpMatrix = mat4.identity(mat4.create());

	//↓高負荷らしい
	gl.enableVertexAttribArray(attLocationPosition1);
	gl.enableVertexAttribArray(attLocationColor1);

	//↓高負荷らしい
	gl.enableVertexAttribArray(attLocationPosition2);
	gl.enableVertexAttribArray(attLocationPointSize2);

	console.log(attLocationPosition1 + " " +  attLocationColor1);
	console.log(attLocationPosition2 + " " + attLocationPointSize2);

	render();

	function render(){
        gl.clear(gl.COLOR_BUFFER_BIT);

        //一個目のメッシュ的なもの
		gl.useProgram(prg1);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		var stride = 4 * (attStridePosition1+attStrideColor1);
		gl.vertexAttribPointer(attLocationPosition1, attStridePosition1, gl.FLOAT, false, stride, 0);
		gl.vertexAttribPointer(attLocationColor1, attStrideColor1, gl.FLOAT, false, stride, 4*attStridePosition1);

        mat4.identity(mMatrix);
        var radians = (new Date().getTime() / 8 % 360) * Math.PI / 180;
        var axis = [1.0,1.0, 1.0];
        mat4.rotate(mMatrix, mMatrix, radians, axis);
        mat4.multiply(mvpMatrix , vpMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocation1, false, mvpMatrix);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.drawArrays(gl.LINE_LOOP, 0, 3);
		gl.drawArrays(gl.POINTS, 0, 3);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);


        //二個目のメッシュ的なもの
		gl.useProgram(prg2);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo2);
		var stride2 = 4 * (attStridePosition2 + attStridePointSize2); //4: gl.FLOATなので4バイト
		gl.vertexAttribPointer(attLocationPosition2, attStridePosition2, gl.FLOAT, false, stride2, 0);
		gl.vertexAttribPointer(attLocationPointSize2, attStridePointSize2, gl.FLOAT, false, stride2, 4*attStridePosition1);

        mat4.identity(mMatrix);
        var radians = (new Date().getTime() / 12 % 360) * Math.PI / 180;
        var axis = [1.0,1.0, 1.0];
        mat4.rotate(mMatrix, mMatrix, radians, axis);
        mat4.multiply(mvpMatrix , vpMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocation2, false, mvpMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.drawArrays(gl.LINE_LOOP, 0, 3);
        gl.drawArrays(gl.POINTS, 0, 3);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.flush();

		requestAnimationFrame(render)
	}

	// シェーダを生成する関数
	function create_shader(id){
		var shader;
		var scriptElement = document.getElementById(id);
		if(!scriptElement){return;}
		switch(scriptElement.type){
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}
		gl.shaderSource(shader, scriptElement.text);
		gl.compileShader(shader);
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			return shader;
		}else{
			alert(gl.getShaderInfoLog(shader));
		}
	}

	function create_program(vs, fs){
		var program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){
			return program;
		}else{
			alert(gl.getProgramInfoLog(program));
		}
	}

	// VBOを生成する関数
	function create_vbo(data){
		var vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		return vbo;
	}
};