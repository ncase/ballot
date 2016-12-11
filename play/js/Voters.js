/////////////////////////////////////
///////// TYPES OF VOTER ////////////
/////////////////////////////////////

function ScoreVoter(model){

	var self = this;
	self.model = model;

	self.radiusStep = window.HACK_BIG_RANGE ? 74 : 30; // step: x<25, 25<x<50, 50<x<75, 75<x<100, 100<x

	self.getScore = function(x){
		var step = self.radiusStep;
		if(x<step) return 5;
		if(x<step*2) return 4;
		if(x<step*3) return 3;
		if(x<step*4) return 2;
		if(step*4<x) return 1;
	};

	self.getBallot = function(x, y){

		// Scores for each one!
		var scores = {};
		for(var i=0; i<self.model.candidates.length; i++){
			var c = self.model.candidates[i];
			var dx = c.x-x;
			var dy = c.y-y;
			var dist = Math.sqrt(dx*dx+dy*dy);
			scores[c.id] = self.getScore(dist);
		}
		
		// Scooooooore
		return scores;

	};

	self.drawBG = function(ctx, x, y, ballot){

		// RETINA
		x = x*2;
		y = y*2;

		// Draw big ol' circles.
		for(var i=1;i<5;i++){
			ctx.beginPath();
			ctx.arc(x, y, (self.radiusStep*i)*2, 0, Math.TAU, false);
			ctx.lineWidth = (5-i)*2;
			ctx.strokeStyle = "#888";
			ctx.stroke();
		}

	};

	self.drawCircle = function(ctx, x, y, size, ballot){

		// There are #Candidates*5 slices
		// Fill 'em in in order -- and the rest is gray.
		var totalSlices = self.model.candidates.length*4;
		var leftover = totalSlices;
		var slices = [];
		for(var i=0; i<self.model.candidates.length; i++){
			var c = self.model.candidates[i];
			var cID = c.id;
			var score = ballot[cID]-1;
			leftover -= score;
			slices.push({
				num: score,
				fill: c.fill
			});
		}
		// Leftover is gray
		slices.push({
			num: leftover,
			fill: "#bbb"
		});
		// FILL 'EM IN
		_drawSlices(ctx, x, y, size, slices, totalSlices);

	};

}

function ApprovalVoter(model){

	var self = this;
	self.model = model;

	self.approvalRadius = 100; // whatever.

	self.getBallot = function(x, y){

		// Anyone close enough. If anyone.
		var approved = [];
		for(var i=0; i<self.model.candidates.length; i++){
			var c = self.model.candidates[i];
			var dx = c.x-x;
			var dy = c.y-y;
			var dist = Math.sqrt(dx*dx+dy*dy);
			if(dist<self.approvalRadius){
				approved.push(c.id);
			}
		}
		
		// Vote for the CLOSEST
		return { approved: approved };

	};

	self.drawBG = function(ctx, x, y, ballot){

		// RETINA
		x = x*2;
		y = y*2;

		// Draw a big ol' circle
		ctx.beginPath();
		ctx.arc(x, y, self.approvalRadius*2, 0, Math.TAU, false);
		ctx.lineWidth = 8;
		ctx.strokeStyle = "#888";
		ctx.stroke();			

	};

	self.drawCircle = function(ctx, x, y, size, ballot){

		// If none, whatever.
		var slices = [];
		if(ballot.approved.length==0){
			_drawBlank(ctx, x, y, size);
			return;
		}

		// Draw 'em slices
		for(var i=0; i<ballot.approved.length; i++){
			var candidate = self.model.candidatesById[ballot.approved[i]];
			slices.push({ num:1, fill:candidate.fill });
		}
		_drawSlices(ctx, x, y, size, slices, ballot.approved.length);

	};

}

function RankedVoter(model){

	var self = this;
	self.model = model;

	self.getBallot = function(x, y){

		// Rank the peeps I'm closest to...
		var rank = [];
		for(var i=0;i<self.model.candidates.length;i++){
			rank.push(self.model.candidates[i].id);
		}
		rank = rank.sort(function(a,b){
			
			var c1 = self.model.candidatesById[a];
			var x1 = c1.x-x;
			var y1 = c1.y-y;
			var d1 = x1*x1+y1*y1;

			var c2 = self.model.candidatesById[b];
			var x2 = c2.x-x;
			var y2 = c2.y-y;
			var d2 = x2*x2+y2*y2;

			return d1-d2;

		});
		
		// Ballot!
		return { rank:rank };

	};

	self.drawBG = function(ctx, x, y, ballot){

		// RETINA
		x = x*2;
		y = y*2;

		// DRAW 'EM LINES
		for(var i=0; i<ballot.rank.length; i++){

			// Line width
			var lineWidth = ((ballot.rank.length-i)/ballot.rank.length)*8;

			// To which candidate...
			var rank = ballot.rank[i];
			var c = self.model.candidatesById[rank];
			var cx = c.x*2; // RETINA
			var cy = c.y*2; // RETINA

			// Draw
			ctx.beginPath();
			ctx.moveTo(x,y);
			ctx.lineTo(cx,cy);
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = "#888";
			ctx.stroke();			

		}		

	};

	self.drawCircle = function(ctx, x, y, size, ballot){

		var slices = [];
		var n = ballot.rank.length;
		var totalSlices = (n*(n+1))/2; // num of slices!

		for(var i=0; i<ballot.rank.length; i++){
			var rank = ballot.rank[i];
			var candidate = self.model.candidatesById[rank];
			slices.push({ num:(n-i), fill:candidate.fill });
		}

		_drawSlices(ctx, x, y, size, slices, totalSlices);

	};

}

