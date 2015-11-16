/**
 * Copyright sakusan393 ( http://wonderfl.net/user/sakusan393 )
 * MIT License ( http://www.opensource.org/licenses/mit-license.php )
 * Downloaded from: http://wonderfl.net/c/hPmu
 */

package
{
    import flash.display.BitmapData;
    import flash.display.Sprite;
    import flash.display.StageAlign;
    import flash.display.StageScaleMode;
    import flash.events.Event;
    import flash.events.MouseEvent;
    import flash.geom.Vector3D;
    import flash.net.URLRequest;
    import flash.system.LoaderContext;
    import flash.system.Security;
    
    import com.bit101.components.ComboBox;
    import com.bit101.components.HUISlider;
    import com.bit101.components.Label;
    import com.bit101.components.PushButton;

    import jp.progression.commands.lists.LoaderList;
    import jp.progression.commands.net.LoadBitmapData;
    import jp.progression.data.getResourceById;
    
    import net.hires.debug.Stats;
    
    import org.libspark.betweenas3.BetweenAS3;
    import org.libspark.betweenas3.easing.Sine;
    import org.libspark.betweenas3.tweens.ITween;

    public class Finfunnel extends Sprite 
    {
        private var _scene:Scene3D;
        private var _camera:Camera3D;

        private var _count:Number = 0;
        private var _speed:Number = 1.5;
        private var _funnelLength:int = 50;
        private var _funnelCurrentLength:int = 3;
        
        private var _container3D:Sprite;
        
        private var _cockpit:Object3D;
        private var _funnels:Vector.<Object3D> = new Vector.<Object3D>();
        private var _addFunnels:Vector.<Object3D> = new Vector.<Object3D>();
        private var _beams:Vector.<Object3D> = new Vector.<Object3D>();
        
        private var _iTween:ITween;
        
        private var _sazabyURL:String = "http://393.bz/data/texturesazabycokpit.gif";
        private var _funnelURL:String = "http://393.bz/data/texturefunnel.png";

        public function Finfunnel() 
        {
            Wonderfl.capture_delay(4);
            stage.frameRate = 60;
            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align = StageAlign.TOP_LEFT;
            var root:Sprite = this;
            
            Security.loadPolicyFile("http://393.bz/data/crossdomain.xml");
            
            var loaderList:LoaderList =  new LoaderList( {
                onComplete:function():void
                {
                    init();
                }
                ,onProgress:function():void
                {
                    scaleX = this.percent / 100;
                }
            } );
            loaderList.addCommand(new LoadBitmapData(new URLRequest(_sazabyURL),{context: new LoaderContext(true)}));
            loaderList.addCommand(new LoadBitmapData(new URLRequest(_funnelURL),{context: new LoaderContext(true)}));
            loaderList.execute();
        }
        
        private function setup3D():void 
        {
            _container3D = new Sprite();
            addChild(_container3D).z = 0;
            _container3D.x = stage.stageWidth / 2;
            _container3D.y = stage.stageHeight / 2;
            
            _camera = new Camera3D(_container3D, 400);
            _scene = new Scene3D( _container3D, _camera, stage );
            
            var xLength:uint = 6, yLength:uint = 6, zLength:uint = 6;
            var distanceX:uint = 2000, distanceY:uint = 2000, distanceZ:uint = 2000;
            var i:int, ii:int, iii:int;
            for ( i = 0; i < xLength; i++ )
            {
                for ( ii = 0; ii < yLength; ii++ )
                {
                    for ( iii = 0; iii < zLength; iii++ )
                    {
                        if (Math.random() > 0.5)
                        {
                            var star:Object3D = new BillBoard3D(new Ball(15,Math.random()*0x0000FF));
                            _scene.addChild(star);
                            star.x = (i - int(xLength / 2)) * distanceX
                            star.y = (ii - int(yLength / 2)) * distanceY
                            star.z = (iii - int(zLength / 2)) * distanceZ + 100;
                        }
                    }
                }
            }
            
            //sazabyのコクピットの生成
            _cockpit = new Ball3D(30, 6,8,BitmapData(getResourceById(_sazabyURL).data));
            _scene.addChild(_cockpit);
            
            //カメラのターゲットをコクピットに指定
            _camera.target = _cockpit;
            
            //finfunnelの生成
            var funnelBmd:BitmapData = BitmapData(getResourceById(_funnelURL).data);
            for ( i = 0; i < _funnelLength; i++)
            {
                _funnels[i] = new Funnel3D(100,100, 100,funnelBmd);
                if (i < _funnelCurrentLength)
                {
                    _scene.addChild(_funnels[i]);
                    //_addFunnels.push(_funnels[i]);
                }
                _funnels[i].x = 500 * Math.random() - 250;
                _funnels[i].y = 500 * Math.random() - 250;
                _funnels[i].z = 500 * Math.random() - 250;
                _funnels[i].scaleX = 0.7;
                Funnel3D(_funnels[i]).target = _cockpit;
                
                _beams[i] = new Beam3D(10, 300);
                _scene.addChild(_beams[i]);
                Beam3D(_beams[i]).view.visible = false;
                
            }
        }
        private function init():void 
        {
            setup3D();
            setupConfigUI();
            
            //カメラの動き
            if (_iTween) if (_iTween.isPlaying) _iTween.stop();
            _iTween = BetweenAS3.serial(
                BetweenAS3.to(_camera, { x:0 , y: 0, z: -500 }, 5,Sine.easeInOut)
                ,BetweenAS3.to(_camera, { x:800 , y: 400, z: -800 }, 3,Sine.easeInOut)
                ,BetweenAS3.to(_camera, { x:-800 , y: -400, z: -1000 }, 6,Sine.easeInOut)
                ,BetweenAS3.to(_camera, { x:0 , y: 0, z: -500 }, 4,Sine.easeInOut)
            );
            _iTween.stopOnComplete = false;
            _iTween.play();
                        
            stage.addEventListener(Event.ENTER_FRAME, enterFrameHandler);
            stage.addEventListener(Event.RESIZE, resizeHandler);
            resizeHandler(null);
            
            addChild(new Stats());
        }
        
        private function resizeHandler(e:Event):void 
        {
            _container3D.x = stage.stageWidth / 2;
            _container3D.y = stage.stageHeight / 2;
            graphics.clear();
            graphics.beginFill(0x000033);
            graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
            graphics.endFill();
        }
        
        private function enterFrameHandler(e:Event):void
        {
            _count += _speed;
            var degreeToRatianRatio:Number = Math.PI / 180;
            var _gain:int = Math.cos(_count/30) * 300 + (150 * Math.sin(_count/80) + 200)
            _cockpit.x = Math.sin(_count * degreeToRatianRatio) * _gain * 4;
            _cockpit.y = Math.cos(_count * degreeToRatianRatio) * _gain * 2;
            _cockpit.z = Math.cos(_count * degreeToRatianRatio) * _gain * 1;
            
            var i:int;
            for (i = 0; i < _funnelLength; i++)
            {
                _funnels[i].x += (_cockpit.x - _funnels[i].x) * (Math.sin(_count / Funnel3D(_funnels[i]).speedRatio.x) + 1) * Funnel3D(_funnels[i]).ratio.x;
                _funnels[i].y += (_cockpit.y - _funnels[i].y) * (Math.cos(_count / Funnel3D(_funnels[i]).speedRatio.y + Funnel3D(_funnels[i]).speedRatio.y) + 1) * Funnel3D(_funnels[i]).ratio.y;
                _funnels[i].z += (_cockpit.z - _funnels[i].z) * (Math.sin(_count / Funnel3D(_funnels[i]).speedRatio.z + Funnel3D(_funnels[i]).speedRatio.z) + 1) * Funnel3D(_funnels[i]).ratio.z;
            }
        }
        
        //configUIの設定
        private function setupConfigUI():void 
        {
            var uiContainer:Sprite = new Sprite();
            uiContainer.graphics.beginFill(0xFFFFFF, 0.7);
            uiContainer.graphics.drawRect(0, 0, 350, 150);
            this.addChild(uiContainer);
            var shootButton:PushButton = new PushButton(this, 100, 110, "BEAM SHOOT", shootClickHandler);
            shootButton.width = 197;
            shootButton.height = 30;
            var funnelLengthSlider:HUISlider = new HUISlider(uiContainer, 100, 40, "Funnels length", funnelLengthChangeHandler);
            funnelLengthSlider.minimum = 1;
            funnelLengthSlider.maximum = _funnelLength;
            funnelLengthSlider.value = _funnelCurrentLength;
            funnelLengthSlider.width = 250;
            funnelLengthSlider.tick = 1;
            var speedSlider:HUISlider = new HUISlider(uiContainer, 100, 60, "Speed", speedChangeHandler);
            speedSlider.minimum = 0.5;
            speedSlider.maximum = 2;
            speedSlider.value = 1.5;
            speedSlider.width = 250;
            var focalLengthSlider:HUISlider = new HUISlider(uiContainer, 100, 80, "Camera's focalLength", focalLengthChangeHandler);
            focalLengthSlider.minimum = 100
            focalLengthSlider.maximum = 1500;
            focalLengthSlider.value = 400;
            focalLengthSlider.width = 250;
            new Label(uiContainer, 100, 10, "Camera's Target");
            var targetBox:ComboBox = new ComboBox(uiContainer, 180, 10, "cockpit", ["cockpit", "funnel_1", "none"]);
            targetBox.width = 118;
            targetBox.addEventListener(Event.SELECT, targetSelectHandler);
        }
        private function focalLengthChangeHandler(e:Event):void 
        {
            _camera.focalLength = HUISlider(e.currentTarget).value;
        }
        private function targetSelectHandler(e:Event):void 
        {
            var index:int = ComboBox(e.currentTarget).selectedIndex;
            trace( "index : " + index );
            switch (index)
            {
                case 0:
                {
                    _camera.target = _cockpit;
                    _iTween.play();
                    break;
                }
                case 1:
                {
                    _camera.target = _funnels[0];
                    _iTween.play();
                    break;
                }
                case 2:
                {
                    _camera.target = null;
                    _camera.z = -3000;
                    _iTween.stop();
                    break;
                }
            }
        }
        private function speedChangeHandler(e:Event):void 
        {
            _speed = HUISlider(e.currentTarget).value;
        }
        
        private function funnelLengthChangeHandler(e:Event):void 
        {
            _funnelCurrentLength = HUISlider(e.currentTarget).value;
            var i:int;
            for ( i = 0; i < _funnelLength; i++)
            {
                if (_funnels[i].index != -1) _scene.removeChild(_funnels[i]);
                if (i < _funnelCurrentLength)
                {
                    _scene.addChild(_funnels[i]);
                }
            }
        }
        private function shootClickHandler(e:MouseEvent):void 
        {
            for (var i:int = 0; i < _funnelCurrentLength; i++)
            {
                Beam3D(_beams[i]).shoot(Funnel3D(_funnels[i]).angleVector3D,new Vector3D(_funnels[i].x,_funnels[i].y,_funnels[i].z));
            }
        }
    }
}


