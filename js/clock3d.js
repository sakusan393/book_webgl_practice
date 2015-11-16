// JavaScript Document

var Stage = function( id,camera ){
	
    this.id = id;
    this.canvas;
    this.timer;
    this.viewArray = [];
    this.triangles = [];
	this.camera = camera;
	this.line;

    this.stageWidth = 1465;
    this.stageHeight = 1465;
    this.angleX = 0;
    this.angleY = 0;
    this.timerDelay = 33;
	
	this.zSortList = [];
	
	this.count = 0;

    this.init();
};

Stage.prototype = {
    // constructor
    init: function()
	{
		//canvasを取得
        var node = document.getElementById( this.id );
		//canvas要素じゃなかったら終了
        if(!node.getContext) return;
		
		//コンテキストを取得
        this.canvas = node.getContext("2d");
		//MouseMoveイベントを追加
 		Base.addevent( node, "mousemove", Base.getMousePos);
		
		this.line = new Line(this.canvas);
    }
	,
	//EnterFrame開始
    start: function()
	{
        this.enterFrame();
       this.internal = setInterval( Base.bind( this, this.enterFrame ), this.timerDelay );
       //this.internal = setInterval(this.enterFrame, this.timerDelay );
    }
	,
	//EnterFrame停止
    stop: function()
	{
        clearInterval( this.internal );
    }
	,
	//エンターフレーム時の処理
    enterFrame: function()
	{
		this.render(); 
    }
	,
	//canvasへのレンダリング処理
    render: function()
	{
		this.count += 12 * Math.PI / 180;
		this.camera.rotationY = (Base.mouseX - this.stageWidth/2) * Math.PI / 180 * 30;
		this.camera.rotationX = (Base.mouseY - this.stageWidth/2) * Math.PI / 180 * 30;

		this.canvas.fillStyle = "rgba(0,0,0,0.2)";
        this.canvas.fillRect( 0, 0, this.stageWidth, this.stageHeight );
		//this.canvas.clearRect( 0, 0, this.stageWidth, this.stageHeight );
		
		this.zSortList = [];
		var camXCos = Math.cos( Math.PI * this.camera.rotationX / 180);
        var camXSin = Math.sin( Math.PI * this.camera.rotationX / 180);
        var camYCos = Math.cos( Math.PI * this.camera.rotationY / 180);
        var camYSin = Math.sin( Math.PI * this.camera.rotationY / 180);
        var camZCos = Math.cos( Math.PI * this.camera.rotationZ / 180);
        var camZSin = Math.sin( Math.PI * this.camera.rotationZ / 180);
		
		var length = this.viewArray.length;
		var pointArray = [];
		

		for( var i = 0; i < length; i++)
		{
			var obj = this.viewArray[i];
			obj.changePosition();
			
			//各方向のベクトルの大きさを計算
            var tmpX = obj.changeX - this.camera.x;
            var tmpY =  obj.changeY - this.camera.y;
            var tmpZ =  obj.changeZ - this.camera.z;
			
            // X Axis
			var XAxisX = tmpX;
            var XAxisY = ( tmpY*camXCos - tmpZ*camXSin );
            var XAxisZ = ( tmpY*camXSin + tmpZ*camXCos );
            // Y Axis
            var YAxisX = ( XAxisZ*camYSin + XAxisX*camYCos );
            var YAxisY = XAxisY;
            var YAxisZ = ( XAxisZ*camYCos - XAxisX*camYSin );
            // Z Axis 角度変化による新座標の計算
            var ZAxisX = ( YAxisX*camZCos - YAxisY*camZSin );
            var ZAxisY = ( YAxisX*camZSin + YAxisY*camZCos );
            var ZAxisZ = YAxisZ;
			
			var persepective= this.camera.getPersepective( ZAxisZ );
			
			var x = ZAxisX*persepective;
			var y = ZAxisY*persepective;
			
			if(i < 78) pointArray[i] = {x: x,y:y};

			if (this.camera.isInFocus( YAxisY ) ) 
			{
				//スケールの計算（奥行きに相当）
                this.zSortList.push( { z:ZAxisZ, view:obj,tx:x,ty:y,persepective:persepective } );
            }
            else
			{
                //obj.setVisible(false);
            }

		}
         //Zsort
        this.zSortList.sort(prepare);
        l = this.zSortList.length;

        for(var  i=0; i<l; ++i )
		{
            var zobj = this.zSortList[i];
			zobj.view.view.render( zobj.tx, zobj.ty, zobj.persepective);
        }
		
		var prepare =  function(a,b)
		{
			return (b.z-a.z);
		}
		
		this.line.render(pointArray);
		
    }
	,
	addChild:function(view)
	{
		this.viewArray.push(view);
	}
};

