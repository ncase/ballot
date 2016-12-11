Loader.onload = function(){

	// Properties
	var width = 1500;
	var height = 400;

	// RETINA canvas, whatever.
	var canvas = document.createElement("canvas");
	canvas.width = width*2;
	canvas.height = height*2;
	canvas.style.width = width+"px";
	canvas.style.height = height+"px";
	var ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);

	// Mouse!
	var mouse = new Mouse("splash", canvas);

	// 2D GRID of 50 each. Random state!
	var grid = [];
	var SIZE = 25;
	var w = width/SIZE;
	var h = height/SIZE;
	for(var y=0; y<h; y++){
		var row = [];
		grid.push(row);
		for(var x=0; x<w; x++){
			var state = Math.floor(Math.random()*3); // RANDOM.
			row.push(state);
		}	
	}

	// HACK: Update... and draw.
	var _getNeighbors = function(initX, initY, targetState){

		// All neighbors within grid's bounds.
		// and of the target state.
		var neighbors = [];
		for(var y=initY-1; y<=initY+1; y++){
			if(y<0) continue;
			if(y>h-1) continue; 
			for(var x=initX-1; x<=initX+1; x++){
				if(x<0) continue;
				if(x>w-1) continue;
				var state = grid[y][x];
				if(targetState==-1 || state==targetState){
					neighbors.push([x,y]);
				}
			}	
		}

		// Gimme.
		return neighbors;

	};
	var _update = function(){

		if(!window.isOnScreen) return;

		// Ordered pairs...
		var positions = [];
		for(var y=0; y<h; y++){
			for(var x=0; x<w; x++){
				positions.push([x,y]);
			}
		}

		// Scrambled order!
		positions = positions.sort(function(){
			return(Math.random()<0.5);
		});

		// In random update order, if there's a cell of the
		// right state nearby... change THAT puppy.
		// 0 eats 1, 1 eats 2, 2 eats 0.
		for(var i=0;i<positions.length;i++){

			// Get the cell...
			var pos = positions[i];
			var x = pos[0];
			var y = pos[1];
			var state = grid[y][x];

			// Get the target state!
			var targetState;
			if(state==0) targetState=1;
			if(state==1) targetState=2;
			if(state==2) targetState=0;

			// Get a RANDOM neighbor who fits
			var neighbors = _getNeighbors(x,y,targetState);
			if(neighbors.length==0) continue; // fuggedaboutit
			var target = neighbors[Math.floor(Math.random()*neighbors.length)];

			// CHANGE 'EM.
			x = target[0];
			y = target[1];
			grid[y][x] = state;

		}

		// RANDOMLY SCRAMBLE NEAR THE MOUSE.
		//Mouse.x = Mouse.x || 0;
		//Mouse.y = Mouse.y || 0;
		if(Mouse.x && Mouse.y){
			var x = Math.floor(Mouse.x/SIZE);
			var y = Math.floor(Mouse.y/SIZE);
			var neighbors = _getNeighbors(x,y,-1);
			for(var i=0;i<neighbors.length;i++){
				var pos = neighbors[i]
				x = pos[0];
				y = pos[1];
				grid[y][x] = Math.floor(Math.random()*3); // RANDOM.
			}
		}

		// draw!
		_draw();

	};
	setInterval(_update,50);

	// DRAW.
	var img = new Image();
	img.src = "vote.png";
	var _draw = function(){

		// Clear!
		ctx.clearRect(0,0,canvas.width,canvas.height);

		// Draw 
		for(var y=0; y<h; y++){
			for(var x=0; x<w; x++){
				
				var state = grid[y][x];

				ctx.drawImage(
					img, // image!
					state*SIZE*2, 0, SIZE*2, SIZE*2, // source
					x*SIZE*2, y*SIZE*2, SIZE*2, SIZE*2 // destination
				);

			}	
		}

	};
	_draw();

};
Loader.load(["vote.png"]);

window.isOnScreen = true;
window.addEventListener("message", function(event){
	window.isOnScreen = event.data.isOnScreen;
}, false);