import flash.display.*;
import flash.events.*;
import flash.filters.ColorMatrixFilter;
import flash.filters.GlowFilter;
import flash.geom.Matrix3D;
import flash.geom.PerspectiveProjection;
import flash.geom.Utils3D;
import flash.geom.Vector3D;

//3D空間管理
class Scene3D
{
    private var _container:DisplayObjectContainer;
    private var _camera :Camera3D;
    private var _object3Ds:Vector.<Object3D> = new Vector.<Object3D>();
    
    public function Scene3D( container:DisplayObjectContainer, camera:Camera3D,stage:Stage = null)
    {
        _container = container;
        _camera = camera;
        _container.addEventListener( Event.ENTER_FRAME, enterfameHandler );
    }

    private function enterfameHandler(e:Event):void 
    {
        render();
    }
    //3Dオブジェクトを表示リストに追加
    public function addChild( obj3D :Object3D ) :Object3D
    {
        _object3Ds.push( obj3D );
        obj3D.index = _object3Ds.length - 1;
        _container.addChild(obj3D.view);
        return obj3D;
    }
    //3Dオブジェクトを表示リストから破棄
    public function removeChild( obj3D :Object3D ) :void
    {
        if (obj3D.index < 0) return;
        
        _container.removeEventListener( Event.ENTER_FRAME, enterfameHandler );
        
        var length:int = _object3Ds.length;
        
        for (var i:int = 0; i < length; i++)
        {
            if (_object3Ds[i].index == obj3D.index)
            {
                _object3Ds[i].index = -1;
                _container.removeChild(_object3Ds[i].view);
                _object3Ds.splice(i, 1);
                length = _object3Ds.length;
                for (i = 0; i < length; i++)
                {
                    _object3Ds[i].index = i;
                }
                _container.addEventListener( Event.ENTER_FRAME, enterfameHandler );
                return;
            }
        }
    }
    
