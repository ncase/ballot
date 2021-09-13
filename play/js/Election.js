/****************************

SINGLETON CLASS on how to COUNT UP THE BALLOTS
and RENDER IT INTO THE CAPTION

*****************************/

var Election = {};

Election.score = function(model, options){

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		for(var candidate in ballot){
			tally[candidate] += ballot[candidate];
		}
	});
	for(var candidate in tally){
		tally[candidate] /= model.getTotalVoters();
	}
	var winners = _countWinner(tally);
	var color = _colorWinner(model, winners);

	if (options.sidebar) {

		// Caption
		var winner = winners[0];
		var text = "";
		text += "<span class='small'>";
		text += "<b>highest average score wins</b><br>";
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i].id;
			text += _icon(c)+"'s score: "+(tally[c].toFixed(2))+" out of 5.00<br>";
		}
		if(!winner | winners.length>=2){
			// NO WINNER?! OR TIE?!?!
			text += _tietext(winners);
		} else {
			text += "<br>";
			text += _icon(winner)+" has the highest score, so...<br>";
			text += "</span>";
			text += "<br>";
			text += "<b style='color:"+color+"'>"+winner.toUpperCase()+"</b> WINS";
		}

		model.caption.innerHTML = text;
	}
	
	if (model.dotop2) model.top2 = _sortTally(tally).slice(0,2)
};

Election.star = function(model, options){

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		for(var candidate in ballot){
			tally[candidate] += ballot[candidate];
		}
	});
	for(var candidate in model.candidatesById){
		tally[candidate] /= model.getTotalVoters();
	}
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return tally[b]-tally[a]})

	var ballots = model.getBallots();
	var aWins = 0;
	var bWins = 0;
	for(var k=0; k<ballots.length; k++){
		var ballot = ballots[k];
		if(ballot[frontrunners[0]]>ballot[frontrunners[1]]){
			aWins++; // a wins!
		} else if(ballot[frontrunners[0]]<ballot[frontrunners[1]]){
			bWins++; // b wins!
		}
	}

	var winner = frontrunners[0]
	if (bWins > aWins) {
		winner = frontrunners[1]
	}
	var color = _colorWinner(model, [winner]);

	if (model.dotop2) model.top2 = frontrunners.slice(0,2)

	if (!options.sidebar) return

	// NO WINNER?! OR TIE?!?!
	if(!winner){

		var text = "<b>NOBODY WINS</b>";
		model.caption.innerHTML = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		text += "<b>pairwise winner of two highest average scores wins</b><br>";
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i].id;
			text += _icon(c)+"'s score: "+(tally[c].toFixed(2))+" out of 5.00<br>";
		}
		text += "<br>";
		text += _icon(frontrunners[0])+" and "+_icon(frontrunners[1]) +" have the highest score, and...<br>";
		text += "...their pairwise counts are "+aWins+" to "+bWins+", so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+winner.toUpperCase()+"</b> WINS";
		model.caption.innerHTML = text;

	}

};

