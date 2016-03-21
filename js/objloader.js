;var ObjLoader = {};
(function() {
	// XHRを使ってOBJファイルを取得する
	var fileCount = 0;
	ObjLoader.load = function(srcFiles, cb) {
		var callback = function() {
			fileCount--;
			if(fileCount == 0) {
				// 全ファイルがロードされたら初期化
				cb();
			}
		};
		var objName = srcFiles.obj.split("/")[1].split(".")[0] + "_obj";
		var mtlName = srcFiles.mtl.split("/")[1].split(".")[0] + "_mtl";
		loadFile(srcFiles.obj, objName, callback);
		loadFile(srcFiles.mtl, mtlName, callback);
	};
	ObjLoader.files = {};
	var loadFile = function(url, name, callback) {
		fileCount++;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4) {
				ObjLoader.files[name] = xhr.responseText;
				callback();
			}
		};
		xhr.open("GET", url, true);
		xhr.send("");
	};
})();
