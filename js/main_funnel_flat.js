var Camera = function (canvas) {
  // ビュー座標変換行列
  this.lookPoint = [0.0, 0.0, 0.0];    // 注視点
  this.x = 0;
  this.y = 0;
  this.z = 5;
  this.cameraPosition = [this.x, this.y, this.z]; // カメラの位置
  this.cameraUp = [0.0, 1.0, 0.0];       // カメラの上方向
  this.vMatrix = mat4.identity(mat4.create());
  this.pMatrix = mat4.identity(mat4.create());
  this.vpMatrix = mat4.identity(mat4.create());
  mat4.lookAt(this.vMatrix, this.cameraPosition, this.lookPoint, this.cameraUp);

  // プロジェクションのための情報を揃える
  this.fov = 45 * Math.PI / 180;                           // 視野角
  this.aspect = canvas.width / canvas.height; // アスペクト比
  this.near = 0.1;                            // 空間の最前面
  this.far = 200.0;                            // 空間の奥行き終端
  mat4.perspective(this.pMatrix, this.fov, this.aspect, this.near, this.far);
  mat4.multiply(this.vpMatrix, this.pMatrix, this.vMatrix);
  this.count = 0;
  this.lookTarget = null
};
Camera.prototype = {
  setTarget: function (cameraTarget) {
    this.lookTarget = cameraTarget
  },
  render: function () {

    if (this.lookTarget) {
      this.lookPoint = [this.lookTarget.x, this.lookTarget.y, this.lookTarget.z]
    }
    this.cameraPosition = [this.x, this.y, this.z];

    mat4.lookAt(this.vMatrix, this.cameraPosition, this.lookPoint, this.cameraUp);
    mat4.perspective(this.pMatrix, this.fov, this.aspect, this.near, this.far);
    mat4.multiply(this.vpMatrix, this.pMatrix, this.vMatrix);
  }
};
var DirectionLight = function () {
  // ビュー座標変換行列
  this.lightDirection = [0.0, .2, -1.0];
  this.ambientColor = [0.0, 0.0, 0.1];
};
DirectionLight.prototype = {};

Beam = function (gl, scene3D, funnel, cockpit) {
  this.gl = gl;
  this.scene3D = scene3D;
  this.lookTarget = funnel;
  this.target = cockpit;
  this.modelData = window.beam(2, [1, 1, 0, 0.5]);
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

  this.defaultPosture = [0, 0, 1];
};

Beam.prototype = {
  init: function () {
    this.x = this.lookTarget.x;
    this.y = this.lookTarget.y;
    this.z = this.lookTarget.z;
    this.alpha = this.startAlpha;
    this.currentLife = this.life;
    //クォータニオンによる姿勢制御
    this.lookVector = vec3.subtract([], [this.target.x, this.target.y, this.target.z], [this.x, this.y, this.z]);
    //回転軸(外積)
    var rotationAxis = vec3.cross([], this.lookVector, this.defaultPosture);
    vec3.normalize(rotationAxis, rotationAxis);

    //なす角(radian)
    var qAngle = Math.acos(vec3.dot(this.lookVector, this.defaultPosture) / (vec3.length(this.lookVector) * vec3.length(this.defaultPosture)));
    quat.setAxisAngle(this.qtn, rotationAxis, -qAngle);
    mat4.identity(this.qMatrix);
    mat4.fromQuat(this.qMatrix, this.qtn);
  },
  render: function () {
    this.alpha = (this.currentLife / this.life > this.startAlpha) ? this.startAlpha : this.currentLife / this.life;
    vec3.normalize(this.lookVector, this.lookVector);
    this.x += this.lookVector[0] * this.speed;
    this.y += this.lookVector[1] * this.speed;
    this.z += this.lookVector[2] * this.speed;
    var translatePosition = [this.x, this.y, this.z];
    mat4.identity(this.mMatrix);
    mat4.translate(this.mMatrix, this.mMatrix, translatePosition);
    mat4.multiply(this.mMatrix, this.mMatrix, this.qMatrix);

    var scale = [this.scaleX, this.scaleY, this.scaleZ];
    mat4.scale(this.mMatrix, this.mMatrix, scale);

    this.currentLife--;
    if (this.currentLife < 0) {
      requestAnimationFrame(this.dispose.bind(this))
    }
  },
  dispose: function () {
    this.scene3D.removeChild(this)
  }
};