Election.three21 = function(model, options){

	var ballots = model.getBallots();
	// Tally the approvals & get winner!
	var tallies = _tallies(model, 3);

	var semifinalists = [];

	for (var i in model.candidatesById) {
	   semifinalists.push(i);
	}
	semifinalists.sort(function(a,b){return tallies[2][b]-tallies[2][a]})

	var finalists = semifinalists.slice(0,3);
	finalists.sort(function(a,b){return tallies[0][a]-tallies[0][b]})

	var ballots = model.getBallots();
	var aWins = 0;
	var bWins = 0;
	for(var k=0; k<ballots.length; k++){
		var ballot = ballots[k];
		if(ballot[finalists[0]]>ballot[finalists[1]]){
			aWins++; // a wins!
		} else if(ballot[finalists[0]]<ballot[finalists[1]]){
			bWins++; // b wins!
		}
	}

	var winner = finalists[0]
	if (bWins > aWins) {
		winner = finalists[1]
	}
	var color = _colorWinner(model, [winner]);
	
	if (model.dotop2) model.top2 = finalists.slice(0,2)

	if (!options.sidebar) return

	// NO WINNER?! OR TIE?!?!
	if(!winner){

		var text = "<b>NOBODY WINS</b>";
		model.caption.innerHTML = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		text += "<b>Semifinalists: 3 most good. Finalists: 2 least bad. Winner: more preferred.</b><br>";
		text += "<b>Semifinalists:</b><br>";
		for(var i=0; i<semifinalists.length; i++){
			var c = semifinalists[i];
			text += _icon(c)+"'s 'good': "+tallies[2][c]+"<br>";
		}
		text += "<b>Finalists:</b><br>";
		for(var i=0; i<finalists.length; i++){
			var c = finalists[i];
			text += _icon(c)+"'s 'bad': "+tallies[0][c]+"<br>";
		}
		text += "<b>Winner:</b><br>";

		text += _icon(finalists[0])+": "+aWins+"; "+_icon(finalists[1]) +": "+bWins+", so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+winner.toUpperCase()+"</b> WINS";
		model.caption.innerHTML = text;

	}

};

Election.approval = function(model, options){

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		var approved = ballot.approved;
		for(var i=0; i<approved.length; i++) tally[approved[i]]++;
	});
	var winners = _countWinner(tally);

	var color = _colorWinner(model, winners);
	
	if (model.dotop2) model.top2 = _sortTally(tally).slice(0,2)

	if (!options.sidebar) return

	// Caption
	var winner = winners[0];
	var text = "";
	text += "<span class='small'>";
	text += "<b>most approvals wins</b><br>";
	for(var i=0; i<model.candidates.length; i++){
		var c = model.candidates[i].id;
		text += _icon(c)+" got "+tally[c]+" approvals<br>";
	}
	if(!winner | winners.length>=2){
		// NO WINNER?! OR TIE?!?!
		text += _tietext(winners);
	} else {
		text += "<br>";
		text += _icon(winner)+" is most approved, so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+winner.toUpperCase()+"</b> WINS";
	}
	model.caption.innerHTML = text;
};

Election.condorcet = function(model, options){

	var text = "";
	text += "<span class='small'>";
	text += "<b>who wins each one-on-one?</b><br>";

	var ballots = model.getBallots();

	// Create the WIN tally
	var tally = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;

	// For each combination... who's the better ranking?
	for(var i=0; i<model.candidates.length-1; i++){
		var a = model.candidates[i];
		for(var j=i+1; j<model.candidates.length; j++){
			var b = model.candidates[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}else{
					bWins++; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			if (aWins != bWins) {
				tally[winner.id]++;

				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
				}else{
					by = bWins;
					to = aWins;
				}
				text += _icon(a.id)+" vs "+_icon(b.id)+": "+_icon(winner.id)+" wins by "+by+" to "+to+"<br>";
			} else { //tie
				tally[a.id]++;
				tally[b.id]++;
				text += _icon(a.id)+" vs "+_icon(b.id)+": "+"TIE"+"<br>";
			}
		}
	}

	// Was there one who won all????
	var topWinners = [];
	
	for(var id in tally){
		if(tally[id]==model.candidates.length-1){
			topWinners.push(id);
		}
	}
	// probably it would be better to find the smith set but this is okay for now
	topWinners = _countWinner(tally);
	var color = _colorWinner(model, topWinners);
	if (model.dotop2) model.top2 = _sortTally(tally).slice(0,2)
	if (!options.sidebar) return
	
	var topWinner = topWinners[0];
	// Winner... or NOT!!!!
	text += "<br>";
	if (topWinners.length == 1) {
		text += _icon(topWinner)+" beats all other candidates in one-on-one races.<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+topWinner.toUpperCase()+"</b> WINS";
	}else if (topWinners.length >= 2) {
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i].id;
			text += _icon(c)+" got "+tally[c]+" wins<br>";
		}
		text += _tietext(topWinners);
	} else {
		text += "NOBODY beats everyone else in one-on-one races.<br>";
		text += "</span>";
		text += "<br>";
		text += "THERE'S NO WINNER.<br>";
		text += "<b id='ohno'>OH NO.</b>";
	}

	// what's the loop?

	model.caption.innerHTML = text;

};

