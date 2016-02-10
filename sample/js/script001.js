//
// WebGLでポリゴンを描画する

window.onload = function () {
    // canvasエレメントを取得
    var c = document.getElementById('canvas');
    c.width = c.height = 100;

    ////////////////////////////////////////////////////////////////////////////////////////////
    //■1.webglコンテキストを取得
    ////////////////////////////////////////////////////////////////////////////////////////////
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    ////////////////////////////////////////////////////////////////////////////////////////////
    //■2.programオブジェクトを作る
    ////////////////////////////////////////////////////////////////////////////////////////////
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');
    var prg = create_program(v_shader, f_shader);
    //programオブジェクトを使うよ宣言
    gl.useProgram(prg);

    ////////////////////////////////////////////////////////////////////////////////////////////
    //■3.shaderに頂点情報などを転送
    ////////////////////////////////////////////////////////////////////////////////////////////
    //頂点データ
    var vertex_position = [
        0.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0
    ];
    // 頂点情報のBufferObjectの生成
    var vbo = create_vbo(vertex_position);
    // attributeLocationの取得
    var attLocation = gl.getAttribLocation(prg, 'position');
    // 'position'は、vec3として利用するので3を指定
    var attStride = 3;
    //作っておいた頂点データを含んだBufferObjectを有効化
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    //
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);


    ////////////////////////////////////////////////////////////////////////////////////////////
    //■4.描画
    ////////////////////////////////////////////////////////////////////////////////////////////
    //gl.drawArrays(gl.TRIANGLES, 0, vertex_position.length / attStride);
    //三角形
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    //点
    gl.drawArrays(gl.POINTS, 0, 3);
    //LINE
    //※書き方が3種類
    gl.drawArrays(gl.LINES, 0, 3);
    gl.drawArrays(gl.LINE_STRIP, 0, 3);
    gl.drawArrays(gl.LINE_LOOP, 0, 3);
    // コンテキストの再描画
    gl.flush();


    ////////////////////////////////////////////////////////////////////////////////////////////
    // 以下、固定なお作法的な処理
    ////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////
    // シェーダを生成する関数
    function create_shader(id) {
        // シェーダを格納する変数
        var shader;
        // HTMLからscriptタグへの参照を取得
        var scriptElement = document.getElementById(id);
        // scriptタグが存在しない場合は抜ける
        if (!scriptElement) {
            return;
        }
        // scriptタグのtype属性をチェック
        switch (scriptElement.type) {
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
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            // 成功していたらシェーダを返して終了
            return shader;
        } else {
            // 失敗していたらエラーログをアラートする
            alert(gl.getShaderInfoLog(shader));
        }
    }

    /////////////////////////////////////////////////
    // プログラムオブジェクトを生成しシェーダをリンクする関数
    function create_program(vs, fs) {
        // プログラムオブジェクトの生成
        var program = gl.createProgram();
        // プログラムオブジェクトにシェーダを割り当てる
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        // シェーダをリンク
        gl.linkProgram(program);
        // シェーダのリンクが正しく行なわれたかチェック
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            // プログラムオブジェクトを返して終了
            return program;
        } else {
            // 失敗していたらエラーログをアラートする
            alert(gl.getProgramInfoLog(program));
        }
    }

    /////////////////////////////////////////////////
    // VBOを生成する関数
    function create_vbo(data) {
        // バッファオブジェクトの生成
        var vbo = gl.createBuffer();
        // バッファをバインドする
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        // バッファにデータをセット
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        // バッファのバインドを無効化
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }
};