/* ------ Camera Class ------------------------------------------*/

var Camera3D = function(  )
{
	this.angle = 30;
	this.focus = 1000;
    this.x = 0;
    this.y = 0;
    this.z = 0;
	this.rotationX = 0;
	this.rotationY = 0;
	this.rotationZ = 0;
	this.w = 465;
	this.h = 465;
};

Camera3D.prototype = 
{

    getPersepective: function( tz )
	{
		return this.focus / (this.focus + tz);
    }
	,
    isInFocus: function(tz)
	{
		var bool = tz > - this.focus;
        return bool;
    }
};



/* ------ DotNumber3D Class ------------------------------------------*/

var DotNumber3D = function(stage,positionData,offsetX, offsetY )
{
	this.length = 13;
	this.timerDelay = 1000;
	this.context = stage.canvas;
	this.count = 0;
	this.offsetX = offsetX;
	this.offsetY = offsetY;
	this.ratioX = 1.5;
	this.ratioY = 1.5;
	
	this.stage = stage;
	this._dotArray = [];
	this._positionArray = positionData.positionArray;
	this._currentPoint;
	
	this.init();

};


DotNumber3D.screenX = 465/2;
DotNumber3D.screenY = 465/2;

DotNumber3D.prototype = 
{
	init:function()
	{
		this._currentPoint = this._positionArray[0];
		
		for(var i = 0; i < this.length; i++)
		{
			this._dotArray[i] = new Dot3D(new Ball(this.context));
			this.stage.addChild(this._dotArray[i]);
		}
		this.setIndex(0);
	}
	,
	enterFrame:function()
	{
		this.count++;
		this.tweenIndex(this.count);
		if(this.count == 9) this.count = -1;
	}
	,
	updatePosition:function()
	{
		for(var i = 0; i < this.length; i++)
		{
			var dot3D = this._dotArray[i];
			dot3D.render();
		}
	}
	,
	setIndex:function(index)
	{
		this._currentPosition = this._positionArray[index];
		for(var i = 0; i < this.length; i++)
		{
			this._dotArray[i].x = this._currentPosition[i].x * this._dotArray[i].view.offsetPositionScale * this.ratioX  + this.offsetX;
			this._dotArray[i].y = this._currentPosition[i].y * this._dotArray[i].view.offsetPositionScale * this.ratioY  + this.offsetY;
			this._dotArray[i].z = 0;
		}
	}
	,
	tweenIndex:function(index)
	{
		for(var i = 0; i < this.length; i++)
		{
			Tween;
			Tween.get(this._dotArray[i],{loop:false})
			.to({x:this._positionArray[index][i].x* this._dotArray[i].view.offsetPositionScale * this.ratioX + this.offsetX
			,y:this._positionArray[index][i].y * this._dotArray[i].view.offsetPositionScale * this.ratioY + this.offsetY }, 400, Ease.backInOut     )
			
		}

	}
};

