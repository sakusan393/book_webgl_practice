onload = function(){
	// canvasエレメントを取得
	var c = document.getElementById('canvas');
	c.width = c.height = 300;

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	var prg = create_program(v_shader, f_shader);

	var vertex_position = [
        0.0, 0.5, 0.0,
		0.5, -0.5, 0.0,
		-0.5, -0.5, 0.0
	];

	// 頂点情報のBufferObjectの生成
	var vbo = create_vbo(vertex_position);

	var attLocation = gl.getAttribLocation(prg, 'position');
	var attStride = 3;
	var uniLocation = gl.getUniformLocation(prg, "mvpMatrix");

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

	gl.useProgram(prg);
    //↓高負荷らしい
    gl.enableVertexAttribArray(attLocation);

    //一個目のメッシュ的なもの
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

	render();

	function render(){
		gl.clear(gl.COLOR_BUFFER_BIT);

        mat4.identity(mMatrix);
        var radians = (new Date().getTime() / 5 % 360) * Math.PI / 180;
        var axis = [1.0,1.0, 1.0];
        mat4.rotate(mMatrix, mMatrix, radians, axis);
        mat4.multiply(mvpMatrix , vpMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		gl.drawArrays(gl.LINE_LOOP, 0, 3);

		gl.drawArrays(gl.POINTS, 0, 3);

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