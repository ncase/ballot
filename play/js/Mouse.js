function Mouse(id, target){

	var self = this;

	// Properties
	self.id = id;
	self.target = target;
	self.x = 0;
	self.y = 0;
	self.pressed = false;

	// Events!
	var _onmousemove = function(event){
		Mouse.x = event.offsetX;
		Mouse.y = event.offsetY;
		publish(self.id+"-mousemove");
	};
	var _onmousedown = function(event){
		_onmousemove(event);
		Mouse.pressed = true;
		publish(self.id+"-mousedown");
	};
	var _onmouseup = function(){
		Mouse.pressed = false;
		publish(self.id+"-mouseup");
	};

	// Add events! TO DO: WITH TOUCH.
	target.onmousemove = _onmousemove;
	target.onmousedown = _onmousedown;
	window.onmouseup = _onmouseup;

};