/* ------ PositionData Class ------------------------------------------*/
var PositionData = function()
{
	this.position = [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:3},{x:0,y:4},{x:1,y:4},{x:2,y:4},{x:2,y:3},{x:2,y:2},{x:2,y:1},{x:2,y:0},{x:1,y:0},{x:0.5,y:0}];
	this.position0 = [{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:3},{x:0,y:4},{x:1,y:4},{x:2,y:4},{x:2,y:3},{x:2,y:2},{x:2,y:1},{x:2,y:0},{x:1,y:0},{x:0.5,y:0}];
	this.position1 = [{x:2,y:0},{x:2,y:0.5},{x:2,y:1},{x:2,y:1.5},{x:2,y:2},{x:2,y:2.5},{x:2,y:3},{x:2,y:3.5},{x:2,y:4},{x:2,y:1},{x:2,y:2},{x:2,y:3},{x:2,y:4}];
	this.position2 = [{x:0,y:0},{x:0.5,y:0},{x:1,y:0},{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:1,y:2},{x:0,y:2},{x:0,y:3},{x:0,y:4},{x:1,y:4},{x:1.5,y:4},{x:2,y:4}];
	this.position3 = [{x:0,y:0},{x:0.5,y:0},{x:1,y:0},{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:1,y:2},{x:0,y:2},{x:2,y:3},{x:2,y:4},{x:1,y:4},{x:0.5,y:4},{x:0,y:4}];
	this.position4 = [{x:0,y:0},{x:0,y:0.5},{x:0,y:1},{x:0,y:2},{x:0.5,y:2},{x:1,y:2},{x:1.5,y:2},{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3},{x:2,y:3.5},{x:2,y:4}];
	this.position5 = [{x:2,y:0},{x:1.5,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0.5,y:2},{x:1,y:2},{x:2,y:2},{x:2,y:3},{x:2,y:4},{x:1,y:4},{x:0,y:4}];
	this.position6 = [{x:2,y:0},{x:1.5,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:3},{x:0,y:4},{x:1,y:4},{x:2,y:4},{x:2,y:3},{x:2,y:2},{x:1,y:2}];
	this.position7 = [{x:0,y:0},{x:0.5,y:0},{x:1,y:0},{x:1.5,y:0},{x:2,y:0},{x:2,y:0.5},{x:2,y:1},{x:2,y:1.5},{x:2,y:2},{x:2,y:2.5},{x:2,y:3},{x:2,y:3.5},{x:2,y:4}];
	this.position8 = [{x:2,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:2,y:3},{x:2,y:4},{x:1,y:4},{x:0,y:4},{x:0,y:3},{x:2,y:1}];
	this.position9 = [{x:1,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3},{x:2,y:4},{x:1,y:4},{x:0.5,y:4},{x:0,y:4}];
	
	this.positionArray = [];
	
	this.init();
}
PositionData.prototype = 
{
	init:function()
	{
		for(var i = 0; i < 10; i++)
		{
			this.positionArray[i] = this["position" + i];
			for(var ii = 0; ii < 13; ii++)
			{
				this.positionArray[i][ii].x = this.positionArray[i][ii].x-1;
				this.positionArray[i][ii].y = this.positionArray[i][ii].y-2;
			}
		}
	}
}
/* ------ Object3D Class ------------------------------------------*/

var Object3D = function()
{
	this.view;
    this.x = 0;
    this.y = 0;
    this.z = 0;
	this.changeX = 0;
	this.changeY = 0;
	this.changeZ = 0;
	
	this.init();
	
};

Object3D.prototype = 
{
	init:function()
	{
	}
};


/* ------ Dot3D Class ------------------------------------------*/

var Dot3D = function( view )
{
	this.view = view;
	this.count = Math.random()*10;
	this.offset = Math.random() * Math.PI/ 180 * 360;
	this.init();
};

Dot3D.prototype = new Object3D();
//オーバーライド
Dot3D.prototype.init = function()
	{
        this.internal = setInterval( Base.bind( this, this.render ), 33 );
	}
Dot3D.prototype.render = function()
	{
		this.count+= 0.5;
		this.view.radius = this.view.radiusDefault + (Math.sin(this.count/2+ this.offset)+ .5) * 5;
		this.view.rotation ++;
    }
Dot3D.prototype.changePosition = function()
	{
		this.changeX = this.x + (Math.random()-0.5) * 15
		this.changeY = this.y + (Math.random()-0.5) * 15
		this.changeZ = this.z + (Math.random()-0.5) * 30
	}


/* ------ Star3D Class ------------------------------------------*/

var Star3D = function( view,x,y,z )
{
	this.view = view;
	this.x = x;
	this.y = y;
	this.z = z;
};

Star3D.prototype = new Object3D();
Star3D.prototype.init = function()
	{
	}
Star3D.prototype.changePosition = function()
	{
		this.changeX = this.x
		this.changeY = this.y
		this.changeZ = this.z
	}
/* ------ Object2D Class ------------------------------------------*/
var Object2D = function(context)
{
	this.context = context;
	this.radiusDefault = 15;
	this.radius = this.radiusDefault;
	this.x = 0;
	this.y = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.rotation = 0;
	this.visible = true;	
	this.init();
}

Object2D.prototype = 
{
	init:function()
	{
	}
	,
	render:function(tx,ty,perspective)
	{
        this.x = tx + DotNumber3D.screenX;
        this.y = ty + DotNumber3D.screenY;
		this.scaleX = this.scaleY = perspective;
		this.alpha = Math.min(1, perspective);				
		
		this.context.beginPath();
		this.context.lineWidth = 1;
		var radius = this.scaleX * this.radius;
		
		var r = 255, g = 255, b = 255;
		this.context.strokeStyle = "rgba("+r+","+g+","+b+"," + this.alpha + ")";
		this.context.fillStyle = "rgba("+r/4+","+g/4+","+b/4+"," + this.alpha + ")";
		this.context.arc(this.x,this.y,Math.abs(radius),(Math.PI/180)*0,(Math.PI/180)*360,false);
		this.context.stroke();
		this.context.fill();		
		 
		this.context.closePath();	
	
	}
}


