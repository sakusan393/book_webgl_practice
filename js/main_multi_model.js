// カゴの位置を管理するための変数
var basketOffset = 0;

window.onload = function(){
	// キーイベントを登録
	window.addEventListener('keydown', keyDownEvent, true);

	// 取得したデータ格納用の配列
	var json = new Array(2);

	// XMLHttpRequestを利用してOBJ形式のファイルを取得
	var x = new XMLHttpRequest();
	x.open('GET', 'apple.obj');
	x.onreadystatechange = function(){
		if(x.readyState == 4){
			// OBJ形式ファイルを変換する
			var obj = objsonConvert(x.responseText);

			// 変換したJSON文字列をパースする
			json[0] = JSON.parse(obj);

			// 配列の長さを判断基準に処理する
			if(json[1] != null){
				// WebGL関連処理を呼び出す
				initialize(json);
			}
		}
	}
	x.send();

	// XMLHttpRequestを利用してOBJ形式のファイルを取得
	var y = new XMLHttpRequest();
	y.open('GET', 'basket.obj');
	y.onreadystatechange = function(){
		if(y.readyState == 4){
			// OBJ形式ファイルを変換する
			var obj = objsonConvert(y.responseText);

			// 変換したJSON文字列をパースする
			json[1] = JSON.parse(obj);

			// 配列の長さを判断基準に処理する
			if(json[0] != null){
				// WebGL関連処理を呼び出す
				initialize(json);
			}
		}
	}
	y.send();
};

