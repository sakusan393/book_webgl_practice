var World = function () {
  //superクラスのコンストラクタを実行
  AbstractWorld.call(this, "canvasId", "aaaa");
}

World.prototype.init = function () {

  this.camera = new Camera(this.canvas);
  this.light = new DirectionLight();
  this.scene3D = new Scene3D(this.gl, this.camera, this.light);

  // this.vicviper = new Vicviper(this.gl, this.scene3D, {modelData: window.vicviperModelData, specularIndex: 1});
  // this.vicviper.setScale(0.3);
  // this.vicviper.x = -1;
  // this.vicviper.rotationX = 40;
  // this.scene3D.addChild(this.vicviper);

  this.cockpit = new Cokpit(this.gl);
  this.cockpit.z = 3;
  this.scene3D.addChild(this.cockpit);

  this.enterFrameHandler()
}
World.prototype.enterFrameHandler = function () {
  // this.vicviper.rotationY += .3;

  this.scene3D.render();
  requestAnimationFrame(this.enterFrameHandler.bind(this))
}

inherits(World, AbstractWorld);


window.onload = function () {

  //テクスチャ読み込み後の処理
  var loadCompleteHandler = function () {

    //ドキュメントクラス的なもの canvasのIDを渡す
    var initialize = function (returnValue) {
      window.vicviperModelData = returnValue;
      for (var val in ImageLoader.images) {
        console.log("loaded : ", ImageLoader.images[val]);
      }
      new World();
    };
    var srcFiles1 = {
      obj: "models/vicviper_mirror_fix.obj",
      mtl: "models/vicviper_mirror_fix.mtl"
    };
    ObjLoader.load(srcFiles1, initialize);
  };

  //テクスチャ画像リスト
  var texturePashArray = ["images/texturengundam.png", "images/texturefunnel.png", "images/texturefunnel_n.png", "images/texturesazabycokpit.jpg", "images/texturestar.png", "images/space.jpg", "images/texturesazabycokpit_n.png"];
  //テクスチャ画像をImage要素としての読み込み
  ImageLoader.load(texturePashArray, loadCompleteHandler);
};