    public function render():void
    {
        var length:uint = _object3Ds.length;
        var cameraMatrix3D:Matrix3D = _camera.getMatrix3D();
        var cameraVector3D:Vector3D = _camera.getVector3D();
        
        var i:int;
        for (i = 0; i < length; i++)
        {
            //3Dオブジェクトのカメラからの距離を計算
            _object3Ds[i].setDistance(cameraVector3D);
        }
        //3Dオブジェクト単位でのZソート
        _object3Ds.sort(compareFunction);
        
        //カメラの変換座標を取得
        for (i = 0; i < length; i++)
        {
            var vec3D:Vector3D = _object3Ds[i].getVector3DForInverseY();
            vec3D = cameraMatrix3D.transformVector(vec3D);
            
            //カメラの方向からみて後ろにあるオブジェクトは描画しない
            if (vec3D.z >= (_object3Ds[i].radius + _camera.focalLength/2)) _object3Ds[i].render(_camera);
            else _object3Ds[i].clear();
            
            //表示オブジェクトの並び変え
            _container.setChildIndex(_object3Ds[i].view, i);
        }
    }
    //sort用のfunciton
    private function compareFunction(x:Object3D, y:Object3D):Number
    { 
        return y.cameraDistance - x.cameraDistance;//値が小さい順 
    }
    
}