/* ------ Ball Class ------------------------------------------*/
var Ball = function(context)
{
	this.count = 0;
	this.context = context;
	this.radiusDefault = 15;
	this.radius = this.radiusDefault;
	this.offsetPositionScale;
	
	this.init();
}
Ball.prototype = new Object2D();
Ball.prototype.init= function()
	{
		this.offsetPositionScale =  10 * 2;
	}
Ball.prototype.render= function(tx,ty,perspective)
	{
		this.count+=0.1;
        this.x = tx + DotNumber3D.screenX;
        this.y = ty + DotNumber3D.screenY;
		this.scaleX = this.scaleY = perspective;
		this.alpha = Math.min(1, perspective);	
		
		this.context.beginPath();
		this.context.lineWidth = 10;
		var r = Math.floor((Math.sin(this.count* 0.5)+1)/2*255)
		var g = Math.floor((Math.sin(this.count * 0.2+1)+1)/2*255)
		var b = Math.floor((Math.sin(this.count * 0.7+2)+1)/2*255)
		

		var radius = this.scaleX * this.radius;
		
		if(Math.random()>0.96)
		{
			r *= Math.random();
			g *= Math.random();
			b *= Math.random();
			this.context.strokeStyle = "rgba("+r/2+","+g/2+","+b/2+"," + this.alpha + ")";
			this.context.fillStyle = "rgba("+r/4+","+g/4+","+b/4+"," + this.alpha + ")";
			this.context.arc(this.x,this.y,Math.abs(radius),(Math.PI/180)*0,(Math.PI/180)*360,false);
			this.context.stroke();
			this.context.fill();
		}
		else
		{
			this.context.fillStyle = "rgba("+r+","+g+","+b + "," + this.alpha +")";
			this.context.fillRect(this.x- radius/2,this.y-radius/2,radius,radius);
		}
		
		 
		this.context.closePath();	
	
	}
	
/* ------ Ball Class ------------------------------------------*/
var Star = function(context)
{
	this.context = context;
	this.radiusDefault = 2;
	this.radius = this.radiusDefault;
	this.offsetPositionScale;
	
	this.init();
}
Star.prototype = new Object2D();
Star.prototype.init= function()
	{
	}
Star.prototype.render= function(tx,ty,perspective)
	{
        this.x = tx + DotNumber3D.screenX;
        this.y = ty + DotNumber3D.screenY;
		this.scaleX = this.scaleY = perspective;
		this.alpha = Math.min(1, perspective);	
		
		this.context.beginPath();
		var r = 200;
		var g = 200;
		var b = 255;
		
		var radius = this.scaleX * this.radius;
		
		this.context.fillStyle = "rgba("+r + ","+g+","+b +"," + this.alpha + ")";
		this.context.arc(this.x,this.y,Math.abs(radius),(Math.PI/180)*0,(Math.PI/180)*360,false);
		//this.context.fillRect(this.x- radius/2,this.y-radius/2,radius,radius);
		this.context.fill();		
		//this.context.stroke();
		
				 
		this.context.closePath();	
	
	}

/* ------ Line Class ------------------------------------------*/
var Line = function(context)
{
	this.context = context;
}

Line.prototype = 
{
	render:function(pointArray)
	{	
		this.context.beginPath();
		this.context.lineWidth = 1;
		var r = Math.floor(255 * Math.random());
		var g = Math.floor(255 * Math.random());
		var b = Math.floor(255 * Math.random());
		
		this.context.strokeStyle = "rgba("+r+","+g+","+b+",0.7)";
		var length = pointArray.length;
				
		for(var i=0; i < length; i++)
		{
			if(i==0) this.context.moveTo(pointArray[i].x + DotNumber3D.screenX, pointArray[i].y+ DotNumber3D.screenY);
			this.context.lineTo(pointArray[i].x + DotNumber3D.screenX, pointArray[i].y+ DotNumber3D.screenY);
		}
		this.context.stroke();	
	}
}



/* ------ Base Class ------------------------------------------*/