Funnel = function (gl, scene3D, lookTarget) {
  this.gl = gl;
  this.scene3D = scene3D;
  this.lookTarget = lookTarget;
  this.modelData = window.vicviper();
  this.mMatrix = mat4.identity(mat4.create());
  this.invMatrix = mat4.identity(mat4.create());

  this.qtn = quat.identity(quat.create());
  this.qMatrix = mat4.identity(mat4.create());

  this.x = (Math.random() - 0.5) * 30;
  this.y = (Math.random() - 0.5) * 30;
  this.z = (Math.random() - 0.5) * 30;
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

  this.defaultPosture = [0, 0, 1];

  this.speedRatio = {};
  this.ratio = {};
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
  this.isBump = false;
  this.textureObject = {};
  this.textureObject.diffuse = null;
  this.textureObject.bump = null;

  for (var i = 0; i < this.beamLength; i++) {
    this.beamArray[i] = new Beam(this.gl, this.scene3D, this, this.lookTarget);
  }

  var diffuseMapSource = ImageLoader.images["texturefunnel"];
  var bumpMapSource = ImageLoader.images["texturefunnel_n"];
  this.initTexture(diffuseMapSource, "diffuse");
  this.initTexture(bumpMapSource, "bump");
  this.texture = this.textureObject.diffuse;
};


Funnel.prototype = {
  initTexture: function (img, type) {
    // テクスチャオブジェクトの生成
    this.textureObject[type] = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureObject[type]);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  },
  setTarget: function (cameraTarget) {
    this.lookTarget = cameraTarget
  },
  shoot: function () {
    this.curentBeamIndex++;
    if (this.curentBeamIndex >= this.beamLength) {
      this.curentBeamIndex = 0;
    }
    this.currentBeam = this.beamArray[this.curentBeamIndex];
    this.currentBeam.init();
    this.scene3D.addChild(this.beamArray[this.curentBeamIndex])
  },
  render: function () {
    this.count += this.speed;

    var translatePosition = [this.x, this.y, this.z];
    mat4.identity(this.mMatrix);
    mat4.translate(this.mMatrix, this.mMatrix, translatePosition);
    var targetPosition = {x: 0, y: 0, z: 0};
    if (this.lookTarget) {
      targetPosition.x = this.lookTarget.x;
      targetPosition.y = this.lookTarget.y;
      targetPosition.z = this.lookTarget.z;
    }

    //クォータニオンによる姿勢制御
    var lookVector = vec3.subtract([], [targetPosition.x, targetPosition.y, targetPosition.z], [this.x, this.y, this.z]);
    //回転軸(外積)
    var rotationAxis = vec3.cross([], lookVector, this.defaultPosture);
    vec3.normalize(rotationAxis, rotationAxis);

    //なす角(radian)
    var qAngle = Math.acos(vec3.dot(lookVector, this.defaultPosture) / (vec3.length(lookVector) * vec3.length(this.defaultPosture)));
    quat.setAxisAngle(this.qtn, rotationAxis, -qAngle);
    mat4.identity(this.qMatrix);
    mat4.fromQuat(this.qMatrix, this.qtn);
    mat4.multiply(this.mMatrix, this.mMatrix, this.qMatrix);

    mat4.invert(this.invMatrix, this.mMatrix);
  }

};
Cokpit = function (gl) {
  this.gl = gl;
  this.modelData = window.sphere(20, 20, .3);
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
  this.speed = .02;
  this.isLightEnable = true;
  this.isBump = false;
  this.textureObject = {};
  this.textureObject.diffuse = null;
  this.textureObject.bump = null;

  var diffuseMapSource = ImageLoader.images["texturesazabycokpit"];
  var bumpMapSource = ImageLoader.images["texturesazabycokpit_n"];
  this.initTexture(diffuseMapSource, "diffuse");
  this.initTexture(bumpMapSource, "bump");
  this.texture = this.textureObject.diffuse;

};
Cokpit.prototype = {
  initTexture: function (img, type) {
    // テクスチャオブジェクトの生成
    this.textureObject[type] = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureObject[type]);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  },
  render: function () {
    var translatePosition = [this.x, this.y, this.z];
    mat4.identity(this.mMatrix);
    mat4.translate(this.mMatrix, this.mMatrix, translatePosition);
    var radians = (this.count * 50 % 360) * Math.PI / 180;
    var axis = [1.0, 0.5, 0.1];
    mat4.rotate(this.mMatrix, this.mMatrix, radians, axis);
    mat4.invert(this.invMatrix, this.mMatrix);
  }
};