Election.borda = function(model, options){

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		for(var i=0; i<ballot.rank.length; i++){
			var candidate = ballot.rank[i];
			tally[candidate] += i; // the rank!
		}
	});
	var winners = _countLoser(tally); // LOWER score is best!
	var color = _colorWinner(model, winners);
	if (model.dotop2) model.top2 = _sortTallyRev(tally).slice(0,2)
	if (!options.sidebar) return

	// Caption
	var text = "";
	text += "<span class='small'>";
	text += "<b>lower score is better</b><br>";
	for(var i=0; i<model.candidates.length; i++){
		var c = model.candidates[i].id;
		text += _icon(c)+"'s total score: "+tally[c]+"<br>";
	}
	if(winners.length>=2){
		// NO WINNER?! OR TIE?!?!
		text += _tietext(winners);
	}else{
		var winner = winners[0];
		text += "<br>";
		text += _icon(winner)+" has the <i>lowest</i> score, so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+winner.toUpperCase()+"</b> WINS";
	}
	model.caption.innerHTML = text;
};

Election.irv = function(model, options){

	var text = "";
	text += "<span class='small'>";

	var resolved = null;
	var roundNum = 1;

	var candidates = [];
	for(var i=0; i<model.candidates.length; i++){
		candidates.push(model.candidates[i].id);
	}
	var loserslist = []
	while(!resolved){

		text += "<b>round "+roundNum+":</b><br>";
		text += "who's voters' #1 choice?<br>";

		// Tally the approvals & get winner!
		var pre_tally = _tally(model, function(tally, ballot){
			var first = ballot.rank[0]; // just count #1
			tally[first]++;
		});

		// ONLY tally the remaining candidates...
		var tally = {};
		for(var i=0; i<candidates.length; i++){
			var cID = candidates[i];
			tally[cID] = pre_tally[cID];
		}

		// Say 'em...
		for(var i=0; i<candidates.length; i++){
			var c = candidates[i];
			text += _icon(c)+":"+tally[c];
			if(i<candidates.length-1) text+=", ";
		}
		text += "<br>";

		// Do they have more than 50%?
		var winners = _countWinner(tally);
		var winner = winners[0];
		var ratio = tally[winner]/model.getTotalVoters();
		if(ratio>0.5){
			if (winners.length >= 2) {	// won't happen bc ratio > .5	
				resolved = "tie"; 
				break;
			}
			resolved = "done";
			text += _icon(winner)+" has more than 50%<br>";
			break;
		}

		// Otherwise... runoff...
		var losers = _countLoser(tally);
		var loser = losers[0];
		if (losers.length >= candidates.length) {
			resolved = "tie"; 
			break;
		}
		loserslist = loserslist.concat(losers)

		// ACTUALLY ELIMINATE
		
		text += "nobody's more than 50%. ";
		for (var li = 0; li < losers.length ; li++ ) {
			loser = losers[li];
			text += "eliminate loser, "+_icon(loser)+". next round!<br>";
			candidates.splice(candidates.indexOf(loser), 1); // remove from candidates...
			var ballots = model.getBallots();
			for(var i=0; i<ballots.length; i++){
				var rank = ballots[i].rank;
				rank.splice(rank.indexOf(loser), 1); // REMOVE THE LOSER
			}
			// And repeat!
			roundNum++;
		}
		text += "<br>"
	
	}
	if (model.dotop2) {
		loserslist = loserslist.concat(_sortTallyRev(tally))
		var ll = loserslist.length
		model.top2 = loserslist.slice(ll-1,ll).concat(loserslist.slice(ll-2,ll-1))
	}
	
	
	var color = _colorWinner(model, winners);

	if (!options.sidebar) return

	if (resolved == "tie") {
		text += _tietext(winners);
	} else {
		// END!
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+winner.toUpperCase()+"</b> WINS";	
	}

	model.caption.innerHTML = text;

};