function PluralityVoter(model){

	var self = this;
	self.model = model;

	self.getBallot = function(x, y){

		// Who am I closest to? Use their fill
		var closest = null;
		var closestDistance = Infinity;
		for(var j=0;j<self.model.candidates.length;j++){
			var c = self.model.candidates[j];
			var dx = c.x-x;
			var dy = c.y-y;
			var dist = dx*dx+dy*dy;
			if(dist<closestDistance){
				closestDistance = dist;
				closest = c;
			}
		}
		
		// Vote for the CLOSEST
		return { vote:closest.id };

	};

	self.drawBG = function(ctx, x, y, ballot){

		var candidate = model.candidatesById[ballot.vote];

		// RETINA
		x = x*2;
		y = y*2;
		var tx = candidate.x*2;
		var ty = candidate.y*2;

		// DRAW - Line
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(tx,ty);
		ctx.lineWidth = 8;
		ctx.strokeStyle = "#888";
		ctx.stroke();

	};

	self.drawCircle = function(ctx, x, y, size, ballot){

		// RETINA
		x = x*2;
		y = y*2;

		// What fill?
		var fill = Candidate.graphics[ballot.vote].fill;
		ctx.fillStyle = fill;

		// Just draw a circle.
		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.TAU, true);
		ctx.fill();

	};

}

// helper method...
var _drawSlices = function(ctx, x, y, size, slices, totalSlices){

	// RETINA
	x = x*2;
	y = y*2;
	//size = size*2;

	// GO AROUND THE CLOCK...
	var startingAngle = -Math.TAU/4;
	var endingAngle = 0;
	for(var i=0; i<slices.length; i++){

		slice = slices[i];

		// Angle!
		var sliceAngle = slice.num * (Math.TAU/totalSlices);
		endingAngle = startingAngle+sliceAngle;

		// Just draw an arc, clockwise.
		ctx.fillStyle = slice.fill;
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.arc(x, y, size, startingAngle, endingAngle, false);
		ctx.lineTo(x,y);
		ctx.closePath();
		ctx.fill();

		// For next time...
		startingAngle = endingAngle;

	}

};
var _drawBlank = function(ctx, x, y, size){
	var slices = [{ num:1, fill:"#bbb" }];
	_drawSlices(ctx, x, y, size, slices, 1);
};


/////////////////////////////////////////
///////// SINGLE OR GAUSSIAN ////////////
/////////////////////////////////////////

function GaussianVoters(config){

	var self = this;
	Draggable.call(self, config);

	// NUM
	self.num = config.num || 3;

	// WHAT TYPE?
	self.type = new config.type(self.model);
	self.setType = function(newType){
		self.type = new newType(self.model);
	};

	// HACK: larger grab area
	self.radius = 50;

	// SPACINGS, dependent on NUM
	var spacings = [0, 10, 11, 12, 15, 20, 30, 50, 100];
	if(self.num==1){
		spacings.splice(4);
	}
	if(self.num==2){
		spacings.splice(5);
	}

	// Create 100+ points, in a Gaussian-ish distribution!
	var points = [[0,0]];
	self.points = points;
	var _radius = 0,
		_RINGS = spacings.length;
	for(var i=1; i<_RINGS; i++){
		
		var spacing = spacings[i];
		_radius += spacing;

		var circum = Math.TAU*_radius;
		var num = Math.floor(circum/spacing);

		// HACK TO MAKE IT PRIME - 137 VOTERS
		if(i==_RINGS-1) num += 3;

		var err = 0.01; // yeah whatever
		for(var angle=0; angle<Math.TAU-err; angle+=Math.TAU/num){
			var x = Math.cos(angle)*_radius;
			var y = Math.sin(angle)*_radius;
			points.push([x,y]);
		}

	}

	// UPDATE! Get all ballots.
	self.ballots = [];
	self.update = function(){
		self.ballots = [];
		for(var i=0; i<points.length; i++){
			var p = points[i];
			var x = self.x + p[0];
			var y = self.y + p[1];
			var ballot = self.type.getBallot(x, y);
			self.ballots.push(ballot);
		}
	};

	// DRAW!
	self.draw = function(ctx){

		// DRAW ALL THE POINTS
		for(var i=0; i<points.length; i++){
			var p = points[i];
			var x = self.x + p[0];
			var y = self.y + p[1];
			var ballot = self.ballots[i];
			self.type.drawCircle(ctx, x, y, 10, ballot);
		}

	};

}

function SingleVoter(config){

	var self = this;
	Draggable.call(self, config);

	// WHAT TYPE?
	self.type = new config.type(self.model);

	// Image!
	self.img = new Image();
	self.img.src = "img/voter_face.png";

	// UPDATE!
	self.ballot = null;
	self.update = function(){
		self.ballot = self.type.getBallot(self.x, self.y);
	};

	// DRAW!
	self.draw = function(ctx){

		// Background, for showing HOW the decision works...
		self.type.drawBG(ctx, self.x, self.y, self.ballot);

		// Circle!
		var size = 20;
		self.type.drawCircle(ctx, self.x, self.y, size, self.ballot);
		
		// Face!
		size = size*2;
		var x = self.x*2;
		var y = self.y*2;
		ctx.drawImage(self.img, x-size/2, y-size/2, size, size);

	};


}