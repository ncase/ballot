window.FULL_SANDBOX = window.FULL_SANDBOX || false;
window.HACK_BIG_RANGE = true;

window.ONLY_ONCE = false;

function main(config){

	// ONCE.
	if(ONLY_ONCE) return;
	ONLY_ONCE=true;

	///////////////////////////////////////////////////////////////
	// ACTUALLY... IF THERE'S DATA IN THE QUERY STRING, OVERRIDE //
	///////////////////////////////////////////////////////////////

	var _getParameterByName = function(name, url){
		var url = window.top.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	};
	var modelData = _getParameterByName("m");
	if(modelData){

		// Parse!
		var data = JSON.parse(modelData);

		config = data;
		config.frontrunnerSet = new Set(config.afrontrunnerArray) // stringify a set is not good

	}
	// Defaults...
	config = config || {};
	config.system = config.system || "FPTP";
	config.candidates = config.candidates || 3;
	config.voters = config.voters || 1;
	config.features = config.features || 1; // 1-basic, 2-voters, 3-candidates, 4-save
	config.doPercentFirst = config.doPercentFirst || false;
	config.doFullStrategyConfig = config.doFullStrategyConfig || false;
	config.frontrunnerSet = config.frontrunnerSet || new Set(["square"]);
	config.voterStrategies = config.voterStrategies || []
	config.description = config.description || ""
	for (i in [0,1,2]) {
		config.voterStrategies[i] = config.voterStrategies[i] || "nope"
	}
	config.voterPercentStrategy = config.voterPercentStrategy || []
	for (i in [0,1,2]) {
		config.voterPercentStrategy[i] = config.voterPercentStrategy[i] || 0
	}
	config.snowman = config.snowman || false;
	
	config.unstrategic = config.unstrategic || "nope";
	config.afrontrunnerArray = Array.from(config.frontrunnerSet)// stringify a set is not good
	var initialConfig = JSON.parse(JSON.stringify(config));

	Loader.onload = function(){

		////////////////////////
		// THE FRIGGIN' MODEL //
		////////////////////////

		window.model = new Model();
		document.querySelector("#center").appendChild(model.dom);
		model.dom.removeChild(model.caption);
		document.querySelector("#right").appendChild(model.caption);
		model.caption.style.width = "";

		// INIT!
		model.onInit = function(){

			// Based on config... what should be what?
			model.numOfCandidates = config.candidates;
			model.numOfVoters = config.voters;
			model.system = config.system;
			model.frontrunnerSet = config.frontrunnerSet;
			var votingSystem = votingSystems.filter(function(system){
				return(system.name==model.system);
			})[0];
			model.voterType = votingSystem.voter;
			model.election = votingSystem.election;

			// Voters
			var num = model.numOfVoters;
			var voterPositions;
			if(num==1){
				voterPositions = [[150,150]];
			}else if(num==2){
				voterPositions = [[150,100],[150,200]];
			}else if(num==3){
				voterPositions = [[150,65],[150,150],[150,235]];
				if (config.snowman) {
					voterPositions =  [[150,83],[150,150],[150,195]]
				}
			}
			for(var i=0; i<num; i++){
				var pos = voterPositions[i];
				model.addVoters({
					dist: GaussianVoters,
					type: model.voterType,
					strategy: config.voterStrategies[i],
					percentStrategy: config.voterPercentStrategy[i],
					frontrunnerSet: config.frontrunnerSet,
					unstrategic: config.unstrategic,
					vid: i,
					snowman: config.snowman,
					num:(4-num),
					x:pos[0], y:pos[1]
				});
			}

			// Candidates, in a circle around the center.
			var _candidateIDs = ["square","triangle","hexagon","pentagon","bob"];
			var angle = 0;
			var num = model.numOfCandidates;
			switch(num){
				case 3: angle=Math.TAU/12; break;
				case 4: angle=Math.TAU/8; break;
				case 5: angle=Math.TAU/6.6; break;
			}
			for(var i=0; i<num; i++){
				var r = 100;
				var x = 150 - r*Math.cos(angle);
				var y = 150 - r*Math.sin(angle);
				var id = _candidateIDs[i];
				model.addCandidate(id, x, y);
				angle += Math.TAU/num;
			}

		};
		model.election = Election.plurality;
		model.onUpdate = function(){
			model.election(model, {sidebar:true});
		};

		// In Position!
		var setInPosition = function(){ // runs when we change the config for number of voters  or candidates

			var positions;

			// CANDIDATE POSITIONS
			positions = config.candidatePositions;
			if(positions){
				for(var i=0; i<positions.length; i++){
					var position = positions[i];
					var candidate = model.candidates[i];
					candidate.x = position[0];
					candidate.y = position[1];
				}
			}

			// VOTER POSITION
			positions = config.voterPositions;
			if(positions){
				for(var i=0; i<positions.length; i++){
					var position = positions[i];
					var voter = model.voters[i];
					voter.x = position[0];
					voter.y = position[1];
				}
			}

			// update!
			model.update();

		};


		//////////////////////////////////
		// BUTTONS - WHAT VOTING SYSTEM //
		//////////////////////////////////

		// Which voting system?
		var votingSystems = [
			{name:"FPTP", voter:PluralityVoter, election:Election.plurality, margin:4},
			{name:"IRV", voter:RankedVoter, election:Election.irv},
			{name:"Borda", voter:RankedVoter, election:Election.borda, margin:4},
			{name:"Condorcet", voter:RankedVoter, election:Election.condorcet},
			{name:"Approval", voter:ApprovalVoter, election:Election.approval, margin:4},
			{name:"Score", voter:ScoreVoter, election:Election.score},
			{name:"STAR", voter:ScoreVoter, election:Election.star, margin:4},
			{name:"3-2-1", voter:ThreeVoter, election:Election.three21}
		];
		var onChooseSystem = function(data){

			// update config...
			config.system = data.name;

			// no reset...
			model.voterType = data.voter;
			for(var i=0;i<model.voters.length;i++){
				model.voters[i].setType(data.voter);
			}
			model.election = data.election;
			model.update();

		};
		window.chooseSystem = new ButtonGroup({
			label: "what voting system?",
			width: 108,
			data: votingSystems,
			onChoose: onChooseSystem
		});
		document.querySelector("#left").appendChild(chooseSystem.dom);

		// How many voters?
		if(initialConfig.features>=2){ // CANDIDATES as feature.

			var voters = [
				{name:"one", num:1, margin:4},
				{name:"two", num:2, margin:4},
				{name:"three", num:3, margin:4},
				{name:"snow", num:3, snowman:true},
			];
			var onChooseVoters = function(data){

				// update config...
				config.voters = data.num;
				
				config.snowman = data.snowman || false;
				// save candidates before switching!
				config.candidatePositions = save().candidatePositions;

				// reset!
				config.voterPositions = null;
				model.reset();
				setInPosition();

			};
			window.chooseVoters = new ButtonGroup({
				label: "how many groups of voters?",
				width: 52,
				data: voters,
				onChoose: onChooseVoters
			});
			document.querySelector("#left").appendChild(chooseVoters.dom);

		}

		// How many candidates?
		if(initialConfig.features>=3){ // VOTERS as feature.

			var candidates = [
				{name:"two", num:2, margin:4},
				{name:"three", num:3, margin:4},
				{name:"four", num:4, margin:4},
				{name:"five", num:5}
			];
			var onChooseCandidates = function(data){

				// update config...
				config.candidates = data.num;

				// save voters before switching!
				config.voterPositions = save().voterPositions;

				// reset!
				config.candidatePositions = null;
				model.reset();
				setInPosition();

			};
			window.chooseCandidates = new ButtonGroup({
				label: "how many candidates?",
				width: 52,
				data: candidates,
				onChoose: onChooseCandidates
			});
			document.querySelector("#left").appendChild(chooseCandidates.dom);

		}
		
		
		
		if(initialConfig.doFullStrategyConfig){ // VOTERS as feature.

			
			var strategyOn = [
				{name:"NO", realname:"nope", margin:4},
				{name:"FL", realname:"justfirstandlast", margin:4},
				{name:"NR", realname:"normalized", margin:4},
				{name:"T", realname:"threshold"},
				{name:"TF", realname:"thresholdfrontrunners", margin:4},
				{name:"NTF", realname:"normfrontrunners", margin:4},
				{name:"MTF", realname:"morethresholdfrontrunners", margin:4},
				{name:"SNTF", realname:"starnormfrontrunners"}
			];
			var onChooseVoterStrategyOn = function(data){
				
				// update config...
				// only the middle percent (for the yellow triangle)

				// no reset...
				for(var i=0;i<model.voters.length;i++){
					config.voterStrategies[i] = data.realname; 
					model.voters[i].strategy = config.voterStrategies[i]
				}
				model.update();
				
			};
			window.chooseVoterStrategyOn = new ButtonGroup({
				label: "do voters strategize?",
				width: 52,
				data: strategyOn,
				onChoose: onChooseVoterStrategyOn
			});
			document.querySelector("#left").appendChild(chooseVoterStrategyOn.dom);

		}
		
		
		if(0){ // VOTERS as feature.
			
			var strategyPercent = [
				{name:"0", num:0, margin:4},
				{name:"50", num:50, margin:4},
				{name:"80", num:80, margin:4},
				{name:"100", num:100}
			];
			var onChoosePercentStrategy = function(data){
				
				// update config...
				config.voterPercentStrategy[0] = data.num;

				// no reset...
				for(var i=0;i<model.voters.length;i++){
					model.voters[i].percentStrategy = config.voterPercentStrategy[i]
				}
				model.update();
				
			};
			window.choosePercentStrategy = new ButtonGroup({
				label: "how many strategize? %",
				width: 52,
				data: strategyPercent,
				onChoose: onChoosePercentStrategy
			});
			document.querySelector("#left").appendChild(choosePercentStrategy.dom);

		}
		
		if(initialConfig.doPercentFirst){
			
			var aba = document.createElement('div')
			aba.className = "button-group"
			document.querySelector("#left").appendChild(aba)
			var aba2 = document.createElement('div')
			aba2.className = "button-group-label"
			aba2.innerHTML = "how many voters strategize?";
			aba.appendChild(aba2)
			
			var makeslider = function(chtext,chid,chfn,containchecks,n) {
				var slider = document.createElement("input");
				slider.type = "range";
				slider.max = "100";
				slider.min = "0";
				slider.value = "50";
				//slider.setAttribute("width","20px");
				slider.id = chid;
				slider.class = "slider";
				slider.addEventListener('input', function() {chfn(slider,n)}, true);
				var label = document.createElement('label')
				label.htmlFor = chid;
				label.appendChild(document.createTextNode(chtext));
				containchecks.appendChild(slider);
				//containchecks.appendChild(label);
				slider.innerHTML = chtext;
				return slider
			} // https://stackoverflow.com/a/866249/8210071

			var containchecks = document.querySelector("#left").appendChild(document.createElement('div'));
			containchecks.id="containsliders"
			var slfn = function(slider,n) {
				// update config...
					config.voterPercentStrategy[n] = slider.value;
					if (n<model.numOfVoters) {
						model.voters[n].percentStrategy = config.voterPercentStrategy[n]
						model.update();
					}
			}
			var stratsliders = []
			stratsliders.push(makeslider("","choosepercent",slfn,containchecks,0))
			stratsliders.push(makeslider("","choosepercent",slfn,containchecks,1))
			stratsliders.push(makeslider("","choosepercent",slfn,containchecks,2))
		}

		
		
		if(initialConfig.doFullStrategyConfig){ 

			
			var strategyOff = [
				{name:"NO", realname:"nope", margin:4},
				{name:"FL", realname:"justfirstandlast", margin:4},
				{name:"NR", realname:"normalized", margin:4},
				{name:"T", realname:"threshold"},
				{name:"TF", realname:"thresholdfrontrunners", margin:4},
				{name:"NTF", realname:"normfrontrunners", margin:4},
				{name:"MTF", realname:"morethresholdfrontrunners", margin:4},
				{name:"SNTF", realname:"starnormfrontrunners"}
			];
			var onChooseVoterStrategyOff = function(data){
				
				// update config...
				// only the middle percent (for the yellow triangle)

				// no reset...
				for(var i=0;i<model.voters.length;i++){
					config.unstrategic = data.realname; 
					model.voters[i].unstrategic = config.unstrategic
				}
				model.update();
				
			};
			window.chooseVoterStrategyOff = new ButtonGroup({
				label: "what do the rest do?",
				width: 52,
				data: strategyOff,
				onChoose: onChooseVoterStrategyOff
			});
			document.querySelector("#left").appendChild(chooseVoterStrategyOff.dom);

		}
		
		
		
		if(initialConfig.doFullStrategyConfig){ 

			var h1 = function(x) {return "<span class='buttonshape'>"+_icon(x)+"</span>"}
			var frun = [
				{name:h1("square"),realname:"square",margin:5},
				{name:h1("triangle"),realname:"triangle",margin:5},
				{name:h1("hexagon"),realname:"hexagon",margin:5},
				{name:h1("pentagon"),realname:"pentagon",margin:5},
				{name:h1("bob"),realname:"bob"}
			];
			var onChooseFrun = function(data){
				
				// update config...
				// no reset...
				if (data.isOn) {
					config.frontrunnerSet.add(data.realname)
				} else {
					config.frontrunnerSet.delete(data.realname)
				} 
				model.frontrunnerSet = config.frontrunnerSet
				model.update();
				
			};
			window.chooseFrun = new ButtonGroup({
				label: "who are the frontrunners?",
				width: 40,
				data: frun,
				onChoose: onChooseFrun,
				isCheckbox: true
			});
			document.querySelector("#left").appendChild(chooseFrun.dom);

		}
		
		if(initialConfig.doFullStrategyConfig){ 
			
			var poll = [
				{name:"Poll"}
			];
			var onChoosePoll = function(data){
				var won = model.winners
				config.frontrunnerSet = new Set(won)
				model.frontrunnerSet = config.frontrunnerSet
				if(window.chooseFrun) chooseFrun.highlight("realname", model.frontrunnerSet);
				model.update();
				
			};
			window.choosePoll = new ButtonGroup({
				label: "Poll to find new frontrunner:",
				width: 52,
				data: poll,
				onChoose: onChoosePoll,
				justButton: true
			});
			document.querySelector("#left").appendChild(choosePoll.dom);
		}
		
		///////////////////////
		//////// INIT! ////////
		///////////////////////

		model.onInit(); // NOT init, coz don't update yet...
		setInPosition();

		// Select the UI!
		var selectUI = function(){
			if(window.chooseSystem) chooseSystem.highlight("name", model.system);
			if(window.chooseCandidates) chooseCandidates.highlight("num", model.numOfCandidates);
			if(window.chooseVoters) chooseVoters.highlight("num", model.numOfVoters);
			if(window.choosePercentStrategy) choosePercentStrategy.highlight("num", model.voters[0].percentStrategy);
			if(window.chooseVoterStrategyOn) chooseVoterStrategyOn.highlight("realname", model.voters[0].strategy);
			if(window.chooseVoterStrategyOff) chooseVoterStrategyOff.highlight("realname", model.voters[0].unstrategic);
			if(window.chooseFrun) chooseFrun.highlight("realname", model.frontrunnerSet);
			if(stratsliders) {
				for (i in stratsliders) {
					stratsliders[i].value = config.voterPercentStrategy[i]
				}
			}
		};
		selectUI();


		//////////////////////////
		//////// RESET... ////////
		//////////////////////////

		// CREATE A RESET BUTTON
		var resetDOM = document.createElement("div");
		resetDOM.id = "reset";
		resetDOM.innerHTML = "reset";
		resetDOM.style.top = "340px";
		resetDOM.style.left = "350px";
		resetDOM.onclick = function(){

			config = JSON.parse(JSON.stringify(initialConfig)); // RESTORE IT!
			config.frontrunnerSet = new Set(config.afrontrunnerArray); // stringify a set is not good
			// Reset manually, coz update LATER.
			model.reset(true);
			model.onInit();
			setInPosition();

			// Back to ol' UI
			selectUI();

		};
		document.body.appendChild(resetDOM);


		///////////////////////////
		////// SAVE POSITION //////
		///////////////////////////

		window.save = function(log){

			// Candidate positions
			var positions = [];
			for(var i=0; i<model.candidates.length; i++){
				var candidate = model.candidates[i];
				positions.push([
					Math.round(candidate.x),
					Math.round(candidate.y)
				]);
			}
			if(log) console.log("candidatePositions: "+JSON.stringify(positions));
			var candidatePositions = positions;

			// Voter positions
			positions = [];
			for(var i=0; i<model.voters.length; i++){
				var voter = model.voters[i];
				positions.push([
					Math.round(voter.x),
					Math.round(voter.y)
				]);
			}
			if(log) console.log("voterPositions: "+JSON.stringify(positions));
			var voterPositions = positions;

			// positions!
			return {
				candidatePositions: candidatePositions,
				voterPositions: voterPositions
			};

		};

		window.jsave = function(log){
			var sofar = window.save()
			
			// Description
			var description = document.getElementById("description_text") || {value:""};
			config.description = description.value;
			
			var logtext = ''
			for (i in sofar) logtext += i + ": " +JSON.stringify(sofar[i]) + ',\n'
			for (i in config) {
				if (i == "frontrunnerSet"){
					logtext += i + ": new Set(" +JSON.stringify(Array.from(config[i])) + '),\n'
				} else if (i == "afrontrunnerArray" || i == "candidatePositions" || i == "voterPositions") {
					// skip
				} else {
					logtext += i + ": " +JSON.stringify(config[i]) + ',\n'
				}
			}
			console.log(logtext)
			if (log==2) console.log(JSON.stringify(config))
			
			for (i in sofar) config[i] = sofar[i]  // for some weird reason config doesn't have the correct positions, hope i'm not introducing a bug
			return config
		}


		//////////////////////////////////
		/////// SAVE & SHARE, YO! ////////
		//////////////////////////////////

		var descText, linkText;
		if(1){ // SAVE & SHARE as feature.

			
			if (config.features >= 4) {
				// Create a description up top
				var descDOM = document.createElement("div");
				descDOM.id = "description_container";
				var refNode = document.getElementById("left");
				document.body.insertBefore(descDOM, refNode);
				descText = document.createElement("textarea");
				descText.id = "description_text";
				descDOM.appendChild(descText);

				// yay.
				descText.value = initialConfig.description;
			}
			// Move that reset button
			if (config.features >= 4) {
				resetDOM.style.top = "470px";
				resetDOM.style.left = "235px";
			} else {
				resetDOM.style.top = "330px";
				resetDOM.style.left = "235px";
			}
			// Create a "save" button
			var saveDOM = document.createElement("div");
			saveDOM.id = "save";
			saveDOM.innerHTML = "save:";
			if (config.features >= 4) {
				saveDOM.style.top = "470px";
				saveDOM.style.left = "350px";
			} else {
				saveDOM.style.top = "330px";
				saveDOM.style.left = "350px";
			}
			saveDOM.onclick = function(){
				_saveModel();
			};
			document.body.appendChild(saveDOM);

			// The share link textbox
			linkText = document.createElement("input");
			linkText.id = "savelink";
			linkText.placeholder = "[when you save your model, a link you can copy will show up here]";
			linkText.setAttribute("readonly", true);
			linkText.onclick = function(){
				linkText.select();
			};
			if (config.features >= 4) {
				//skip
			} else {
				linkText.style.position = "absolute";
				linkText.style.top = "330px";
				linkText.style.left = "460px";
			}
			document.body.appendChild(linkText);

			// Create a URL... (later, PARSE!)
			// save... ?d={s:[system], v:[voterPositions], c:[candidatePositions], d:[description]}

		}


	};

	Loader.load([
		"img/voter_face.png",
		"img/square.png",
		"img/triangle.png",
		"img/hexagon.png",
		"img/pentagon.png",
		"img/bob.png"
	]);

	// SAVE & PARSE
	// ?m={s:[system], v:[voterPositions], c:[candidatePositions], d:[description]}
	
	
	var _saveModel = function(){

		jsave(1)  // updates config with positions and gives a log of settings to copy and paste
		
		// URI ENCODE!
		config.afrontrunnerArray = Array.from(config.frontrunnerSet); // stringify a set is not good
		var uri = encodeURIComponent(JSON.stringify(config));

		// ALSO TURN IT INTO INITIAL CONFIG. _parseModel
		
		initialConfig = JSON.parse(JSON.stringify(config)); // RESTORE IT!
		initialConfig.frontrunnerSet = new Set(initialConfig.afrontrunnerArray); // stringify a set is not good
		
		// Put it in the save link box!
		
		// make link string
		var getUrl = window.location;
		var baseUrl = getUrl.protocol + "//" + getUrl.host; //http://ncase.me/ballot
		var restofurl = getUrl.pathname.split('/')
		for (var i=1; i < restofurl.length - 2; i++) {baseUrl += "/" + restofurl[i];}
		var link = baseUrl + "/sandbox/?m="+uri;
		
		var savelink = document.getElementById("savelink");
		savelink.value = "saving...";
		setTimeout(function(){
			savelink.value = link;
		},750);

	};

	// FUNNY HACK.
	setInterval(function(){
		var ohno = document.getElementById("ohno");
		if(!ohno) return;
		var x = Math.round(Math.random()*10-5);
		var y = Math.round(Math.random()*10)+10;
		ohno.style.top = y+"px";
		ohno.style.left = x+"px";
	},10);

};