Election.plurality = function(model, options){

	options = options || {};

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		tally[ballot.vote]++;
	});
	var winners = _countWinner(tally);
	var color = _colorWinner(model, winners);
	if (model.dotop2) model.top2 = _sortTally(tally).slice(0,2)
	if (!options.sidebar) return

	// Caption
	var winner = winners[0];
	var text = "";
	text += "<span class='small'>";
	text += "<b>most votes wins</b><br>";
	for(var i=0; i<model.candidates.length; i++){
		var c = model.candidates[i].id;
		text += _icon(c)+" got "+tally[c]+" votes<br>";
	}
	// Caption text for winner, or tie
	if (winners.length == 1) {
		if(options.sidebar){
			text += "<br>";
			text += _icon(winner)+" has most votes, so...<br>";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+winner.toUpperCase()+"</b> WINS";
	} else {
		text += _tietext(winners);
	}
	model.caption.innerHTML = text;
};

var _tally = function(model, tallyFunc){

	// Create the tally
	var tally = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;

	// Count 'em up
	var ballots = model.getBallots();
	for(var i=0; i<ballots.length; i++){
		tallyFunc(tally, ballots[i]);
	}

	// Return it.
	return tally;

}

var _tallies = function(model, levels){

	// Create the tally
	var tallies = [];
	for (var level=0; level<levels; level++) {
		var tally = {};
		for(var candidateID in model.candidatesById) tally[candidateID] = 0;
		tallies.push(tally)
	}

	// Count 'em up
	var ballots = model.getBallots();
	for(var i=0; i<ballots.length; i++){
		var ballot = ballots[i]
		for(var candidate in ballot){
			tallies[ballot[candidate]][candidate] += 1;
		}
	}

	// Return it.
	return tallies;

}

var _countWinner = function(tally){

	// TO DO: TIES as an array?!?! // attempted

	var highScore = -1;
	var winners = [];

	for(var candidate in tally){
		var score = tally[candidate];
		if(score>highScore) {
			winners = [];
		}
		if(score>=highScore){
			highScore = score;
			winners.push(candidate);
		}
	}

	return winners;

}

var _sortTally = function(tally){
	
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return tally[b]-tally[a]})
	
	return frontrunners
}

var _sortTallyRev = function(tally){
	
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return -tally[b]+tally[a]})
	
	return frontrunners
}

var _countLoser = function(tally){

	// TO DO: TIES as an array?!?!

	var lowScore = Infinity;
	var winner = null;

	for(var candidate in tally){
		var score = tally[candidate];
		if(score<lowScore) {
			winners = [];
		}
		if(score<=lowScore){
			lowScore = score;
			winners.push(candidate);
		}
	}
	return winners;
}

var _colorWinner = function(model, winners){
	if (winners.length > 1) {
		var color = "#ccc"; // grey
		var colors = []
		for (i in winners) {
			var c1 = (winners[i]) ? Candidate.graphics[winners[i]].fill : "";
			colors.push(c1)
		}
		model.colors = colors;
	} else {
		var color = (winners[0]) ? Candidate.graphics[winners[0]].fill : "";
	}
	model.canvas.style.borderColor = color;
	model.winners = winners;
	model.color = color;
	return color;
}

function _tietext(winners) {
	text = "";
	for ( var i=0; i < winners.length; i++) {
		if(i) {
			text += " and ";
		} 
		text += _icon(winners[i]); 
	}
	text += " tie<br>";
	text += "</span>";
	text += "<br>";	
	text += "<b>TIE</b>";
	return text;
}
