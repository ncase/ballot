// helper function for strategies
function dostrategy(x,y,minscore,maxscore,rangescore,strategy,preFrontrunnerIds,candidates,radiusStep,getScore) {
	// no strategy first
	var lc = candidates.length
	var dottedCircle = false
	if (strategy == "zero strategy. judge on an absolute scale.") {
		var scores = {};
		var dist2a = [];
		for(var i=0; i<lc; i++){
			var c = candidates[i];
			var dx = c.x-x;
			var dy = c.y-y;
			var dist2 = dx*dx+dy*dy;
			dist2a.push(dist2)
			scores[c.id] = getScore(dist2);
		}

		var radiusFirst = radiusStep * (minscore + .5)
		var radiusLast = radiusStep * (maxscore - .5)
		var scoresfirstlast = {scores:scores, radiusFirst:radiusFirst , radiusLast:radiusLast, dottedCircle:dottedCircle}
		return scoresfirstlast;
	}

	// find distances and ids
	dista = []
	canAid = []
	for(var i=0; i<lc; i++){
		var c = candidates[i];
		var dx = c.x-x;
		var dy = c.y-y;
		var dist = Math.sqrt(dx*dx+dy*dy);
		dista.push(dist)
		canAid.push(c.id)
	}

	// reference
	// {name:"O", realname:"zero strategy. judge on an absolute scale.", margin:4},
	// {name:"N", realname:"normalize", margin:4},
	// {name:"F", realname:"normalize frontrunners only", margin:4},
	// {name:"B", realname:"best frontrunner", margin:4},
	// {name:"W", realname:"not the worst frontrunner"}

	var lf = preFrontrunnerIds.length

	// identify important set
	var shortlist = []
	var ls
	if (strategy == "normalize" || lf == 0) { // exception for no frontrunners
		ls = lc
		for (var i = 0; i < lc; i++) {
			shortlist.push(i)
		}
	} else {
		ls = lf
		for (var i = 0; i < ls; i++) {
			var index = canAid.indexOf(preFrontrunnerIds[i])
			if (index > -1) {shortlist.push(index)}
		}
	}

	// find min and max of shortlist
	var m=-1
	var n=Infinity
	var mi=null
	var ni=null
	for (var i = 0; i < ls; i++) {
		var d1 = dista[shortlist[i]]
		if (d1 > m) {
			m = d1 // max
			mi = i
		}
		if (d1 < n) {
			n = d1 //min
			ni = i
		}
	}

	if (strategy == "best frontrunner"){
		m=n
	} else if (strategy == "not the worst frontrunner") {
		n=m
		dottedCircle = true;
	}

	// assign scores
	scores = {}
	for(var i=0; i<lc; i++){
		var d1 = dista[i]
		if (d1 < n) {
			score = maxscore
		} else if (d1 >= m){ // in the case that the voter likes the frontrunner candidates equally, he just votes for everyone better
			score = minscore
		} else { // putting this last avoids m==n giving division by 0
			frac = ( d1 - n ) / ( m - n )
			score = Math.floor(.5+minscore+(maxscore-minscore)*(1-frac))
		}
		scores[canAid[i]] = score
	}

	// boundary condition correction
	// scores[canAid[mi]] = minscore
	scores[canAid[ni]] = maxscore

	// if there's just one frontrunner than set him last
	// unless he's the closest to you
	if (lf==1 && strategy != "normalize") {
		var n1 = n
		var n1i = ni
		for (var i = 0; i < lc; i++) {
			var d1 = dista[i]
			if (d1 < n1) {
				n1 = d1 //min
				n1i = i
			}
		}
		if (shortlist[0] == n1i) {
			// he's closest
			dottedCircle = false
		} else {
			scores[canAid[shortlist[0]]] = minscore
			dottedCircle = true
		}
	}


	// star exception
	if (strategy == "starnormfrontrunners") {
		// find best candidate and make sure that only he gets the best score
		var n1 = n
		var n1i = ni
		for (var i = 0; i < lc; i++) {
			var d1 = dista[i]
			if (d1 < n1) {
				n1 = d1 //min
				n1i = i
			}
		}
		for (var i = 0; i < lc; i++) {
			var c = canAid[i]
			if (scores[c]==maxscore && i!=n1i) {
				scores[c]=maxscore-1;
	}}}

	return {scores:scores, radiusFirst:n , radiusLast:m, dottedCircle:dottedCircle}
}

/////////////////////////////////////
///////// TYPES OF VOTER ////////////
/////////////////////////////////////

