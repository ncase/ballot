window.Loader = {};
Loader.load = function(imagePaths){

	// When all images loaded, call dat callback
	var assetsToLoad = imagePaths.length;
	var _onAssetLoad = function(){
		assetsToLoad--;
		if(assetsToLoad==0){
			Loader.onload();
		}
	};

	// Load 'em all
	for(var i=0;i<imagePaths.length;i++){
		var img = new Image();
		img.onload = _onAssetLoad;
		img.src = imagePaths[i];
	}

};