var Base = {
    mouseX: 465/2
	,
    mouseY: 465/2
	,
    getMousePos: function( e )
	{
        var obj = new Object();
 		if( document.all )
		{
            Base.mouseX = event.x + document.body.scrollLeft;
            Base.mouseY = event.y + document.body.scrollTop;
        }
		else
		{
            Base.mouseX = e.pageX;
            Base.mouseY = e.pageY;
        }
        //return obj;
    }
	,
	//イベントを追加
    addevent: function(node,evt,func)
	{
		//IE以外
        if(node.addEventListener)
		{
            node.addEventListener(evt,func,false);  
        }
		//IEのみ
		else if(node.attachEvent)
		{
            node.attachEvent("on"+evt,func);  
        }
    }
	,
    bind: function()
	{
        var args=[];
		//もし引数があったら
        if(arguments)
		{
			//引数を穂維持
            for(var i=0,n=arguments.length;i<n;i++)
			{
                args.push(arguments[i]);
            }
        }
		//スコープを保持
        var object=args.shift();
		//関数を保持
        var func=args.shift();
		
        return function(event)
		{
            return func.apply(object,[event||window.event].concat(args));
        }
    }
};

/* ------ Clock Class ------------------------------------------*/

var Clock = function(numberArray,camera)
{
	this.numberArray = numberArray;
	this.camera = camera;
	this.length = this.numberArray.length;
	
	this.init();
};

Clock.prototype = 
{
	init:function()
	{
        this.internal = setInterval( Base.bind( this, this.getClock ), 1000 );
	}
	,
    getClock: function()
	{
		var now = new Date();
	
		var hour = now.getHours().toString(); // 時
		var min = now.getMinutes().toString(); // 分
		var sec = now.getSeconds().toString(); // 秒
	
		// 数値が1桁の場合、頭に0を付けて2桁で表示する指定
		if(hour >= 10)
		{ 
			var hour1 = hour.charAt(0);
			var hour0 = hour.charAt(1);
		}
		else
		{
			 hour1 = 0;
			 hour0 = hour;
		}
		if(min >= 10) 
		{
			var  min1 = min.charAt(0);
			var  min0 = min.charAt(1);
		}
		else
		{
			min1 = 0;
			min0 = min;
		}
		if(sec >= 10) 
		{
			 var sec1 = sec.charAt(0);
			 var sec0 = sec.charAt(1);
		}
		else
		{
			sec1 = 0;
			sec0 = sec;
		}
		
		this.numberArray[0].tweenIndex(hour1);
		this.numberArray[1].tweenIndex(hour0);
		this.numberArray[2].tweenIndex(min1);
		this.numberArray[3].tweenIndex(min0);
		this.numberArray[4].tweenIndex(sec1);
		this.numberArray[5].tweenIndex(sec0);
		
    }
};


/* ------ Client ------------------------------------------*/
(function(){ window.onload = function(){
		
		//stageインスタンスを生成
		
		var camera = new Camera3D();
		camera.rotationZ = 0;
		camera.z = -300;
		camera.focus= 500;
        var stage = new Stage("canvas",camera);
		
		
		var positonData = new PositionData();
		var numberArray =  [];
		numberArray[0] = new DotNumber3D(stage,positonData,-270,0);
		numberArray[1] = new DotNumber3D(stage,positonData,-170,0);
		numberArray[2] = new DotNumber3D(stage,positonData,-50,0);
		numberArray[3] = new DotNumber3D(stage,positonData,50,0);
		numberArray[4] = new DotNumber3D(stage,positonData,170,0);
		numberArray[5] = new DotNumber3D(stage,positonData,270,0);
		
		
		var xNum = 5, yNum =5, zNum =5;
		var xInterval =250, yInterval =250, zInterval = 250;
		 for( var i=0; i<xNum; ++i ) {
			for( var j=0; j<yNum; ++j ) {
				for( var k=0; k<zNum; ++k )
				{
					if(Math.random()>0.3)
					{
						var star3d = new Star3D(new Star(stage.canvas)
						,(i-(xNum-1) * 0.5) *xInterval
						,(j-(yNum -1) * 0.5) *yInterval
						,(k-(zNum-1) * 0.5) *zInterval
						);
						stage.addChild(star3d);
					}
				}
			}
		}
		
		var clock = new Clock(numberArray,camera);
		
		var hour = new Date().getHours().toString()

        stage.start();
		
		Ticker.setFPS(33);

}})();33