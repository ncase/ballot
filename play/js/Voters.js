// helper function for strategies



function makeGetScore1(scorescale) {
	getScore = function(dist) {
		var score
		for (score in scorescale) {
			if (dist > scorescale[score]) break;  // need to use array instead, I think.
		}
		return score
	}
	return getScore
}

function makeScoreScale(rangescore,mindist,maxdist){
	var step = (maxdist-mindist)/(rangescore.length-1)
	var j = .5
	var scorescale = {};
	var i;
	for (i in rangescore) {
		var ss = maxdist-step*j; 
		scorescale[rangescore[i]] = ss*ss; // use squares of distance for scale
		j++;
	}
	scorescale[rangescore[i]] = 0; // last one is 0
	return scorescale
}

function makeScoreScale2(rangescore,n2,m2){
	var Linv = 1/(rangescore.length-1)
	var r = Math.sqrt(m2/n2) // only one sqrt needed! (per voter) awesome.
	var j = .5
	var scorescale = {};
	var i;
	for (i in rangescore) {
		var t2 = (m2 - 2 * n2 * r + n2) * Linv
		var s2 = m2 - n2 * 2 * j * r * (r-1) * Linv + t2 * j * j
		scorescale[rangescore[i]] = s2; // use squares of distance for scale
		j++;
	}
	scorescale[rangescore[i]] = 0; // last one is 0
	return scorescale
}


function makeGetScore( rangescore,mindist ,maxdist ) {return makeGetScore1(makeScoreScale( rangescore,mindist ,maxdist ))}
function makeGetScore2(rangescore,mindist2,maxdist2) {return makeGetScore1(makeScoreScale2(rangescore,mindist2,maxdist2))}
// just a composition of two functions above

