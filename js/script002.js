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
    // uniformLocationの取得
    var uniLocation = gl.getUniformLocation(prg, "color");

    gl.useProgram(prg);
    render();

    function render(){
        gl.clear(gl.COLOR_BUFFER_BIT);


        update_vbo(randomPosition(vertex_position),vbo);

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.enableVertexAttribArray(attLocation);
        gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uniLocation, 0.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.uniform1f(uniLocation, 0.5);
        gl.drawArrays(gl.LINE_LOOP, 0, 3);

        gl.uniform1f(uniLocation, 1.0);
        gl.drawArrays(gl.POINTS, 0, 3);

        // コンテキストの再描画
        gl.flush();

        setTimeout(render, 100)
    }

    function randomPosition(array){
        var newArray = [];
        for(var i= 0, l=array.length; i < l; i++){
            newArray[i] = array[i] * Math.random();
        }
        return newArray;
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

    // プログラムオブジェクトを生成しシェーダをリンクする関数
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

    // VBOの頂点情報を更新
    function update_vbo(data,vbo){
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
};