//3Dオブジェクトの基本クラス（抽象クラス）
class Object3D
{
    protected var _matrix3D:Matrix3D = new Matrix3D();
    protected var _vector3D:Vector3D = new Vector3D();
    protected var _vector3DInverseY:Vector3D = new Vector3D();
    
    public var x:Number = 0;
    public var y:Number = 0;
    public var z:Number = 0;
    
    public var rotationX:Number = 0;
    public var rotationY:Number = 0;
    public var rotationZ:Number = 0;

    public var scaleX:Number = 1;
    public var scaleY:Number = 1;
    public var scaleZ:Number = 1;
    
    public var view:DisplayObject;
    
    public var cameraDistance:Number = 0;
    public var radius:Number = 0;
    
    public var index:int = -1;
    
    public function getVector3D():Vector3D
    {
        _vector3D.x = x;
        _vector3D.y = y;
        _vector3D.z = z;
        return _vector3D;
    }
    public function getVector3DForInverseY():Vector3D
    {
        _vector3DInverseY.x = x;
        _vector3DInverseY.y = -y;
        _vector3DInverseY.z = z;
        return _vector3DInverseY;
    }
    
    //オブジェクトのプロパティから変換座標を生成
    public function getMatrix3D():Matrix3D
    {
        _matrix3D.identity();
        _matrix3D.appendTranslation(x, -y, z);
        _matrix3D.appendScale(scaleX, scaleY, scaleZ);
        _matrix3D.appendRotation(rotationZ, Vector3D.Z_AXIS);
        _matrix3D.appendRotation(rotationY, Vector3D.Y_AXIS);
        _matrix3D.appendRotation(rotationX, Vector3D.X_AXIS);
        return _matrix3D;
    }
    
    //カメラからの距離を計算して保持
    public function setDistance(cameraVector3D:Vector3D):void
    {
        var distanceX:Number = x - cameraVector3D.x;
        var distanceY:Number = y - cameraVector3D.y;
        var distanceZ:Number = z - cameraVector3D.z;
        cameraDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ);
    }
    
    //override用
    public function render(camera:Camera3D):void { };
    public function clear():void { };
    public function get matrix3D():Matrix3D { return _matrix3D };
}

//3Dメッシュ用の基本クラス(抽象クラス）
class DisplayObject3D extends Object3D
{
    public var bmd:BitmapData;
    public var voutVector:Vector.<Number> = new Vector.<Number>();
    public var vertices2D:Vector.<Number> = new Vector.<Number>();

    public var container:DisplayObjectContainer;
        
    public var indices:Vector.<int>;
    public var vertices:Vector.<Number>;
    public var uvtData:Vector.<Number>;
    
    public function DisplayObject3D( vertices:Vector.<Number>, indices:Vector.<int>, uvtData:Vector.<Number>, bmd:BitmapData = null )
    {
        this.vertices = vertices;
        this.indices = indices;
        this.uvtData = uvtData;
        
        this.view = new Shape();
        
        if (bmd) this.bmd = bmd;
        else this.bmd = null;
    }
    
    public override function render(camera:Camera3D):void
    {
        //可視化
        view.visible = true;
        
        //Vectorの初期化
        vertices2D.length = 0;
        voutVector.length = 0;
        
        //頂点情報を自分自身のプロパティ(変換行列)で変換
        getMatrix3D().transformVectors(vertices, voutVector);
        //カメラの変換行列で変換しつつPerspectiveのついた2次元座標を取得
        Utils3D.projectVectors(camera.matrix3D, voutVector, vertices2D, uvtData);
        
        //ポリゴンを表面だけ描画
        var graphic:Graphics = Shape(view).graphics;
        graphic.clear();
        if(bmd) graphic.beginBitmapFill(bmd, null, false, true);
        else graphic.lineStyle(1, 0xFF0000);
        graphic.drawTriangles(vertices2D, indices, uvtData,TriangleCulling.NEGATIVE);
        graphic.endFill();
    }
    public override function clear():void
    {
        //不可視化
        view.visible = false;
        Shape(view).graphics.clear();
    }
}