function dostrategy(x,y,minscore,maxscore,rangescore,strategy,lastwinner,frontrunnerSet,candidates,radiusStep,getScore) {
	
	
	// set the circle radii
	// starnormfrontrunners and justfirstandlast don't have good representations yet
	// defaults for no strategy
	var radiusFirst = radiusStep * .5
	var radiusLast = radiusStep * 4.5
	var dottedCircle = false;
	
	if (strategy == 'nope') {
		var scores = {};
		var dist2a = [];
		for(var i=0; i<candidates.length; i++){
			var c = candidates[i];
			var dx = c.x-x;
			var dy = c.y-y;
			var dist2 = dx*dx+dy*dy;
			dist2a.push(dist2)
			scores[c.id] = getScore(dist2);
		}
		
		var scoresfirstlast = {scores:scores, radiusFirst:radiusFirst , radiusLast:radiusLast, dottedCircle:dottedCircle}
		return scoresfirstlast;
	}
	
	
	frontrunnerSet = frontrunnerSet || new Set(["square"]);
	var frontrunners = Array.from(frontrunnerSet)
	lastwinner = frontrunners[0]; // just for now hack
	
	var mindist2 = 999999999;
	var maxdist2 = -1;
	var mini = null;
	var maxi = null;
	var scores = {};
	var dist2a = [];
	var dist2ac = [];
	for(var i=0; i<candidates.length; i++){
		
		var c = candidates[i];
		var dx = c.x-x;
		var dy = c.y-y;
		var dist2 = dx*dx+dy*dy;
		dist2a.push(dist2)
		dist2ac[c.id] = dist2;
		scores[c.id] = getScore(dist2);
		
		if (dist2 < mindist2) {
			mindist2 = dist2;
			mini = c.id
		}
		if (dist2 > maxdist2) {
			maxdist2 = dist2;
			maxi = c.id
		}
	}
	
	if(strategy == "justfirstandlast") {
		scores[maxi] = minscore
		scores[mini] = maxscore
	} else if (strategy == "normalize") {
		
		if (0) { 
			// doesn't work yet
			getScore = makeGetScore2(rangescore,mindist2,maxdist2)
			//scores = dist2ac.map(getScore) // this doesn't work so instead we use a much longer code:
			Object.keys(dist2ac).map(function(key, index) {
			   scores[key] = getScore(dist2ac[key]); 
			});
		} else if (0) {
			var maxdist = Math.sqrt(maxdist2)
			var mindist = Math.sqrt(mindist2)
			getScore = makeGetScore(rangescore,mindist,maxdist)
			//scores = dist2ac.map(getScore) // this doesn't work so instead we use a much longer code:
			Object.keys(dist2ac).map(function(key, index) {
			   scores[key] = getScore(dist2ac[key]); 
			});
		} else if (1) {
			var maxdist = Math.sqrt(maxdist2)
			var mindist = Math.sqrt(mindist2)
			var dista = []
			for (i in dist2a) dista[i] = Math.sqrt(dist2a[i])
			var fnorm = 1/ (maxdist-mindist);
			if (1) {
				var normit = function(d) {return (d-mindist)*fnorm;}
				var ndist = dista.map(normit);
				var gs = function(d) { return minscore+Math.round((maxscore-minscore)*(1-d)); }
				var gd = ndist.map(gs)
				var assignit = function(d,i) {scores[candidates[i].id] = d;}
				gd.map(assignit);
			} else { // equivalent loop way of doing things
				for(var i=0; i<candidates.length; i++){
					var normit = (dista[i]-mindist)*fnorm;
					var gs = minscore+Math.round((maxscore-minscore)*(1-normit));
					scores[candidates[i].id] = gs;
				}
			}
		}
		radiusFirst = mindist;
		radiusLast = maxdist; 
	} else if (strategy == "threshold" || strategy == "not the worst frontrunner" || strategy == "best frontrunner" || strategy == "normalize frontrunners only" || strategy == "starnormfrontrunners") {
		var dista = []
		for (i in dist2a) dista[i] = Math.sqrt(dist2a[i])
		if (strategy == "threshold") {
			var windex = 0;
			for(var i=0; i<candidates.length; i++){
				var c = candidates[i];
				if (c.id == lastwinner) windex = i;
			}
			var d_threshold = dista[windex];
			var thresholdit = function(d) {return (d<d_threshold) ? maxscore : minscore} // don't vote for the best frontrunner. just those who are better
			radiusFirst = d_threshold;
			radiusLast = d_threshold;
			dottedCircle = true;
		} else if (strategy == "best frontrunner" || strategy == "not the worst frontrunner" || strategy == "normalize frontrunners only" || strategy == "starnormfrontrunners") {
			var windex = [];
			var maxfront = 0;
			var imaxfront = 0;
			var minfront = 9999; // find the best frontrunner
			var iminfront = 0;
			for(var i=0; i<candidates.length; i++){
				var c = candidates[i];
				for(var j = 0; j < frontrunners.length; j++) {
					var cf = frontrunners[j]
					if (c.id == cf) {
						var testd = dista[i];
						if(testd < minfront) {
							minfront = testd;
							iminfront = i;
						}
						if(testd > maxfront) {
							maxfront = testd;
							imaxfront = i;
						}
					}	
				}
				 windex.push(i);
			}
			if (strategy == "best frontrunner") {
				var d_threshold = minfront;
				var thresholdit = function(d) {return (d<=d_threshold) ? maxscore : minscore}  // vote for the best frontrunner and everyone better
				radiusFirst = d_threshold;
				radiusLast = d_threshold;
			} else if (strategy == "not the worst frontrunner") {
				var d_threshold = maxfront;
				var thresholdit = function(d) {return (d<d_threshold) ? maxscore : minscore}  // vote for everyone better than the worst frontrunner
				radiusFirst = d_threshold;
				radiusLast = d_threshold;
				dottedCircle = true;
			} else if (strategy == "normalize frontrunners only" || strategy == "starnormfrontrunners") {
				var fnorm = 1/ (maxfront-minfront);
				var normit = function(d) {return (d-minfront)*fnorm;}
				var gs = function(d) { return minscore+Math.round((maxscore-minscore)*(1-normit(d))); }
				var thresholdit = function(d) {return (d<=minfront) ? maxscore : (d>=maxfront) ? minscore : gs(d)}
				radiusFirst = minfront;
				radiusLast = maxfront;
							}
		}
		var scores2 = dista.map(thresholdit);
		var assignit = function(d,i) { scores[ candidates[i].id ] = d; }
		scores2.map(assignit)
		scores[mini] = maxscore;
		if (strategy == "starnormfrontrunners") {
			for(i in candidates){
				var c = candidates[i].id
				if (scores[c]==maxscore && c!=mini) {
					scores[c]=maxscore-1;
		}}}


	}// otherwise, there is no strategy strategy == "no strategy. judge on an absolute scale."
		
	// Scooooooore
	var scoresfirstlast = {scores:scores, radiusFirst:radiusFirst , radiusLast:radiusLast, dottedCircle:dottedCircle}
	return scoresfirstlast;
	
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

	self.getBallot = function(x, y, strategy, config){

		self.model.idlastwinner = "square"
		var scoresfirstlast = dostrategy(x,y,minscore,maxscore,scorearray,strategy,self.model.idlastwinner,self.model.frontrunnerSet,self.model.candidates,self.radiusStep,self.getScore)
		
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

	self.getBallot = function(x, y, strategy, config){

		self.model.idlastwinner = "square"
		var scoresfirstlast = dostrategy(x,y,minscore,maxscore,scorearray,strategy,self.model.idlastwinner,self.model.frontrunnerSet,self.model.candidates,self.radiusStep,self.getScore)
		
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

	self.approvalRadius = 100; // whatever.
	
	self.getScore = function(x2){
		return (x2<self.approvalRadius**2) ? 1 : 0
	};

	self.getBallot = function(x, y, strategy,  config){
		
		self.model.idlastwinner = "square"
		var scoresfirstlast = dostrategy(x,y,0,1,[0,1],strategy,self.model.idlastwinner,self.model.frontrunnerSet,self.model.candidates,self.radiusStep,self.getScore)
		var scores = scoresfirstlast.scores
		
		
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

	self.getBallot = function(x, y, strategy,  config){

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

	self.getBallot = function(x, y, strategy,  config){

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
	self.frontrunnerSet = config.frontrunnerSet

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
		
		//randomly assign voter strategy based on percentages, but using the same seed each time
		// from http://davidbau.com/encode/seedrandom.js
		Math.seedrandom('hi');
		
		for(var i=0; i<points.length; i++){
			var p = points[i];
			var x = self.x + p[0];
			var y = self.y + p[1];
			
			var r1 = Math.random() * 100;
			if (r1 < self.percentStrategy) { 
				var strategy = self.strategy // yes
			} else {
				var strategy = self.unstrategic; // no e.g. "no strategy. judge on an absolute scale."
			}
			
			var ballot = self.type.getBallot(x, y, strategy, config);
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
		self.ballot = self.type.getBallot(self.x, self.y, self.model.strategy, config);
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
