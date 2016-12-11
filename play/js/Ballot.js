/*****************

What does the base Ballot class need to do?
- handle the *DOM* graphics
- listen to a single type o' voter, and show their pick(s).

******************/

function ScoreBallot(config){

	var self = this;
	config = config || {};
	config.bg = "img/ballot_range.png";
	Ballot.call(self, config);

	// BOXES!
	self.boxes = {
		square: self.createRate(133, 100, 0),
		triangle: self.createRate(133, 143, 3),
		hexagon: self.createRate(133, 184, 1)
	};

	// On update...
	self.update = function(ballot){
		for(var cID in ballot){
			var score = ballot[cID];
			self.boxes[cID].gotoFrame(score-1);
		}
	};

}

function ApprovalBallot(config){

	var self = this;
	config = config || {};
	config.bg = "img/ballot_approval.png";
	Ballot.call(self, config);

	// BOXES!
	self.boxes = {
		square: self.createBox(26, 98, 0),
		triangle: self.createBox(26, 140, 1),
		hexagon: self.createBox(26, 184, 0)
	};

	// On update...
	self.update = function(ballot){

		// Clear all
		var vote = ballot.vote;
		for(var box in self.boxes){
			self.boxes[box].gotoFrame(0);
		}

		// Check all those who were approved
		for(var i=0; i<ballot.approved.length; i++){
			var candidate = ballot.approved[i];
			self.boxes[candidate].gotoFrame(1);
		}

	};

}

function RankedBallot(config){

	var self = this;
	config = config || {};
	config.bg = "img/ballot_ranked.png";
	Ballot.call(self, config);

	// BOXES!
	self.boxes = {
		square: self.createBox(26, 98, 0),
		triangle: self.createBox(26, 140, 1),
		hexagon: self.createBox(26, 184, 0)
	};

	// On update...
	self.update = function(ballot){
		for(var i=0; i<ballot.rank.length; i++){
			var candidate = ballot.rank[i];
			var frame = 2 + i;
			self.boxes[candidate].gotoFrame(frame);
		}
	};

}

function PluralityBallot(config){

	var self = this;
	config = config || {};
	config.bg = "img/ballot_fptp.png";
	Ballot.call(self, config);

	// BOXES!
	self.boxes = {
		square: self.createBox(26, 98, 0),
		triangle: self.createBox(26, 140, 1),
		hexagon: self.createBox(26, 184, 0)
	};

	// On update...
	self.update = function(ballot){
		var vote = ballot.vote;
		for(var box in self.boxes){
			self.boxes[box].gotoFrame(0); // unchecked...
		}
		self.boxes[vote].gotoFrame(1); // ...except for the one.
	};

}

function Ballot(config){

	var self = this;

	// Create DOM, I s'pose
	self.dom = document.createElement("div");
	self.dom.id = "ballot";
	self.dom.style.backgroundImage = "url("+config.bg+")"; // Background image...

	// Create Sprite method!
	self.createSprite = function(config){

		var sprite = {};

		// DOM
		sprite.dom = document.createElement("div");
		sprite.dom.setAttribute("class", "ballot_sprite");
		sprite.dom.style.backgroundImage = "url("+config.img+")";
		sprite.dom.style.width = config.w+"px";
		sprite.dom.style.height = config.h+"px";
		sprite.dom.style.left = config.x+"px";
		sprite.dom.style.top = config.y+"px";

		// Add to my dom.
		self.dom.appendChild(sprite.dom);

		// Method.
		sprite.gotoFrame = function(frame){
			sprite.dom.style.backgroundPosition = "0px -"+(frame*config.h)+"px";
		};
		sprite.gotoFrame(config.frame);

		return sprite;

	};
	self.createBox = function(x,y,frame){
		return self.createSprite({
			img: "img/ballot_box.png",
			x:x, y:y,
			w:50, h:50,
			frame:frame
		});
	};
	self.createRate = function(x,y,frame){
		return self.createSprite({
			img: "img/ballot_rate.png",
			x:x, y:y,
			w:225, h:50,
			frame:frame
		});
	};

}