//ビルボード的3Dオブジェクト
class BillBoard3D extends Object3D
{
    public function BillBoard3D(view:DisplayObject)
    {
        this.view = view;
    }
    public override function render(camera:Camera3D):void
    {
        //可視化
        view.visible = true;
        
        //位置情報をVector3Dにセット
        _vector3D.x = x;
        _vector3D.y = y;
        _vector3D.z = z;
        
        //カメラの変換行列で位置情報を変換
        var v3D:Vector3D = camera.matrix3DForBillBoard.transformVector(_vector3D);
        //拡大率となる値を保持
        v3D.w = (camera.focalLength + v3D.z) / camera.focalLength;
        //パースペクティブを適応
        v3D.project();
        
        view.x = v3D.x;
        view.y = v3D.y;
        view.scaleX = view.scaleY = 1 / v3D.w;
        
        view.rotationZ = rotationZ;
        view.rotationY = rotationY;
        view.rotationX = rotationX;
    }    
    public override function clear():void
    {
        //不可視化（Graphicのクリアはしない）
        view.visible = false;
    }
}

//Sphere的なメッシュ
class Ball3D extends DisplayObject3D
{
    public function Ball3D(radius:int = 100, facesV:int = 4, facesH:int = 4, bmd:BitmapData = null )
    {
        this.radius = radius;
        
        if (bmd) this.bmd = bmd;
        else this.bmd = null;
        
        vertices = new Vector.<Number>();
        indices = new Vector.<int>();
        uvtData = new Vector.<Number>();
        
        var pi:Number = Math.PI;
        for (var i:uint = 0; i <= facesV; i++) 
        {
            var iV:Number = i / facesV;
            var cosV:Number = Math.cos(iV * pi);
            var sinV:Number = Math.sin(iV * pi);
            
            for (var ii:uint = 0; ii <= facesH; ii++)
            {
                var iiH:Number = ii / facesH;
                var cosH:Number = Math.cos(iiH * 2 * pi);
                var sinH:Number = Math.sin(iiH * 2 * pi);
                vertices.push(cosH * sinV * radius, -cosV * radius, sinH * sinV * radius);
                uvtData.push(iiH, iV, 0);
                
                if (ii < facesH && i < facesV)
                {
                    var i1:uint = i * (facesH + 1) +  ii;
                    var i2:uint = (i + 1) * (facesH + 1) + ii;
                    indices.push(i1, i2, i1 + 1,i1+1, i2, i2 + 1);
                }
            }
        }
        super(vertices, indices, uvtData ,this.bmd);
    }
}

class Beam3D extends DisplayObject3D
{
    private var _speed:int = 300;
    private var _angle:Vector3D;
    
    public function Beam3D(w:int, d:int)
    {
        radius = Math.sqrt(d * d + w * w) / 2;
        
        indices = new Vector.<int>();
        uvtData = new Vector.<Number>();
        vertices = new Vector.<Number>();
        
        //頂点座標の登録
        vertices.push( -w, 0, 0);//0
        vertices.push( w, 0, 0);//1
        vertices.push( w, 0, d);//2
        vertices.push( -w, 0, d);//3
        
        addRectangleIndices(indices, 0, 1, 2, 3);
        
        uvtData = new Vector.<Number>();
        //
        super(vertices, indices, uvtData);
        view.filters = [new GlowFilter(0xFFFF00, 1, 32, 32, 2, 2)];
        view.alpha = 0;
    }
    //
    public function shoot(angle:Vector3D,position:Vector3D ):void
    {
        if (! angle) return;
        
        _angle = angle;
        view.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
        view.addEventListener(Event.ENTER_FRAME, enterFrameHandler);
        x = position.x;
        y = position.y;
        z = position.z;
        view.alpha = 1;
        view.visible = true;
    }
    
