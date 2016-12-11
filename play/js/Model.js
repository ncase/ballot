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
	self.update = function(){

		// Clear it all!
		ctx.clearRect(0,0,canvas.width,canvas.height);

		// Move the one that's being dragged, if any
		if(Mouse.dragging){
			Mouse.dragging.moveTo(Mouse.x, Mouse.y);
		}

		// DRAW 'EM ALL.
		// Draw voters' BG first, then candidates, then voters.
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
