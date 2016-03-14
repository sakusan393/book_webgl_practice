var World = function(){
    //superクラスのコンストラクタを実行
    AbstractWorld.call(this, "canvasId","aaaa");
}

World.prototype.init = function(){
    console.log("World.init")

    this.camera = new Camera(this.canvas);
    this.light = new DirectionLight();
    this.scene3D = new Scene3D(this.gl, this.camera, this.light);

    this.funnel = new Vicviper(this.gl, this.scene3D, window.vicviperModelData, null);
    this.funnel.setScale(0.3);

    this.scene3D.addChild(this.funnel);

    this.enterFrameHandler()
}
World.prototype.enterFrameHandler = function(){
    this.scene3D.render();
    requestAnimationFrame(this.enterFrameHandler.bind(this))
}

inherits(World,AbstractWorld);



window.onload = function () {

    //テクスチャ読み込み後の処理
    var loadCompleteHandler = function () {
        for (var val in ImageLoader.images) {
            console.log("loaded", ImageLoader.images[val]);
        }
        //ドキュメントクラス的なもの canvasのIDを渡す
        var initialize = function () {
            var obj = objParser.objParse(objLoader.files["vicviper_mirror_fix_obj"]);
            var mtl = objParser.mtlParse(objLoader.files["vicviper_mirror_fix_mtl"]);
            // パースしたデータを元にWebGL用のObjectを作成する
            objParser.createGLObject(obj, mtl , function(returnValue){
                window.vicviperModelData = returnValue;
                new World();
            })
        };
        var srcFiles1 = {
            obj: "models/vicviper_mirror_fix.obj",
            mtl: "models/vicviper_mirror_fix.mtl"
        };
        objLoader.load(srcFiles1, initialize);
    };

    //テクスチャ画像リスト
    var texturePashArray = ["images/texturengundam.png", "images/texturefunnel.png", "images/texturefunnel_n.png", "images/texturesazabycokpit.jpg", "images/texturestar.png", "images/space.jpg", "images/texturesazabycokpit_n.png"];
    //テクスチャ画像をImage要素としての読み込み
    ImageLoader.load(texturePashArray, loadCompleteHandler);
};
