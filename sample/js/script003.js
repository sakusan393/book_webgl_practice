// sample_002
//
// WebGLでポリゴンを描画する

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
	var vertex_position2 = [
		0.0, -0.5, 0.0,
		0.5, 0.5, 0.0,
		-0.5, 0.5, 0.0
	];

	// 頂点情報のBufferObjectの生成
	var vbo = create_vbo(vertex_position);
	// 頂点情報のBufferObjectの生成2
	var vbo2 = create_vbo(vertex_position2);

	var attLocation = gl.getAttribLocation(prg, 'position');
	var attStride = 3;
	var uniLocation = gl.getUniformLocation(prg, "color");

    gl.useProgram(prg);
    //↓高負荷らしい
    gl.enableVertexAttribArray(attLocation);

	render();

	function updatePosition(array,offset){
		if(offset == undefined) offset = 0;
		var newArray = [];
		for(var i= 0, l=array.length; i < l; i++){
			newArray[i] = array[i] + Math.sin(new Date().getTime()/1000 + offset) * 0.3;
		}
		return newArray;
	}

	function render(){
		gl.clear(gl.COLOR_BUFFER_BIT);

		update_vbo(updatePosition(vertex_position,0),vbo);
		update_vbo(updatePosition(vertex_position2,3.14/2),vbo2);


		//一個目のメッシュ的なもの
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

		gl.uniform1f(uniLocation, 0.5);
		gl.drawArrays(gl.TRIANGLES, 0, 3);

		gl.uniform1f(uniLocation, 0.1);
		gl.drawArrays(gl.LINE_LOOP, 0, 3);

		gl.uniform1f(uniLocation, 0.3);
		gl.drawArrays(gl.POINTS, 0, 3);

		//二個目のメッシュ的なもの
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo2);
		gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

		gl.uniform1f(uniLocation, 1.0);
		gl.drawArrays(gl.TRIANGLES, 0, 3);

		gl.uniform1f(uniLocation, 0.8);
		gl.drawArrays(gl.LINE_LOOP, 0, 3);

		gl.uniform1f(uniLocation, 0.6);
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

	function update_vbo(data,vbo){
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
};