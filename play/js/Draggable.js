function Draggable(config){

	var self = this;

	// Passed properties
	self.x = config.x;
	self.y = config.y;
	self.model = config.model;
	self.radius = config.radius || 30;

	self.hitTest = function(x,y){
		var dx = x-self.x;
		var dy = y-self.y;
		var r = self.radius;
		return((dx*dx+dy*dy) < r*r);
	};

	self.moveTo = function(x,y){
		self.x = x+self.offX;
		self.y = y+self.offY;
	};

	self.offX = 0;
	self.offY = 0;
	self.startDrag = function(){
		self.offX = self.x-Mouse.x;
		self.offY = self.y-Mouse.y;
	};

	self.update = function(){
		// TO IMPLEMENT
	};

	self.draw = function(ctx){
		// TO IMPLEMENT
	};

}

function DraggableManager(model){

	var self = this;
	self.model = model;

	// Helper: is Over anything?
	self.isOver = function(){
		for(var i=model.draggables.length-1; i>=0; i--){ // top DOWN.
			var d = model.draggables[i];
			if(d.hitTest(Mouse.x, Mouse.y)){
				return d;
			}
		}
		return null;
	}

	// INTERFACING WITH THE *MOUSE*
	subscribe(model.id+"-mousemove", function(){
		if(Mouse.pressed){
			model.update();
		}else if(self.isOver()){
			// If over anything, grab cursor!
			model.canvas.setAttribute("cursor", "grab");
		}else{
			// Otherwise no cursor
			model.canvas.setAttribute("cursor", "");
		}
	});
	subscribe(model.id+"-mousedown", function(){

		// Didja grab anything? null if nothing.
		Mouse.dragging = self.isOver();

		// If so...
		if(Mouse.dragging){
			Mouse.dragging.startDrag();
			model.update();

			// GrabBING cursor!
			model.canvas.setAttribute("cursor", "grabbing");

		}

	});
	subscribe(model.id+"-mouseup", function(){
		Mouse.dragging = null;
	});

}