Stars = function (gl, img) {
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
  if (img) {
    this.initTexture(img);
  }
};

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
};
SkySphere = function (gl, img) {
  this.gl = gl;
  this.modelData = window.sphere(20, 20, 80);
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
  this.isCullingFront = true;


  if (img) {
    this.initTexture(img);
  }
};
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
};


NGundam = function (gl, img) {
  this.gl = gl;
  this.modelData = window.plane(2);
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
  this.isPoint = false;
  this.isLightEnable = false;
  if (img) {
    this.initTexture(img);
  }

};
NGundam.prototype = {
  render: function () {
    this.z = -60;
    this.y = 20;
    var translatePosition = [this.x, this.y, this.z];
    mat4.identity(this.mMatrix);
    mat4.translate(this.mMatrix, this.mMatrix, translatePosition);
    var radians = (180 % 360) * Math.PI / 180;
    var axis = [0.0, 0.0, 1.0];
    mat4.rotate(this.mMatrix, this.mMatrix, radians, axis);
    //mat4.invert(this.invMatrix , this.mMatrix);
  },
  initTexture: function (img) {
    // テクスチャオブジェクトの生成
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }
};


Scene3D = function (gl, camera, light) {
  this.gl = gl;
  this.camera = camera;
  this.light = light;
  this.meshList = [];
  this.mvpMatrix = mat4.identity(mat4.create());
  this.count = 0;
  this.initWebgl();
  this.render()
};
Scene3D.prototype = {

  addChild: function (mesh) {
    var vPositionBuffer, vNormalBuffer, vTexCoordBuffer, vColorBuffer, veterxBuffer, meshIndexBuffer;
    var meshVboList = [];
    var meshVbo;
    if (mesh.modelData.p) {
      vPositionBuffer = this.generateVBO(mesh.modelData.p);
      meshVboList[0] = (vPositionBuffer)
    }
    if (mesh.modelData.n) {
      vNormalBuffer = this.generateVBO(mesh.modelData.n);
      meshVboList[1] = (vNormalBuffer)
    }
    if (mesh.modelData.t) {
      vTexCoordBuffer = this.generateVBO(mesh.modelData.t);
      meshVboList[2] = (vTexCoordBuffer)
    }
    if (mesh.modelData.c) {
      vColorBuffer = this.generateVBO(mesh.modelData.c);
      meshVboList[3] = (vColorBuffer)
    }
    if (mesh.modelData.a) {
      veterxBuffer = this.generateVBO(mesh.modelData.a);
      meshVbo = (veterxBuffer)
    }
    if (mesh.modelData.i) {
      meshIndexBuffer = this.generateIBO(mesh.modelData.i);
    }
    var obj = {
      "vertexBufferList": meshVboList,
      "indexBuffer": meshIndexBuffer,
      "mesh": mesh,
      "vertexBuffer": meshVbo
    };
    mesh.index = this.meshList.length;
    this.meshList.push(obj);
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

      if (this.meshList[i].mesh.isPoint) {
        this.gl.useProgram(this.programs_points);
        this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation_points, this.attStride, null, "point");
        this.meshList[i].mesh.render();
        mat4.multiply(this.mvpMatrix, this.camera.vpMatrix, this.meshList[i].mesh.mMatrix);

        this.gl.uniformMatrix4fv(this.uniLocation_points.mvpMatrix, false, this.mvpMatrix);
        //明示的に0番目を指定
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.uniform1i(this.uniLocation_points.texture, 0);
        if (this.meshList[i].mesh.texture) this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshList[i].mesh.texture);
        this.gl.drawArrays(this.gl.POINTS, 0, this.meshList[i].mesh.modelData.p.length / 3);

      } else if (this.meshList[i].mesh.isBump) {
        this.gl.useProgram(this.programs_bump);

        this.gl.enable(this.gl.CULL_FACE);
        if (this.meshList[i].mesh.isCullingFront) {
          this.gl.cullFace(this.gl.FRONT);
        } else {
          this.gl.cullFace(this.gl.BACK);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.meshList[i].vertexBuffer);
        this.gl.vertexAttribPointer(this.attLocation_bump[0], this.attStride[0], this.gl.FLOAT, false, (3 + 3 + 2) * 4, 0);
        this.gl.vertexAttribPointer(this.attLocation_bump[1], this.attStride[1], this.gl.FLOAT, false, (3 + 3 + 2) * 4, 4 * 3);
        this.gl.vertexAttribPointer(this.attLocation_bump[2], this.attStride[2], this.gl.FLOAT, false, (3 + 3 + 2) * 4, 4 * (3 + 3));
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.meshList[i].indexBuffer);

        //this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation_bump, this.attStride, this.meshList[i].indexBuffer);

        this.meshList[i].mesh.render();
        mat4.multiply(this.mvpMatrix, this.camera.vpMatrix, this.meshList[i].mesh.mMatrix);
        this.gl.uniformMatrix4fv(this.uniLocation_bump.mvpMatrix, false, this.mvpMatrix);
        this.gl.uniformMatrix4fv(this.uniLocation_bump.mMatrix, false, this.meshList[i].mesh.mMatrix);
        this.gl.uniformMatrix4fv(this.uniLocation_bump.invMatrix, false, this.meshList[i].mesh.invMatrix);
        this.gl.uniform3fv(this.uniLocation_bump.eyePosition, this.camera.cameraPosition);

        //明示的に0番目を指定
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshList[i].mesh.textureObject.diffuse);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshList[i].mesh.textureObject.bump);

        this.gl.drawElements(this.gl.TRIANGLES, this.meshList[i].mesh.modelData.i.length, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.disable(this.gl.CULL_FACE);

      } else {
        this.gl.useProgram(this.programs);
        this.gl.uniform1f(this.uniLocation.alpha, this.meshList[i].mesh.alpha);
        //裏面をカリング(描画しない)
        this.gl.enable(this.gl.CULL_FACE);
        if (this.meshList[i].mesh.isCullingFront) {
          this.gl.cullFace(this.gl.FRONT);
        } else {
          this.gl.cullFace(this.gl.BACK);
        }

        this.setAttribute(this.meshList[i].vertexBufferList, this.attLocation, this.attStride, this.meshList[i].indexBuffer);
        this.meshList[i].mesh.render();
        mat4.multiply(this.mvpMatrix, this.camera.vpMatrix, this.meshList[i].mesh.mMatrix);
        this.gl.uniform1i(this.uniLocation.isLightEnable, this.meshList[i].mesh.isLightEnable);


        this.gl.uniformMatrix4fv(this.uniLocation.mvpMatrix, false, this.mvpMatrix);
        this.gl.uniformMatrix4fv(this.uniLocation.invMatrix, false, this.meshList[i].mesh.invMatrix);
        //明示的に0番目を指定
        this.gl.activeTexture(this.gl.TEXTURE0);
        if (this.meshList[i].mesh.texture) this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshList[i].mesh.texture);
        this.gl.uniform1i(this.uniLocation.texture, 0);
        this.gl.drawElements(this.gl.TRIANGLES, this.meshList[i].mesh.modelData.i.length, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.disable(this.gl.CULL_FACE);
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
    var vertexShaderBumpSource = document.getElementById("vs_bump").textContent;
    var fragmentShaderBumpSource = document.getElementById("fs_bump").textContent;

    //プログラムの生成
    this.programs_points = this.createShaderProgram(vertexShaderPointsSource, fragmentShaderPointsSource);
    this.uniLocation_points = {};
    var uniformParameters0 = ["texture", "mvpMatrix"];
    this.initUniformParameter(this.uniLocation_points, uniformParameters0, this.programs_points);

    this.programs = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
    this.uniLocation = {};
    var uniformParameters1 = ["texture", "mvpMatrix", "invMatrix", "lightDirection", "eyePosition", "ambientColor", "alpha", "isLightEnable"];
    this.initUniformParameter(this.uniLocation, uniformParameters1, this.programs);

    this.programs_bump = this.createShaderProgram(vertexShaderBumpSource, fragmentShaderBumpSource);
    this.uniLocation_bump = {};
    var uniformParameters2 = ["texture0", "texture1", "mvpMatrix", "mMatrix", "invMatrix", "lightDirection", "eyePosition", "ambientColor"];
    this.initUniformParameter(this.uniLocation_bump, uniformParameters2, this.programs_bump);

    // attributeLocationを取得して配列に格納する
    this.attLocation = [];
    this.attLocation[0] = this.gl.getAttribLocation(this.programs, 'position');
    this.attLocation[1] = this.gl.getAttribLocation(this.programs, 'normal');
    this.attLocation[2] = this.gl.getAttribLocation(this.programs, 'texCoord');
    this.attLocation[3] = this.gl.getAttribLocation(this.programs, 'color');
    for (var i = 0, l = this.attLocation.length; i < l; i++) {
      this.gl.enableVertexAttribArray(this.attLocation[i]);
    }

    this.attLocation_points = [];
    this.attLocation_points[0] = this.gl.getAttribLocation(this.programs_points, 'position');

    this.attLocation_bump = [];
    this.attLocation_bump[0] = this.gl.getAttribLocation(this.programs_bump, 'position');
    this.attLocation_bump[1] = this.gl.getAttribLocation(this.programs_bump, 'normal');
    this.attLocation_bump[2] = this.gl.getAttribLocation(this.programs_bump, 'texCoord');
    this.attLocation_bump[3] = this.gl.getAttribLocation(this.programs_bump, 'color');

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

    this.gl.useProgram(this.programs_bump);
    this.gl.uniform3fv(this.uniLocation_bump.lightDirection, this.light.lightDirection);
    this.gl.uniform3fv(this.uniLocation_bump.ambientColor, this.light.ambientColor);
    this.gl.uniform1i(this.uniLocation_bump.texture0, 0);
    this.gl.uniform1i(this.uniLocation_bump.texture1, 1);
  },

  initUniformParameter: function (uniformObj, uniformParameters, program) {
    var l = uniformParameters.length;
    for (var i = 0; i < l; i++) {
      uniformObj[uniformParameters[i]] = this.gl.getUniformLocation(program, uniformParameters[i]);
    }
  },

  createShaderProgram: function (vertexShaderSource, fragmentShaderSource) {
    //shaderオブジェクトを生成
    var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

    //shaderオブジェクトにソースを割り当てて、コンパイル
    this.gl.shaderSource(vertexShader, vertexShaderSource);
    this.gl.compileShader(vertexShader);
    this.checkShaderCompile(vertexShader);
    this.gl.shaderSource(fragmentShader, fragmentShaderSource);
    this.gl.compileShader(fragmentShader);
    this.checkShaderCompile(fragmentShader);

    //programを生成し、shaderとの紐づけ
    var programs = this.gl.createProgram();
    this.gl.attachShader(programs, vertexShader);
    this.gl.attachShader(programs, fragmentShader);
    this.gl.linkProgram(programs);
    this.checkLinkPrograms(programs);

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
    for (var i in vbo) {
      if (vbo[i]) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
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
};

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
    if(!this.gl.getExtension('OES_standard_derivatives')){
      alert('OES_standard_derivatives is not supported');
      return null;
    }

    return this.gl
  },
  setCanvasSize: function () {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
  },


  init: function () {

    this.camera = new Camera(this.canvas);
    this.light = new DirectionLight();
    this.scene3D = new Scene3D(this.gl, this.camera, this.light);

    this.cockpit = new Cokpit(this.gl);

    var stars = new Stars(this.gl, ImageLoader.images["texturestar"]);


    var skySphere = new SkySphere(this.gl, ImageLoader.images["space"]);

    var nGumdam = new NGundam(this.gl, ImageLoader.images["texturengundam"]);

    //this.camera.setTarget(this.cockpit);


    this.scene3D.addChild(skySphere);
    this.funnellArray = [];
    this.funnelLength = 1;
    for (var i = 0; i < this.funnelLength; i++) {
      var funnel = new Funnel(this.gl, this.scene3D, this.cockpit);
      this.funnellArray.push(funnel);
      this.scene3D.addChild(funnel)
    }
    this.scene3D.addChild(this.cockpit);
    this.scene3D.addChild(nGumdam);
    this.scene3D.addChild(stars);

    var self = this;
    setInterval(function () {
      for (var i = 0; i < self.funnelLength; i++) {
        self.funnellArray[i].shoot();
      }
    }, 100);

    this.enterFrameHandler()
  },

  enterFrameHandler: function () {

    var ratio = 0.5;

    this.camera.count += ratio;
    this.camera.x = Math.sin((this.camera.count * .003 % 360 )) * 5;
    this.camera.y = Math.cos((this.camera.count * .002 % 360)) * 7;
    this.camera.z = Math.cos((this.camera.count * .003 % 360)) * 13;

    //TEST
    //this.camera.x = Math.cos((this.camera.count * .01 % 360 )) * 5;
    //this.camera.z = Math.sin((this.camera.count * .01 % 360)) * 5;

    this.cockpit.count += this.cockpit.speed * ratio;
    this.cockpit.x = Math.sin((this.cockpit.count + this.cockpit.rnd1) / 3) * this.cockpit.gainRatio * .2 * (Math.sin(this.cockpit.count / 1.5) + 1);
    this.cockpit.y = Math.cos((this.cockpit.count + this.cockpit.rnd) / 3) * this.cockpit.gainRatio * .2 * (Math.sin(this.cockpit.count) + 1.3);
    this.cockpit.z = Math.cos((this.cockpit.count + this.cockpit.rnd2) / 7) * this.cockpit.gainRatio * .1 * (Math.sin(this.cockpit.count) + 1);

    for (var i = 0; i < this.funnelLength; i++) {
      this.funnellArray[i].count += this.funnellArray[i].speed * ratio;
      //this.funnellArray[i].rotationZ = Math.sin(this.funnellArray[i].count / this.funnellArray[i].speedRatio.y) * this.funnellArray[i].speedRatio.z;
      //this.funnellArray[i].x += (this.cockpit.x - this.funnellArray[i].x) * (Math.sin(this.funnellArray[i].count / this.funnellArray[i].speedRatio.x) + 1) * this.funnellArray[i].ratio.x;
      //this.funnellArray[i].y += (this.cockpit.y - this.funnellArray[i].y) * (Math.cos(this.funnellArray[i].count / this.funnellArray[i].speedRatio.y + this.funnellArray[i].speedRatio.y) + 1) * this.funnellArray[i].ratio.y;
      //this.funnellArray[i].z += (this.cockpit.z - this.funnellArray[i].z) * (Math.sin(this.funnellArray[i].count / this.funnellArray[i].speedRatio.z + this.funnellArray[i].speedRatio.z) + 1) * this.funnellArray[i].ratio.z;
      this.funnellArray[i].x = this.funnellArray[i].y = this.funnellArray[i].z = 0
    }
    this.scene3D.render();
    requestAnimationFrame(this.enterFrameHandler.bind(this))
  }
};


window.onload = function () {

  //テクスチャ読み込み後の処理
  var loadCompleteHandler = function () {

    for (var val in ImageLoader.images) {
      console.log("loaded", ImageLoader.images[val]);
    }
    //ドキュメントクラス的なもの canvasのIDを渡す
    new World()
  };

  //テクスチャ画像リスト
  var texturePashArray = ["images/texturengundam.png", "images/texturefunnel.png", "images/texturefunnel_n.png", "images/texturesazabycokpit.jpg", "images/texturestar.png", "images/space.jpg", "images/texturesazabycokpit_n.png"];
  //テクスチャ画像をImage要素としての読み込み
  ImageLoader.load(texturePashArray, loadCompleteHandler);
};

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
        var id = this.src.split("/")[this.src.split("/").length - 1].split(".")[0];
        ImageLoader.images[id] = this;
        if (counter >= ImageLoader.length) callback();
      };
      img.src = pathArray[i];

    }
  }
};