    private function enterFrameHandler(e:Event):void 
    {
        if (view.alpha < 0) 
        {
            view.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            view.visible = false;
        }
        x += _angle.x * _speed;
        y += _angle.y * _speed;
        z += _angle.z * _speed;
        view.alpha -= 0.1;
    }
    private function addRectangleIndices(indices:Vector.<int>,number0:uint, number1:uint, number2:uint, number3:uint):void 
    {
        indices.push(number0, number1, number3);
        indices.push(number3,number1,number2);
    }
    public override function render(camera:Camera3D):void
    {
        if (!_angle) return;
        
        view.visible = true;
        
        vertices2D.length = 0;
        voutVector.length = 0;
        
        var thetaY:Number = Math.atan2(_angle.x, _angle.z) *  180 / Math.PI * 1;
        var sin:Number = _angle.y / _angle.length;
        var thetaX:Number = Math.asin(sin) * 180 / Math.PI;
        rotationX = thetaX;
        rotationY = thetaY;
        _matrix3D.identity();
        _matrix3D.prependTranslation(x, -y, z);
        _matrix3D.prependScale(scaleX, scaleY, scaleZ);
        _matrix3D.prependRotation(rotationY, Vector3D.Y_AXIS);
        _matrix3D.prependRotation(rotationX, Vector3D.X_AXIS);
        
        _matrix3D.transformVectors(vertices, voutVector);
        Utils3D.projectVectors(camera.matrix3D, voutVector, vertices2D, uvtData);
        
        var graphic:Graphics = Shape(view).graphics;
        graphic.clear();
        graphic.beginFill(0xFFFF00);
        graphic.drawTriangles(vertices2D, indices);
        graphic.endFill();
    }
}

class Funnel3D extends DisplayObject3D
{
    private var _polygonLength:int;
    private var _unitIndex:Vector.<int> = new Vector.<int>([0, 1, 2]);
    private var _polygonObjVector:Vector.<Object>;
    
    public var target:Object3D;
    public var angleVector3D:Vector3D;
    public var speedRatio:Vector3D = new Vector3D();
    public var ratio:Vector3D = new Vector3D();
    
    public function Funnel3D(w:int,h:int,d:int,bmd:BitmapData = null)
    {
        if (Math.min(w, h) > d) this.radius = Math.sqrt(w * w + h * h);
        else if(Math.min(h,d ) > w) this.radius = Math.sqrt(d * d + h * h);
        else if (Math.min(d , w) > h) this.radius = Math.sqrt(d * d + w * w);
        else this.radius = Math.sqrt(d * d + w * w);
        this.radius =  200;
        
        //動きの個性
        speedRatio.x = Math.random() * 300 + 50;
        speedRatio.y = Math.random() * 300 + 50;
        speedRatio.z = Math.random() * 300 + 50;
        ratio.x = 0.02 + Math.random() * 0.05;
        ratio.y = 0.02 + Math.random() * 0.05;
        ratio.z = 0.02 + Math.random() * 0.05;

        vertices = new Vector.<Number>();
        indices = new Vector.<int>();
        uvtData = new Vector.<Number>();
        
        //頂点座標の登録
        vertices.push(-15,35,-60) //0
        vertices.push(15,35,-60) //1
        vertices.push(20,15,-100) //2
        vertices.push(-20,15,-100) //3
        vertices.push(-10,15,100) //4
        vertices.push(10,15,100) //5

        vertices.push(-20,-15,-100) //6
        vertices.push(20, -15, -100) //7
        vertices.push(15, -35,-60) //8
        vertices.push(-15,-35,-60) //9
        vertices.push(-10, -15, 100) //10
        vertices.push(10, -15, 100) //11

        vertices.push(-20,15,-90) //12
        vertices.push(20,15,-90) //13
        vertices.push(20,-15,-90) //14
        vertices.push( -20, -15, -90) //15
        
        vertices.push(10,15,100) //16(5)
        vertices.push( -10, 15, 100) //17(4)
        vertices.push(10, -15, 100) //18(11)
        vertices.push(-10, -15, 100) //19(10)
        vertices.push( -20, 15, -90) //20(12)
        vertices.push( -20, -15, -90) //21(15)
        vertices.push(-10,15,100) //22(4)
        vertices.push(10,15,100) //23(5)
        vertices.push(-10, -15, 100) //24(10)
        vertices.push(10, -15, 100) //25(11)
                
        uvtData.push(1/4,1/5,0);//0
        uvtData.push(2/4,1/5,0);//1
        uvtData.push(2/4,2/5,0);//2
        uvtData.push(1/4,2/5,0);//3
        
        uvtData.push(1 / 4, 0, 0);//4
        uvtData.push(2 / 4, 0, 0);//5
        
        uvtData.push(1/4,3/5,0);//6
        uvtData.push(2/4,3/5, 0);//7
        uvtData.push(2/4, 4/5, 0);//8
        uvtData.push(1/4, 4/5, 0);//9
        
        uvtData.push(1/4, 1, 0);//10
        uvtData.push(2 / 4, 1, 0);//11
        
        uvtData.push(1, 2/5, 0);//12
        uvtData.push(3/4,2/5, 0);//13
        uvtData.push(3/4, 3/5, 0);//14
        uvtData.push(1, 3 / 5, 0);//15
        
        //
        uvtData.push(3/4, 1/5, 0);//16
        uvtData.push(1, 1/5, 0);//17
        uvtData.push(3/4, 4/5, 0);//18
        uvtData.push(1, 4/5, 0);//19
        uvtData.push(0, 2/5, 0);//20
        uvtData.push(0, 3 / 5, 0);//21
        
        //
        uvtData.push(0, 2/5, 0);//22
        uvtData.push(3/4, 2/5, 0);//23
        uvtData.push(0, 3/5, 0);//24
        uvtData.push(3 / 4, 3 / 5, 0);//25
        
        addRectangleIndices(indices, 0, 1, 2, 3);
        addTriangleIndices(indices, 1,23,2);
        addRectangleIndices(indices, 1,0,4,5);
        addTriangleIndices(indices, 0,3,22);
        addRectangleIndices(indices, 16, 17, 12, 13);

        addRectangleIndices(indices, 3, 2, 7, 6);
        addRectangleIndices(indices, 2, 13, 14, 7);
        addRectangleIndices(indices, 13, 12, 15, 14);
        addRectangleIndices(indices, 20, 3, 6, 21);

        addRectangleIndices(indices, 6, 7, 8, 9);
        addTriangleIndices(indices, 7,25,8);
        addRectangleIndices(indices, 9, 8, 11, 10);
        addTriangleIndices(indices, 6,9,24);
        addRectangleIndices(indices, 14, 15, 19, 18);

        super(vertices, indices, uvtData, bmd);
        
        //ポリゴン数
        _polygonLength = indices.length / 3;
    }
    
