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
		self.pixelsize= 30.0;
		var pixelsize = self.pixelsize;
		WIDTH = ctx.canvas.width;
		HEIGHT = ctx.canvas.height;
		doArrayWay = self.computeMethod != "ez"
		var winners
		if (doArrayWay) {
			// put candidate information into arrays
			var canAid = [], xc = [], yc = [], fillc = [] //, canA = [], revCan = {} // candidates
			var f=[], e=[] // , fA = [], fAid = [], xf = [], yf = [], fillf = [] // frontrunners and extras
			var movethisidx, whichtypetomove
			var i = 0
			for (can in self.candidatesById) {
				var c = self.candidatesById[can]
				canAid.push(can)
				// canA.push(c)
				// revCan[c] = i
				xc.push(c.x*2) // remember the 2
				yc.push(c.y*2)
				fillc.push(c.fill)
				if (model.preFrontrunnerIds.includes(c.id)) {
					// fAid.push(can)
					// fA.push(c)
					f.push(i)
					// xf.push(c.x*2)
					// yf.push(c.y*2)
					// fillf.push(c.fill) // maybe don't need
				} else {
					e.push(i)
				}
				if (self.yeeobject == c){
					movethisidx = i
					whichtypetomove = "candidate"
				}
				i++
			}
			// now we have xc,yc,fillc,xf,yf
			// maybe we don't need fillf, fA, canA, canAid, fAid, but they might help

			// put voter information into arrays
			var av = [], xv = [], yv = [] , vg = [] , xvcenter = [] , yvcenter = []// candidates
			var movethisidx, whichtypetomove
			var i = 0
			for (vidx in self.voters) {
				v = self.voters[vidx]
				av.push(v)
				xvcenter.push(v.x*2)
				yvcenter.push(v.y*2)
				if (self.yeeobject == v){
					movethisidx = i
					whichtypetomove = "voter"
				}
				for (j in v.points) {
					p = v.points[j]
					xv.push((p[0] + v.x)*2)
					yv.push((p[1] + v.y)*2)
					vg.push(i)
				}
				i++
			}
			// now we have xv,yv,
			// we might not need av

			// need to compile yee and decide when to recompile
			// basically the only reason to recompile is when the number of voters or candidates changes
			
			lv = xv.length
			lc = xc.length
			self.fastyeesettings = [lc,lv,WIDTH,HEIGHT,pixelsize]
			function arraysEqual(arr1, arr2) {
				arr1 = arr1 || [0]
				arr2 = arr2 || [0]
				if(arr1.length !== arr2.length)
					return false;
				for(var i = arr1.length; i--;) {
					if(arr1[i] !== arr2[i])
						return false;
				}

				return true;
			}
			recompileyee = !arraysEqual(self.fastyeesettings,self.oldfastyeesettings)
			//(self.fastyeesettings || 0) != (self.oldfastyeesettings || 0))
			self.oldfastyeesettings = self.fastyeesettings
			if (recompileyee) {
				fastyee = createKernelYee(lc,lv,WIDTH,HEIGHT,pixelsize)
			}
			//method = "gpu"
			//method = "js"
			method = self.computeMethod
			winners = fastyee(xc,yc,f,e,xv,yv,vg,xvcenter,yvcenter,movethisidx,whichtypetomove,method)
			
		}
		self.gridx = [];
		self.gridy = [];
		self.gridl = []; 
		self.gridb = []; 
		saveo = {}
		saveo.x = self.yeeobject.x;
		saveo.y = self.yeeobject.y;
		var i=0
		for(var x=.5*pixelsize, cx=0; x<=WIDTH; x+= pixelsize, cx++) {
			for(var y=.5*pixelsize, cy=0; y<=HEIGHT; y+= pixelsize, cy++) {
				if (doArrayWay) {
					var winner = Math.round(winners[i])
					if (winner > lc) { // we have a set of winners to decode
						//winner = 3 + lc* (2+lc*(4))
						//var decode = function (winner) {
							wl = []
							for (var s = 0; s < lc; s++) {
								if (winner <= lc) {break}
								wl.push(winner % lc)
								winner = Math.floor(winner / lc)
							}
							wl.push(winner)
						//	return wl
						//}
						colorlist = []
						for (w in wl) {colorlist.push(Candidate.graphics[canAid[wl[w]] || "square"].fill)}
						self.gridb[i] = colorlist
						var a = "#ccc" // grey is actually a code for "look for more colors"
					} else {
						var a = Candidate.graphics[canAid[winner] || "square"].fill
					}
					// if (a == "#ccc") {a = "#ddd"} // hack for now, but will deal with ties later
					self.gridx.push(x);
					self.gridy.push(y);
					self.gridl.push(a);
					i++;
					continue;
				}
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
			var pixelsize = self.pixelsize;
			for(var k=0;k<self.gridx.length;k++) {
				var ca = self.gridl[k]
				if (ca=="#ccc") { // make stripes instead of gray
					var cb = self.gridb[k]
					var xb = self.gridx[k]-pixelsize*.5
					var yb = self.gridy[k]-pixelsize*.5
					var wb = pixelsize
					var hb = pixelsize
					var hh = 5; // height of stripe
					for (var j=0; j< pixelsize/hh; j++) {
						ctx.fillStyle = cb[j % cb.length]
						ctx.fillRect(xb,yb+j*hh,wb,hh);
					}
				} else {
					ctx.fillStyle = self.gridl[k];
					ctx.fillRect(self.gridx[k]-pixelsize*.5, self.gridy[k]-pixelsize*.5, pixelsize, pixelsize);
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
			ctx.globalAlpha = 0.9
			drawStroked("yee-yee!",x*2,y*2+50);		
			ctx.globalAlpha = 1
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