function ScoreVoter(model){

	var self = this;
	self.model = model;
	var maxscore = 5;
	var minscore = 0;
	var scorearray = [];
	for (var i=minscore; i<= maxscore; i++) scorearray.push(i)
	self.radiusStep = window.HACK_BIG_RANGE ? 61 : 25; // step: x<25, 25<x<50, 50<x<75, 75<x<100, 100<x

	self.getScore = function(x2){
		var step = self.radiusStep;
		if(x2<step*step) return 5;
		if(x2<(step*2)*(step*2)) return 4;
		if(x2<(step*3)*(step*3)) return 3;
		if(x2<(step*4)*(step*4)) return 2;
		if(x2<(step*5)*(step*5)) return 1;
		return 0;
	};

	self.getBallot = function(x, y, strategy){


		var scoresfirstlast = dostrategy(x,y,minscore,maxscore,scorearray,strategy,self.model.preFrontrunnerIds,self.model.candidates,self.radiusStep,self.getScore)

		self.radiusFirst = scoresfirstlast.radiusFirst
		self.radiusLast = scoresfirstlast.radiusLast
		self.dottedCircle = scoresfirstlast.dottedCircle
		var scores = scoresfirstlast.scores
		return scores

	};

	self.drawBG = function(ctx, x, y, ballot){

		// RETINA
		x = x*2;
		y = y*2;
		var scorange = maxscore - minscore
		var step = (self.radiusLast - self.radiusFirst)/scorange;
		// Draw big ol' circles.
		for(var i=0;i<scorange;i++){
			ctx.beginPath();
			ctx.arc(x, y, (step*(i+.5) + self.radiusFirst)*2, 0, Math.TAU, false);
			ctx.lineWidth = (5-i)*2;
			ctx.strokeStyle = "#888";
			ctx.setLineDash([]);
			if (self.dottedCircle) ctx.setLineDash([5, 15]);
			ctx.stroke();
			if (self.dottedCircle) ctx.setLineDash([]);
		}

	};

	self.drawCircle = function(ctx, x, y, size, ballot){

		// There are #Candidates*5 slices
		// Fill 'em in in order -- and the rest is gray.
		var totalSlices = self.model.candidates.length*(maxscore-minscore);
		var leftover = totalSlices;
		var slices = [];
		for(var i=0; i<self.model.candidates.length; i++){
			var c = self.model.candidates[i];
			var cID = c.id;
			var score = ballot[cID] - minscore;
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

function ThreeVoter(model){

	var self = this;
	self.model = model;
	var maxscore = 2;
	var minscore = 0;
	var scorearray = [];
	for (var i=minscore; i<= maxscore; i++) scorearray.push(i)
	self.radiusStep = window.HACK_BIG_RANGE ? 61 : 25; // step: x<25, 25<x<50, 50<x<75, 75<x<100, 100<x

	self.getScore = function(x2){
		var step = self.radiusStep;
		if(x2<step*step) return 2;
		if(x2<step*3.5*step*3.5) return 1;
		return 0;
	};

	self.getBallot = function(x, y, strategy){


		var scoresfirstlast = dostrategy(x,y,minscore,maxscore,scorearray,strategy,self.model.preFrontrunnerIds,self.model.candidates,self.radiusStep,self.getScore)

		self.radiusFirst = scoresfirstlast.radiusFirst
		self.radiusLast = scoresfirstlast.radiusLast
		self.dottedCircle = scoresfirstlast.dottedCircle
		var scores = scoresfirstlast.scores
		return scores

	};

	self.drawBG = function(ctx, x, y, ballot){

		// RETINA
		x = x*2;
		y = y*2;
		var scorange = maxscore - minscore
		var step = (self.radiusLast - self.radiusFirst)/scorange;
		// Draw big ol' circles.
		for(var i=0;i<scorange;i++){
			ctx.beginPath();
			ctx.arc(x, y, (step*(i+.5) + self.radiusFirst)*2, 0, Math.TAU, false);
			ctx.lineWidth = (5-i)*2;
			ctx.strokeStyle = "#888";
			ctx.setLineDash([]);
			if (self.dottedCircle) ctx.setLineDash([5, 15]);
			ctx.stroke();
			if (self.dottedCircle) ctx.setLineDash([]);
		}

	};

	self.drawCircle = function(ctx, x, y, size, ballot){

		// There are #Candidates*5 slices
		// Fill 'em in in order -- and the rest is gray.
		var totalSlices = self.model.candidates.length*(maxscore-minscore);
		var leftover = totalSlices;
		var slices = [];
		for(var i=0; i<self.model.candidates.length; i++){
			var c = self.model.candidates[i];
			var cID = c.id;
			var score = ballot[cID] - minscore;
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

	self.radiusStep = 200;
	self.approvalRadius = 100; // whatever.
	self.drawApprovalRadius = 100; // whatever.
	self.getScore = function(x2){
		return (x2<self.approvalRadius**2) ? 1 : 0
	};

	self.getBallot = function(x, y, strategy){


		var scoresfirstlast = dostrategy(x,y,0,1,[0,1],strategy,self.model.preFrontrunnerIds,self.model.candidates,self.radiusStep,self.getScore)
		var scores = scoresfirstlast.scores
		self.drawApprovalRadius = (scoresfirstlast.radiusFirst + scoresfirstlast.radiusLast) * .5
		self.dottedCircle = scoresfirstlast.dottedCircle

		// Anyone close enough. If anyone.
		var approved = [];
		for(var i=0; i<self.model.candidates.length; i++){
			var c = self.model.candidates[i];
			if(scores[c.id] == 1){
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
		ctx.arc(x, y, self.drawApprovalRadius*2, 0, Math.TAU, false);
		ctx.lineWidth = 8;
		ctx.strokeStyle = "#888";
		ctx.setLineDash([]);
		if (self.dottedCircle) ctx.setLineDash([5, 15]);
		ctx.stroke();
		if (self.dottedCircle) ctx.setLineDash([]);

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

	self.getBallot = function(x, y, strategy){

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

	self.getBallot = function(x, y, strategy){

		// Who am I closest to? Use their fill
		var checkOnlyFrontrunners = (strategy!="zero strategy. judge on an absolute scale." && model.preFrontrunnerIds.length > 1)
		var closest = null;
		var closestDistance = Infinity;
		for(var j=0;j<self.model.candidates.length;j++){
			var c = self.model.candidates[j];
			if(checkOnlyFrontrunners && ! model.preFrontrunnerIds.includes(c.id)  ) {
				continue // skip this candidate because he isn't one of the 2 or more frontrunners, so we can't vote for him
			}
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
		ctx.strokeStyle = 'rgb(0,0,0)';
		ctx.lineWidth = 1; // border

		// Just draw a circle.
		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.TAU, true);
		ctx.fill();
		if (self.model.yeeon) {ctx.stroke();}

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

	if (self.model.yeeon) {
		// Just draw a circle.
		ctx.strokeStyle = 'rgb(0,0,0)';
		ctx.lineWidth = 1; // border
		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.TAU, true);
		ctx.closePath();
		ctx.stroke();
	}

};
var _drawBlank = function(ctx, x, y, size){
	var slices = [{ num:1, fill:"#bbb" }];
	_drawSlices(ctx, x, y, size, slices, 1);
};


/////////////////////////////////////////
///////// SINGLE OR GAUSSIAN ////////////
/////////////////////////////////////////

function GaussianVoters(config){ // this config comes from addVoters in main_sandbox

	var self = this;
	Draggable.call(self, config);

	// NUM
	self.num = config.num || 3;
	self.vid = config.vid || 0;
	self.snowman = config.snowman || false;

	// WHAT TYPE?
	self.type = new config.type(self.model);
	self.setType = function(newType){
		self.type = new newType(self.model);
	};

	self.percentStrategy = config.percentStrategy
	self.strategy = config.strategy
	self.unstrategic = config.unstrategic
	self.preFrontrunnerIds = config.preFrontrunnerIds

	// HACK: larger grab area
	self.radius = 50;

	// SPACINGS, dependent on NUM
	var spacings = [0, 12, 12, 12, 12, 20, 30, 50, 100];
	if (self.snowman) {
		if (self.vid == 0) {
			spacings.splice(3)
		} else if (self.vid == 1) {
			spacings = [0,12,12,12]
		} else if (self.vid == 2) {
			spacings.splice(4)
		}
		//spacings.splice(2+self.vid)
	} else if(self.num==1){
		spacings.splice(4);
	} else if(self.num==2){
		spacings.splice(5);
	} else if (self.num==3){
		spacings = [0, 10, 11, 12, 15, 20, 30, 50, 100];
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
		var num = Math.floor(circum/(spacing-1));
		if (self.snowman && self.vid == 1 && i==3){
			num = 10
		}

		// HACK TO MAKE IT PRIME - 137 VOTERS
		//if(i==_RINGS-1) num += 3;

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

			var r1 = (1861*i) % 100;
			if (r1 < self.percentStrategy) {
				var strategy = self.strategy // yes
			} else {
				var strategy = self.unstrategic; // no e.g. "zero strategy. judge on an absolute scale."
			}

			var ballot = self.type.getBallot(x, y, strategy);
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


	// not sure if we need all these, but just in case
	self.num = 1;
	self.vid = 0;
	self.snowman = false;
	self.percentStrategy = config.percentStrategy
	self.strategy = config.strategy
	self.unstrategic = config.unstrategic
	self.preFrontrunnerIds = config.preFrontrunnerIds


	// WHAT TYPE?
	self.type = new config.type(self.model);
	self.setType = function(newType){
		self.type = new newType(self.model);
	};

	// Image!
	self.img = new Image();
	self.img.src = "img/voter_face.png";


	self.points = [[0,0]];

	// UPDATE!
	self.ballot = null;
	self.ballots = [];
	self.update = function(){
		self.ballot = self.type.getBallot(self.x, self.y, self.strategy);
		self.ballots = [self.ballot]
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
