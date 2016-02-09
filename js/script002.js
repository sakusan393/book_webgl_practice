// sample_002
//
// WebGLでポリゴンを描画する

onload = function(){
	// canvasエレメントを取得
	var c = document.getElementById('canvas');
	c.width = c.height = 300;

	// webglコンテキストを取得
	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	// プログラムオブジェクトの生成とリンク
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	var prg = create_program(v_shader, f_shader);

	// canvasを初期化する色を設定して、初期化
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// モデル(頂点)データ
	var vertex_position = [
		 0.0, 0.9, 0.0,//
		 0.3, -0.1, -0.0,//
		-0.9, -0.9, 0.0//
	];

	// 頂点情報のBOの生成
	var vbo = create_vbo(vertex_position);
	// attributeLocationの取得
	var attLocation = gl.getAttribLocation(prg, 'position');
	var attStride = 3;
    // uniformLocationの取得
    var uniLocation = gl.getUniformLocation(prg, "color");

    render();

    function render(){
        // VBO(頂点情報)をバインド

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.enableVertexAttribArray(attLocation);
        gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uniLocation, 1.0);
        gl.drawArrays(gl.POINTS, 0, 3);
        gl.uniform1f(uniLocation, 0.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.uniform1f(uniLocation, 0.5);
        gl.drawArrays(gl.LINE_LOOP, 0, 3);

        // コンテキストの再描画
        gl.flush();
    }



	// シェーダを生成する関数
	function create_shader(id){
		// シェーダを格納する変数
		var shader;

		// HTMLからscriptタグへの参照を取得
		var scriptElement = document.getElementById(id);

		// scriptタグが存在しない場合は抜ける
		if(!scriptElement){return;}

		// scriptタグのtype属性をチェック
		switch(scriptElement.type){

			// 頂点シェーダの場合
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;

			// フラグメントシェーダの場合
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}

		// 生成されたシェーダにソースを割り当てる
		gl.shaderSource(shader, scriptElement.text);

		// シェーダをコンパイルする
		gl.compileShader(shader);

		// シェーダが正しくコンパイルされたかチェック
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){

			// 成功していたらシェーダを返して終了
			return shader;
		}else{

			// 失敗していたらエラーログをアラートする
			alert(gl.getShaderInfoLog(shader));
		}
	}

	// プログラムオブジェクトを生成しシェーダをリンクする関数
	function create_program(vs, fs){
		// プログラムオブジェクトの生成
		var program = gl.createProgram();

		// プログラムオブジェクトにシェーダを割り当てる
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);

		// シェーダをリンク
		gl.linkProgram(program);

		// シェーダのリンクが正しく行なわれたかチェック
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){

			// 成功していたらプログラムオブジェクトを有効にする
			gl.useProgram(program);

			// プログラムオブジェクトを返して終了
			return program;
		}else{

			// 失敗していたらエラーログをアラートする
			alert(gl.getProgramInfoLog(program));
		}
	}

	// VBOを生成する関数
	function create_vbo(data){
		// バッファオブジェクトの生成
		var vbo = gl.createBuffer();

		// バッファをバインドする
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

		// バッファにデータをセット
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

		// バッファのバインドを無効化
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// 生成した VBO を返して終了
		return vbo;
	}

};