    public override function render(camera:Camera3D):void
    {
        view.visible = true;

        vertices2D.length = 0;
        voutVector.length = 0;
        
        if (target)
        {
            var targetVector3D:Vector3D = target.getVector3D();
            var v3D:Vector3D = targetVector3D.subtract(getVector3D());
            var thetaY:Number = Math.atan2(v3D.x, v3D.z) *  180 / Math.PI * 1;
            var sin:Number = v3D.y / v3D.length;
            var thetaX:Number = Math.asin(sin) * 180 / Math.PI;
            rotationX = thetaX;
            rotationY = thetaY;
            _matrix3D.identity();
            _matrix3D.prependTranslation(x, -y, z);
            _matrix3D.prependScale(scaleX,scaleY,scaleZ);
            _matrix3D.prependRotation(rotationY, Vector3D.Y_AXIS);
            _matrix3D.prependRotation(rotationX, Vector3D.X_AXIS);
            
            angleVector3D = v3D;
            angleVector3D.normalize();
        }
        else
        {
            _matrix3D = getMatrix3D();
        }        
        _matrix3D.transformVectors(vertices, voutVector);
        Utils3D.projectVectors(camera.matrix3D, voutVector, vertices2D, uvtData);
        
        var i:int, ii:int;
        //ポリゴン単位でデータを作る
        _polygonObjVector = new Vector.<Object>();
        for ( i = 0; i < _polygonLength; i++)
        {
            var x:Number, y:Number, z:Number;
            x = y = z = 0;
            var polygonObj:Object = { };
            polygonObj.indices = new Vector.<int>();
            //下のポリゴンから順にインデックス番号を取り出す
            polygonObj.indices[0] = indices[i * 3 + 0];//頂点1
            polygonObj.indices[1] = indices[i * 3 + 1];//頂点2
            polygonObj.indices[2] = indices[i * 3 + 2];//頂点3
            
            polygonObj.vertices = new Vector.<Number>();
            polygonObj.uvtData = new Vector.<Number>();
            //各頂点のx,y,z成分を抽出
            for ( ii = 0; ii < 3; ii++)
            {
                x += voutVector[polygonObj.indices[ii]*3 + 0];
                y += voutVector[polygonObj.indices[ii]*3 + 1];
                z += voutVector[polygonObj.indices[ii]*3 + 2];
                
                polygonObj.vertices.push(vertices2D[polygonObj.indices[ii] * 2 + 0]);
                polygonObj.vertices.push(vertices2D[polygonObj.indices[ii] * 2 + 1]);
                
                polygonObj.uvtData.push(uvtData[polygonObj.indices[ii] * 3 + 0]);
                polygonObj.uvtData.push(uvtData[polygonObj.indices[ii] * 3 + 1]);
                polygonObj.uvtData.push(uvtData[polygonObj.indices[ii] * 3 + 2]);
            }
            polygonObj.distance = Vector3D.distance(camera.getVector3D(), new Vector3D(x / 3, y / 3, z / 3));
            _polygonObjVector.push(polygonObj);
        }
        _polygonObjVector.sort(compareFunction);
        
        var graphic:Graphics = Shape(view).graphics;
        graphic.clear();
        if(bmd) graphic.beginBitmapFill(bmd, null, false, true);
        else graphic.lineStyle(1,0xFF0000);
        
        for (i = 0; i < _polygonLength; i++)
        {
            var obj:Object = _polygonObjVector[i];
            graphic.drawTriangles(obj.vertices, _unitIndex, obj.uvtData,TriangleCulling.POSITIVE);
        }
        graphic.endFill();
    }
    private function compareFunction(x:Object, y:Object):Number
    { 
        return y.distance - x.distance;//値が小さい順 
    }
    