function initialize(json){
	// HTML上のCanvasへの参照を取得する
	var c = document.getElementById('canvas');

	// Canvasサイズを変更
	c.width = 512;
	c.height = 512;

	// CanvasエレメントからWebGLコンテキストを取得する
	var gl = c.getContext('webgl');

	// WebGLコンテキストが取得できたかどうか調べる
	if(!gl){
		alert('webgl not supported!');
		return;
	}

	// Canvasエレメントをクリアする色を指定する
	gl.clearColor(0.3, 0.3, 0.3, 1.0);

	// クリアする際の深度値を指定する
	gl.clearDepth(1.0);

	// シェーダとプログラムオブジェクト
	var vertexSource = document.getElementById('vs').textContent;
	var fragmentSource = document.getElementById('fs').textContent;

	// ユーザー定義のプログラムオブジェクト生成関数
	var programs = shaderProgram(vertexSource, fragmentSource);

	// uniformロケーションを取得しておく
	var uniLocation = {};
	uniLocation.mMatrix = gl.getUniformLocation(programs, 'mMatrix');
	uniLocation.mvpMatrix = gl.getUniformLocation(programs, 'mvpMatrix');
	uniLocation.invMatrix = gl.getUniformLocation(programs, 'invMatrix');
	uniLocation.lightPosition = gl.getUniformLocation(programs, 'lightPosition');
	uniLocation.eyePosition = gl.getUniformLocation(programs, 'eyePosition');
	uniLocation.centerPoint = gl.getUniformLocation(programs, 'centerPoint');
	uniLocation.texture = gl.getUniformLocation(programs, 'texture');
	uniLocation.emission = gl.getUniformLocation(programs, 'emission');

	// attributeLocationを取得して配列に格納する
	var attLocation = [];
	attLocation[0] = gl.getAttribLocation(programs, 'position');
	attLocation[1] = gl.getAttribLocation(programs, 'normal');
	attLocation[2] = gl.getAttribLocation(programs, 'texCoord');

	// attributeのストライドを配列に格納しておく
	var attStride = [];
	attStride[0] = 3;
	attStride[1] = 3;
	attStride[2] = 2;

	// 頂点データからバッファを生成（りんごモデル）
	var vPositionBuffer = generateVBO(json[0].position);
	var vNormalBuffer = generateVBO(json[0].normal);
	var vTexCoordBuffer = generateVBO(json[0].texCoord);
	var appleVboList = [vPositionBuffer, vNormalBuffer, vTexCoordBuffer];
	var appleIndexBuffer = generateIBO(json[0].index);

	// 頂点データからバッファを生成（カゴモデル）
	vPositionBuffer = generateVBO(json[1].position);
	vNormalBuffer = generateVBO(json[1].normal);
	vTexCoordBuffer = generateVBO(json[1].texCoord);
	var basketVboList = [vPositionBuffer, vNormalBuffer, vTexCoordBuffer];
	var basketIndexBuffer = generateIBO(json[1].index);

	// 行列の初期化
	var mat = new matIV();
	var mMatrix = mat.identity(mat.create());
	var vMatrix = mat.identity(mat.create());
	var pMatrix = mat.identity(mat.create());
	var vpMatrix = mat.identity(mat.create());
	var mvpMatrix = mat.identity(mat.create());
	var invMatrix = mat.identity(mat.create());
	
	// ビュー座標変換行列
	var cameraPosition = [0.0, 0.0, 10.0]; // カメラの位置
	var centerPoint = [0.0, 0.0, 0.0];    // 注視点
	var cameraUp = [0.0, 1.0, 0.0];       // カメラの上方向
	mat.lookAt(cameraPosition, centerPoint, cameraUp, vMatrix);

	// プロジェクションのための情報を揃える
	var fovy = 45;                             // 視野角
	var aspect = canvas.width / canvas.height; // アスペクト比
	var near = 0.1;                            // 空間の最前面
	var far = 20.0;                            // 空間の奥行き終端
	mat.perspective(fovy, aspect, near, far, pMatrix);

	// 行列を掛け合わせてVPマトリックスを生成しておく
	mat.multiply(pMatrix, vMatrix, vpMatrix);   // pにvを掛ける

	// カウンタを初期化
	var count = 0;

	// 平行光源の向き
	var lightPosition = [0.0, 3.0, 3.0];

	// カゴに色を付けるための係数
	var emission = 0.0;

	// 設定を有効化する
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	// テクスチャ生成関数を呼び出す
	var texture = null;
	generateTexture('apple.jpg');
	
	// ロード完了をチェックする関数を呼び出す
	loadCheck();

	// テクスチャ生成完了をチェックする関数
	function loadCheck(){
		// テクスチャの生成をチェック
		if(texture != null){
			// 生成されていたらテクスチャをバインドしなおす
			gl.bindTexture(gl.TEXTURE_2D, texture);

			// 更新しないuniform変数を先にシェーダに送る
			gl.uniform3fv(uniLocation.lightPosition, lightPosition);
			gl.uniform3fv(uniLocation.eyePosition, cameraPosition);
			gl.uniform3fv(uniLocation.centerPoint, centerPoint);
			gl.uniform1i(uniLocation.texture, 0);

			// レンダリング関数を呼び出す
			render();

			// 再起を止めるためにreturnする
			return;
		}

		// 再帰呼び出し
		setTimeout(loadCheck, 100);
	}

	// レンダリング関数の定義
	function render(){
		var i;

		// カウンタをインクリメントする
		count++;

		// ラジアンを計算する
		var radians = (count % 360) * Math.PI / 180;

		// Canvasエレメントをクリアする
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// モデル座標変換行列を一度初期化してリセットする
		mat.identity(mMatrix);

		// 回転軸を決める
		var axis = [1.0, 1.0, 0.0];

		// モデル座標変換行列でみっつのモデルを描く
		for(i = 0; i < 3; i++){
			// 変数countをもとに移動係数を算出
			var translateCount = (count + i * 120) % 360;

			// 移動係数が90以上かつ180以下になる場合だけ描画する
			if(translateCount >= 90 && translateCount <= 180){
				// VBOとIBOを登録しておく（りんご用）
				setAttribute(appleVboList, attLocation, attStride, appleIndexBuffer);

				// 移動係数からラジアンとサインを求める
				var translateRadian = translateCount * Math.PI / 180;
				var translateSin = Math.sin(translateRadian);
				var offset = translateSin * 5.0 - 2.5;

				// 毎回位置が変化するようにする
				var translatePosition = [-3.0 + i * 3.0, offset, 0.0];
				mat.identity(mMatrix);

				// モデル座標変換行列を生成する
				mat.translate(mMatrix, translatePosition, mMatrix);
				mat.rotate(mMatrix, radians, axis, mMatrix);

				// VPマトリックスにモデル座標変換行列を掛ける
				mat.multiply(vpMatrix, mMatrix, mvpMatrix);

				// 逆行列を生成
				mat.inverse(mMatrix, invMatrix);

				// シェーダに汎用データを送信する
				gl.uniformMatrix4fv(uniLocation.mMatrix, false, mMatrix);
				gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMatrix);
				gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMatrix);
				gl.uniform1f(uniLocation.emission, 0.0);

				// インデックスバッファによる描画
				gl.drawElements(gl.TRIANGLES, json[0].index.length, gl.UNSIGNED_SHORT, 0);

				// ヒット判定関数の呼び出し
				hitCheck(i, translateSin);
			}
		}

		// カゴのレンダリング
		// VBOとIBOを登録しておく（カゴ用）
		setAttribute(basketVboList, attLocation, attStride, basketIndexBuffer);

		// モデル座標変換行列を生成する
		mat.identity(mMatrix);
		mat.translate(mMatrix, [basketOffset * 3.0, -2.5, 0.0], mMatrix);

		// VPマトリックスにモデル座標変換行列を掛ける
		mat.multiply(vpMatrix, mMatrix, mvpMatrix);

		// 逆行列を生成
		mat.inverse(mMatrix, invMatrix);

		// シェーダに汎用データを送信する
		gl.uniformMatrix4fv(uniLocation.mMatrix, false, mMatrix);
		gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMatrix);
		gl.uniform1f(uniLocation.emission, emission);

		// インデックスバッファによる描画
		gl.drawElements(gl.TRIANGLES, json[1].index.length, gl.UNSIGNED_SHORT, 0);

		// 更新
		gl.flush();

		// 再帰呼び出し
		requestAnimationFrame(render);
	}

	// りんごとカゴのヒット判定
	function hitCheck(appleIndex, value){
		// カゴの着色係数を減衰させる
		emission *= emission;

		// りんごの縦の座標がカゴのなかに収まっているか
		if(value <= 0.01){
			// りんごの横位置とカゴの横位置が一致しているか
			if(appleIndex === basketOffset + 1){
				// カゴの着色係数を設定
				emission = 0.9;
			}
		}
	}

	// プログラムオブジェクト生成関数
	function shaderProgram(vertexSource, fragmentSource){
		// シェーダオブジェクトの生成
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

		// シェーダにソースを割り当ててコンパイル
		gl.shaderSource(vertexShader, vertexSource);
		gl.compileShader(vertexShader);
		
		// シェーダのコンパイル結果をチェック
		if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
			alert(gl.getShaderInfoLog(vertexShader));
			return null;
		}

		// シェーダにソースを割り当ててコンパイル
		gl.shaderSource(fragmentShader, fragmentSource);
		gl.compileShader(fragmentShader);

		// シェーダのコンパイル結果をチェック
		if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
			alert(gl.getShaderInfoLog(fragmentShader));
			return null;
		}

		// プログラムオブジェクトの生成とシェーダのアタッチ
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);

		// シェーダをリンク
		gl.linkProgram(program);

		// シェーダのリンク結果をチェック
		if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
			alert(gl.getProgramInfoLog(program));
			return null;
		}

		// プログラムオブジェクトを選択状態にする
		gl.useProgram(program);

		// 生成したプログラムオブジェクトを戻り値として返す
		return program;
	}

	// 頂点バッファ（VBO）を生成する関数
	function generateVBO(data){
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

	// インデックスバッファ（IBO）を生成する関数
	function generateIBO(data){
		// バッファオブジェクトの生成
		var ibo = gl.createBuffer();

		// バッファをバインドする
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

		// バッファにデータをセット
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

		// バッファのバインドを無効化
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		// 生成したIBOを返して終了
		return ibo;
	}

	// VBOとIBOを登録する関数
	function setAttribute(vbo, attL, attS, ibo){
		// 引数として受け取った配列を処理する
		for(var i in vbo){
			// バッファをバインドする
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

			// attributeLocationを有効にする
			gl.enableVertexAttribArray(attL[i]);

			// attributeLocationを通知し登録する
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}

		// インデックスバッファをバインドする
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	}

	// テクスチャオブジェクトを初期化する
	function generateTexture(source){
		// イメージオブジェクトの生成
		var img = new Image();

		// データのオンロードをトリガにする
		img.onload = function(){
			// テクスチャオブジェクトの生成
			texture = gl.createTexture();

			// テクスチャをバインドする
			gl.bindTexture(gl.TEXTURE_2D, texture);

			// テクスチャへイメージを適用
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

			// ミップマップを生成
			gl.generateMipmap(gl.TEXTURE_2D);

			// テクスチャのバインドを無効化
			gl.bindTexture(gl.TEXTURE_2D, null);
		};

		// イメージオブジェクトの読み込みを開始
		img.src = source;
	}
}

function keyDownEvent(eve){
	switch(eve.keyCode){
		case 37:
			// 左キーが押されたときの処理
			if(basketOffset > -1){
				basketOffset--;
			}
			break;
		case 39:
			// 右キーが押されたときの処理
			if(basketOffset < 1){
				basketOffset++;
			}
			break;
	}
}
