function Mouse(id, target){

	var self = this;

	// Properties
	self.id = id;
	self.target = target;
	self.x = 0;
	self.y = 0;
	self.pressed = false;

	// Events!
	var _onmousedown = function(event){
		_onmousemove(event);
		Mouse.pressed = true;
		publish(self.id+"-mousedown");
	};
	var _onmousemove = function(event){
		Mouse.x = event.offsetX;
		Mouse.y = event.offsetY;
		publish(self.id+"-mousemove");
	};
	var _onmouseup = function(){
		Mouse.pressed = false;
		publish(self.id+"-mouseup");
	};

	// Add events!
	target.onmousedown = _onmousedown;
	target.onmousemove = _onmousemove;
	window.onmouseup = _onmouseup;

	// TOUCH.
	var _onTouchMove;
	target.addEventListener("touchstart",function(event){
		_onTouchMove(event);
	    Mouse.pressed = true;
		publish(self.id+"-mousedown");
	},false);
	target.addEventListener("touchmove", _onTouchMove=function(event){

		Mouse.x = event.changedTouches[0].clientX - target.offsetLeft;
		Mouse.y = event.changedTouches[0].clientY - target.offsetTop;
		if(Mouse.x<0) Mouse.x=0;
		if(Mouse.y<0) Mouse.y=0;
		if(Mouse.x>target.clientWidth) Mouse.x=target.clientWidth;
		if(Mouse.y>target.clientHeight) Mouse.y=target.clientHeight;
		//console.log(target);
		publish(self.id+"-mousemove");
		event.preventDefault();
		
	},false);
	document.body.addEventListener("touchend",function(event){
	    Mouse.pressed = false;
		publish(self.id+"-mouseup");
	},false);

};