    private function addRectangleIndices(indices:Vector.<int>,number0:uint, number1:uint, number2:uint, number3:uint):void 
    {
        indices.push(number0, number1, number3);
        indices.push(number3,number1,number2);
    }
    private function addTriangleIndices(indices:Vector.<int>,number0:uint, number1:uint, number2:uint):void 
    {
        indices.push(number0, number1, number2);
    }
}

//ビルボード用の星
class Ball extends Shape
{
    public function Ball(radius:int = 1, color:int = 0XFFCC00)
    {
        graphics.clear();
        graphics.beginFill(color);
        graphics.drawCircle( 0, 0, radius );
        graphics.endFill();
        var matrix:Array = [
            1, 0, 0, 0, 200, 
            0, 1, 0, 0, 200, 
            0, 0, 1, 0, 200, 
            0, 0, 0, 1, 0
        ];
        this.filters = [new ColorMatrixFilter(matrix), new GlowFilter(0x99CCFF, 1, 32, 32, 2, 2)];
        this.visible = false;
    }
}

//カメラクラス
class Camera3D extends Object3D
{
    private var _focalLength:Number;
    private var _perspectiveProjection:PerspectiveProjection;
    private var _perspectiveMatrix3D:Matrix3D = new Matrix3D();
    
    public var target:Object3D;
    public var matrix3DForBillBoard:Matrix3D;
    
    public function Camera3D(container:DisplayObjectContainer,focalLength:Number = 300)
    {
        _focalLength = focalLength;
        z = -focalLength;
        //パースペクティブを生成
        container.transform.perspectiveProjection = new PerspectiveProjection();
        _perspectiveProjection = container.transform.perspectiveProjection;
        //フォーカスとZ初期値を一致することで1/1表示
        _perspectiveProjection.focalLength = focalLength;
        
        _perspectiveMatrix3D = _perspectiveProjection.toMatrix3D();
    }
    public override function getMatrix3D():Matrix3D
    {
        _matrix3D.identity();
        
        var rotationX:Number = -this.rotationX;
        var rotationY:Number = -this.rotationY;
        var rotationZ:Number = -this.rotationZ;
        
        //オイラー角で計算
        if (target)
        {
            var targetVector3D:Vector3D = target.getVector3D();
            var v3D:Vector3D = targetVector3D.subtract(getVector3D());
            var thetaY:Number = Math.atan2(v3D.x, v3D.z) *  180 / Math.PI * -1;
            var sin:Number = v3D.y / v3D.length;
            var thetaX:Number = -Math.asin(sin) * 180 / Math.PI;
            rotationX = thetaX;
            rotationY = thetaY
            _matrix3D.appendRotation(rotationZ, Vector3D.Z_AXIS);
            _matrix3D.appendRotation(rotationY, Vector3D.Y_AXIS);
            _matrix3D.appendRotation(rotationX, Vector3D.X_AXIS);
        }    
        else
        {
            _matrix3D.appendRotation(rotationZ, Vector3D.Z_AXIS);
            _matrix3D.appendRotation(rotationY, Vector3D.Y_AXIS);
            _matrix3D.appendRotation(rotationX, Vector3D.X_AXIS);
        }
        _matrix3D.prependTranslation( -x, y, -z);
        
        matrix3DForBillBoard = _matrix3D.clone();
        _matrix3D.append(_perspectiveMatrix3D);
        return _matrix3D;
    }
    
    public function get focalLength():Number 
    {
        return _focalLength;
    }
    
    public function set focalLength(value:Number):void 
    {
        _focalLength = value;
        _perspectiveProjection.focalLength = _focalLength;
        _perspectiveMatrix3D = _perspectiveProjection.toMatrix3D();
    }
}