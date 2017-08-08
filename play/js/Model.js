/***************************

A MODEL:
- Draggable candidates & voter(s)
- Has to draw & up 'em up & down appropriately.

***************************/

function Model(config){

	var self = this;

	// Properties
	config = config || {};
	self.id = config.id || "model";
	self.size = config.size || 300;
	self.scale = config.scale || 1; // TO DO: actually USE this.
	self.border = config.border || 10;

	// RETINA canvas, whatever.
	var canvas = document.createElement("canvas");
	canvas.setAttribute("class", "interactive");
	canvas.width = canvas.height = self.size*2; // retina!
	canvas.style.width = canvas.style.height = self.size+"px";
	canvas.style.borderWidth = self.border+"px";
	var ctx = canvas.getContext("2d");
	self.canvas = canvas;
	self.ctx = ctx;

	// My DOM: title + canvas + caption
	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "model");
	self.dom.style.width = (self.size+2*self.border)+"px"; // size+2*borders!
	self.title = document.createElement("div");
	self.title.id = "title";
	self.caption = document.createElement("div");
	self.caption.id = "caption";
	self.caption.style.width = self.dom.style.width;
	self.dom.appendChild(self.title);
	self.dom.appendChild(self.canvas);
	self.dom.appendChild(self.caption);

	// MAH MOUSE
	self.mouse = new Mouse(self.id, self.canvas);

	// Draggables
	self.draggables = [];
	self.draggableManager = new DraggableManager(self);

	// Candidates & Voter(s)
	self.candidates = [];
	self.candidatesById = {};
	self.voters = [];
	self.addCandidate = function(id, x, y){
		var candidate = new Candidate({
			model: self,
			id:id, x:x, y:y
		});
		self.candidates.push(candidate);
		self.draggables.push(candidate);
		self.candidatesById[id] = candidate;
	};
	self.addVoters = function(config){
		config.model = self;
		var DistClass = config.dist;
		var voters = new DistClass(config);
		self.voters.push(voters);
		self.draggables.push(voters);
	};

	// Init!
	self.onInit = function(){}; // TO IMPLEMENT
	self.init = function(){
		self.onInit();
		self.update();
	};

	// Reset!
	self.reset = function(noInit){
		self.candidates = [];
		self.candidatesById = {};
		self.voters = [];
		self.draggables = [];
		if(!noInit) self.init();
	};

	// Update!
	self.onUpdate = function(){}; // TO IMPLEMENT
	
	self.calculateYee = function(){
		self.density= 30.0;
		var density = self.density;
		WIDTH = ctx.canvas.width;
		HEIGHT = ctx.canvas.height;
		self.gridx = [];
		self.gridy = [];
		self.gridl = []; 
		self.gridb = []; 
		saveo = {}
		saveo.x = self.yeeobject.x;
		saveo.y = self.yeeobject.y;
		var i=0
		for(var x=0.0, cx=0; x<=WIDTH; x+= density, cx++) {
			for(var y=0.0, cy=0; y<=HEIGHT; y+= density, cy++) {
				self.yeeobject.x = x * .5;
				self.yeeobject.y = y * .5;
				for(var j=0; j<self.voters.length; j++){
					self.voters[j].update();
				}
				self.election(self, {sidebar:false});

				var a = self.color; // updated color
				if (a == "#ccc") {self.gridb[i] = self.colors;}
				self.gridx.push(x);
				self.gridy.push(y);
				self.gridl.push(a);
				// model.caption.innerHTML = "Calculating " + Math.round(x/WIDTH*100) + "%"; // doesn't work yet 
				i++
			}
		}
		self.yeeobject.x = saveo.x;
		self.yeeobject.y = saveo.y;
	}
	
	self.update = function(){
		// calculate yee if its turned on and we haven't already calculated it ( we aren't dragging the yee object)
		if (self.yeeon && Mouse.dragging != self.yeeobject) self.calculateYee()
		
		// Clear it all!
		ctx.clearRect(0,0,canvas.width,canvas.height);

		// Move the one that's being dragged, if any
		if(Mouse.dragging){
			Mouse.dragging.moveTo(Mouse.x, Mouse.y);
		}

		// DRAW 'EM ALL.
		// Draw voters' BG first, then candidates, then voters.

		// Draw axes
		//var background = new Image();
		//background.src = "../play/img/axis.png";
		//ctx.drawImage(background,0,0);
		
		if(self.yeeon){
			ctx.globalAlpha = .9
			var density = self.density;
			for(var k=0;k<self.gridx.length;k++) {
				var ca = self.gridl[k]
				if (ca=="#ccc") { // make stripes instead of gray
					var cb = self.gridb[k]
					var xb = self.gridx[k]-density*.5-1
					var yb = self.gridy[k]-density*.5-1
					var wb = density
					var hb = density
					var hh = 5; // height of stripe
					for (var j=0; j< density/hh; j++) {
						ctx.fillStyle = cb[j % cb.length]
						ctx.fillRect(xb,yb+j*hh,wb,hh);
					}
				} else {
					ctx.fillStyle = self.gridl[k];
					ctx.fillRect(self.gridx[k]-density*.5-1, self.gridy[k]-density*.5-1, density, density);
				}
			}
			ctx.globalAlpha = 1
			// Draw axes
			//var background = new Image();
			//background.src = "../play/img/axis.png";
			// ctx.drawImage(background,0,0);  // eh, I don't like the axis.
		}

		// make the candidate that is moving say "yee-yee!"
		if(self.yeeon){
			var x = self.yeeobject.x;
			var y = self.yeeobject.y;
			ctx.beginPath();
			ctx.arc(x*2, y*2, 60, 0, Math.TAU, true);
			ctx.strokeStyle = "white";
			ctx.lineWidth = 8;
			ctx.fillStyle = 'white';
			ctx.globalAlpha = 0.3
			ctx.fill();
			ctx.stroke();
			ctx.globalAlpha = 1
		}
		
		for(var i=0; i<self.voters.length; i++){
			var voter = self.voters[i];
			voter.update();
			voter.draw(ctx);
		}
		for(var i=0; i<self.candidates.length; i++){
			var c = self.candidates[i];
			c.update();
			c.draw(ctx);
		}
		
		if(self.yeeon){
			function drawStroked(text, x, y) {
				ctx.font = "40px Sans-serif"
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 4;
				ctx.strokeText(text, x, y);
				ctx.fillStyle = 'white';
				ctx.fillText(text, x, y);
			}
			ctx.textAlign = "center";
			drawStroked("yee-yee!",x*2,y*2);		
		}

		// Update!
		self.onUpdate();
		publish(self.id+"-update");

	};

	// HELPERS:
	self.getBallots = function(){
		var ballots = [];
		for(var i=0; i<self.voters.length; i++){
			var voter = self.voters[i];
			ballots = ballots.concat(voter.ballots);
		}
		return ballots;
	};
	self.getTotalVoters = function(){
		var count = 0;
		for(var i=0; i<self.voters.length; i++){
			var voter = self.voters[i];
			count += voter.points.length;
		}
		return count;
	};

};
