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
		return decodeURIComponent(results[2].replace(/\+/g, " ")).replace("}/","}"); //not sure how that / got there.
	};
	var modelData = _getParameterByName("m");
	if(modelData){

		// Parse!
		var data = JSON.parse(modelData);

		config = data;
		config.frontrunnerSet = new Set(config.afrontrunnerArray) // stringify a set is not good

	}

	var initialConfig
	var allnames = ["systems","voters","candidates","strategy","percentstrategy","unstrategic","frontrunners","poll","yee"]
	var doms = {}  // for hiding menus, later
	var stratsliders = [] // for hiding sliders, later
	
	var loadDefaults = function() {
		// Defaults...
		config = config || {};
		config.system = config.system || "FPTP";
		config.candidates = config.candidates || 3;
		config.voters = config.voters || 1;
		config.snowman = config.snowman || false;
		//config.votersRealName = config.votersRealName || "Single Voter";
		config.oneVoter = config.oneVoter || false;

		config.features = config.features || 0; // 1-basic, 2-voters, 3-candidates, 4-save
		if (       config.features == 0 && ! config.featurelist) {config.featurelist = ["systems"]  // old spec
		} else if (config.features == 1) {config.featurelist = ["systems"]
		} else if (config.features == 2) {config.featurelist = ["systems","voters"]
		} else if (config.features == 3) {config.featurelist = ["systems","voters","candidates"]
		} else if (config.features == 4) {config.featurelist = ["systems","voters","candidates"]; config.sandboxsave = true;}
		config.sandboxsave = config.sandboxsave || false;
		config.featurelist = config.featurelist || ["systems"]
		config.doPercentFirst = config.doPercentFirst || false;
		if (config.doPercentFirst) config.featurelist = config.featurelist.concat(["percentstrategy"]);
		config.doFullStrategyConfig = config.doFullStrategyConfig || false;
		if (config.doFullStrategyConfig) config.featurelist = config.featurelist.concat(["strategy","percentstrategy","unstrategic","frontrunners","poll","yee"])
		// clear the grandfathered config settings
		config.doPercentFirst = undefined
		config.features = undefined
		config.doFullStrategyConfig = undefined
		config.hidegearconfig = config.hidegearconfig || false;
		
		config.frontrunnerSet = config.frontrunnerSet || new Set(["square"]);
		config.voterStrategies = config.voterStrategies || []
		config.description = config.description || ""
		for (i in [0,1,2]) {
			config.voterStrategies[i] = config.voterStrategies[i] || "zero strategy. judge on an absolute scale."
		}
		config.voterPercentStrategy = config.voterPercentStrategy || []
		for (i in [0,1,2]) {
			config.voterPercentStrategy[i] = config.voterPercentStrategy[i] || 0
		}
		
		config.unstrategic = config.unstrategic || "zero strategy. judge on an absolute scale.";
		config.keyyee = config.keyyee || "off";
		config.computeMethod = config.computeMethod || "ez";
		var url = window.location.pathname;
		var filename = url.substring(url.lastIndexOf('/')+1);
		config.filename = filename
		config.presethtmlname = filename;
		config.afrontrunnerArray = Array.from(config.frontrunnerSet)// stringify a set is not good
		initialConfig = JSON.parse(JSON.stringify(config));

	}
	loadDefaults()
	
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
			model.votersRealName = voters.filter( function(x){return (x.num==config.voters && (x.snowman||false)==config.snowman && (x.oneVoter||false) == config.oneVoter) })[0].realname
			model.system = config.system;
			model.frontrunnerSet = config.frontrunnerSet;
			model.computeMethod = config.computeMethod;
			var votingSystem = votingSystems.filter(function(system){
				return(system.name==model.system);
			})[0];
			model.voterType = votingSystem.voter;
			model.ballotType = window[votingSystem.ballot];
			model.election = votingSystem.election;

			// Voters
			var num = model.numOfVoters;
			var voterPositions;
			if(num==1){
				voterPositions = [[150,150]];
			}else if(num==2){
				voterPositions = [[95,150],[205,150]];
			}else if(num==3){
				voterPositions = [[65,150],[150,150],[235,150]];
				if (config.snowman) {
					voterPositions =  [[150,83],[150,150],[150,195]]
				}
			}
			for(var i=0; i<num; i++){
				var pos = voterPositions[i];
				if (config.oneVoter) {
					var dist1 = SingleVoter
				} else {
					var dist1 = GaussianVoters
				}
				model.addVoters({
					dist: dist1,
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
			
			for (i in [0,1,2]) stratsliders[i].setAttribute("style",(i<config.voters) ?  "display:inline": "display:none")
			
			// Yee diagram
			if (config.kindayee == "can") {
				model.yeeobject = model.candidatesById[config.keyyee]
			} else if (config.kindayee=="voter") {
				model.yeeobject = model.voters[config.keyyee]
			} else if (config.kindayee=="off") {
				model.yeeobject = undefined
			} else { // if yeeobject is not defined
				model.yeeobject = undefined
			}
			if (model.yeeobject) {model.yeeon = true} else {model.yeeon = false}
			

			// hide some menus
			for (i in allnames) if(config.featurelist.includes(allnames[i])) {doms[allnames[i]].hidden = false} else {doms[allnames[i]].hidden = true}

		};
		model.election = Election.plurality;
		model.onUpdate = function(){
			model.election(model, {sidebar:true});
			
			// CREATE A BALLOT
			var myNode = document.querySelector("#right");
			while (myNode.firstChild) {
				myNode.removeChild(myNode.firstChild);
			}  // remove old one, if there was one
			// document.querySelector("#ballot").remove()	
			if (config.oneVoter) {
				window.ballot = new model.ballotType();
				document.querySelector("#right").appendChild(ballot.dom);
			} else {
				document.querySelector("#right").appendChild(model.caption);
			}
			
			if (config.oneVoter) {
				ballot.update(model.voters[0].ballot);
			}
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
			{name:"FPTP", voter:PluralityVoter, ballot:"PluralityBallot", election:Election.plurality, margin:4},
			{name:"IRV", voter:RankedVoter, ballot:"RankedBallot", election:Election.irv},
			{name:"Borda", voter:RankedVoter, ballot:"RankedBallot", election:Election.borda, margin:4},
			{name:"Condorcet", voter:RankedVoter, ballot:"RankedBallot", election:Election.condorcet},
			{name:"Approval", voter:ApprovalVoter, ballot:"ApprovalBallot", election:Election.approval, margin:4},
			{name:"Score", voter:ScoreVoter, ballot:"ScoreBallot", election:Election.score},
			{name:"STAR", voter:ScoreVoter, ballot:"ScoreBallot", election:Election.star, margin:4},
			{name:"3-2-1", voter:ThreeVoter, ballot:"ThreeBallot", election:Election.three21}
		];
		var onChooseSystem = function(data){

			// update config...
			config.system = data.name;

			// no reset...
			model.voterType = data.voter;
			model.ballotType = window[data.ballot];
			
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
		doms["systems"] = chooseSystem.dom


		
		
		// How many voters?
		var voters = [
			{realname: "Single Voter", name:"&#50883;", num:1, margin:5, oneVoter:true},
			{realname: "One Group", name:"1", num:1, margin:5},
			{realname: "Two Groups", name:"2", num:2, margin:5},
			{realname: "Three Groups", name:"3", num:3, margin:5},
			{realname: "Different Sized Groups (like a snowman)", name:"&#x2603;", num:3, snowman:true},
		];
		var onChooseVoters = function(data){

			// update config...
			config.voters = data.num;
			
			config.snowman = data.snowman || false;
			config.oneVoter = data.oneVoter || false;
			model.votersRealName = data.realname;
			// save candidates before switching!
			config.candidatePositions = save().candidatePositions;

			// reset!
			config.voterPositions = null;
			model.reset();
			setInPosition();
			
			
			for (i in [0,1,2]) stratsliders[i].setAttribute("style",(i<data.num) ?  "display:inline": "display:none")

		};
		window.chooseVoters = new ButtonGroup({
			label: "how many groups of voters?",
			width: 40,
			data: voters,
			onChoose: onChooseVoters
		});
		document.querySelector("#left").appendChild(chooseVoters.dom);
		doms["voters"] = chooseVoters.dom
		
		
		
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
		doms["candidates"] = chooseCandidates.dom
		
		
		
		// strategy
		
		var strategyOn = [
			{name:"O", realname:"zero strategy. judge on an absolute scale.", margin:5},
			{name:"N", realname:"normalize", margin:5},
			{name:"F", realname:"normalize frontrunners only", margin:5},
			{name:"B", realname:"best frontrunner", margin:5},
			{name:"W", realname:"not the worst frontrunner"}
		];
		// old ones
		// {name:"FL", realname:"justfirstandlast", margin:5},
		// {name:"T", realname:"threshold"},
		// {name:"SNTF", realname:"starnormfrontrunners"}
			
		
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
			width: 40,
			data: strategyOn,
			onChoose: onChooseVoterStrategyOn
		});
		document.querySelector("#left").appendChild(chooseVoterStrategyOn.dom);
		doms["strategy"] = chooseVoterStrategyOn.dom

		if(0){

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
		
		
		
		// percentstrategy
		
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

		var containchecks = aba.appendChild(document.createElement('div'));
		containchecks.id="containsliders"
		var slfn = function(slider,n) {
			// update config...
				config.voterPercentStrategy[n] = slider.value;
				if (n<model.numOfVoters) {
					model.voters[n].percentStrategy = config.voterPercentStrategy[n]
					model.update();
				}
		}
		stratsliders.push(makeslider("","choosepercent",slfn,containchecks,0))
		stratsliders.push(makeslider("","choosepercent",slfn,containchecks,1))
		stratsliders.push(makeslider("","choosepercent",slfn,containchecks,2))
		doms["percentstrategy"] = aba


		// unstrategic

		var strategyOff = [
			{name:"O", realname:"zero strategy. judge on an absolute scale.", margin:5},
			{name:"N", realname:"normalize", margin:5},
			{name:"F", realname:"normalize frontrunners only", margin:5},
			{name:"B", realname:"best frontrunner", margin:5},
			{name:"W", realname:"not the worst frontrunner"}
		];
		// old ones
		// {name:"FL", realname:"justfirstandlast", margin:5},
		// {name:"T", realname:"threshold"},
		// {name:"SNTF", realname:"starnormfrontrunners"}
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
			width: 40,
			data: strategyOff,
			onChoose: onChooseVoterStrategyOff
		});
		document.querySelector("#left").appendChild(chooseVoterStrategyOff.dom);
		doms["unstrategic"] = chooseVoterStrategyOff.dom
		
		
		
		// frontrunners
		
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
		doms["frontrunners"] = chooseFrun.dom
		
		
		
		// do a poll to find frontrunner
		
		var poll = [
			{name:"Poll",margin:5},
			{name:"Poll 2",realname:"Find the top 2 frontrunners."}
		];
		var onChoosePoll = function(data){
			if (data.name == "Poll") {
				var won = model.winners
				config.frontrunnerSet = new Set(won)
			} else {
				model.dotop2 = true // not yet implemented
				model.update()
				model.dotop2 = false
				config.frontrunnerSet = new Set(model.top2)
				model.top2 = []
			}
			
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
		doms["poll"] = choosePoll.dom
		
		
		
		// yee

		var h1 = function(x) {return "<span class='buttonshape'>"+_icon(x)+"</span>"}
		var yeeobject = [
			{name:h1("square"),realname:"square",keyyee:"square",kindayee:"can",margin:4},
			{name:h1("triangle"),realname:"triangle",keyyee:"triangle",kindayee:"can",margin:4},
			{name:h1("hexagon"),realname:"hexagon",keyyee:"hexagon",kindayee:"can",margin:4},
			{name:h1("pentagon"),realname:"pentagon",keyyee:"pentagon",kindayee:"can",margin:4},
			{name:h1("bob"),realname:"bob",keyyee:"bob",kindayee:"can",margin:8},
			{name:"1",realname:"first voter group",kindayee:"voter",keyyee:0,margin:4},
			{name:"2",realname:"second voter group",kindayee:"voter",keyyee:1,margin:4},
			{name:"3",realname:"third voter group",kindayee:"voter",keyyee:2,margin:8},
			{name:"off",realname:"turn off",keyyee:"off",kindayee:"off"}
		];
		var onChooseyeeobject = function(data){

			config.kindayee = data.kindayee
			if (data.kindayee == "can") {
				model.yeeobject = model.candidatesById[data.keyyee]
			} else if (data.kindayee=="voter") {
				model.yeeobject = model.voters[data.keyyee]
			} else if (data.kindayee=="off") {
				model.yeeobject = undefined
			}
			if (model.yeeobject) {model.yeeon = true} else {model.yeeon = false}
			config.keyyee = data.keyyee
			model.update();

		};
		window.chooseyeeobject = new ButtonGroup({
			label: "which object for yee map?",
			width: 20,
			data: yeeobject,
			onChoose: onChooseyeeobject
		});
		chooseyeeobject.dom.setAttribute("id","yee")
		document.querySelector("#left").appendChild(chooseyeeobject.dom);
		doms["yee"] = chooseyeeobject.dom
		
		
		
		
		// gear config - decide which menu items to do

		// var allnames = ["systems","voters","candidates","strategy","percentstrategy","unstrategic","frontrunners","poll","yee"] // not "save"
		var gearconfig = []
		for (i in allnames) gearconfig.push({name:i,realname:allnames[i],margin:4})

		var onChoosegearconfig = function(data){
			var featureset = new Set(config.featurelist)
			if (data.isOn) {
				featureset.add(data.realname)
				doms[data.realname].hidden = false
			} else {
				featureset.delete(data.realname)
				doms[data.realname].hidden = true
			}
			config.featurelist = Array.from(featureset)

		};
		window.choosegearconfig = new ButtonGroup({
			label: "which menu options are displayed?",
			width: 18,
			data: gearconfig,
			onChoose: onChoosegearconfig,
			isCheckbox: true
		});
		choosegearconfig.dom.hidden = true
		document.querySelector("#left").insertBefore(choosegearconfig.dom,doms["systems"]);

		// get current filename, in order to go back to the original intended preset


		// var presetnames = ["O","SA"]
		// var presethtmlnames = [config.filename,"sandbox.html"]
		// var presetdescription = ["original intended preset","sandbox"]

		var presetnames = ["S"]
		var presethtmlnames = ["sandbox.html"]
		var presetdescription = ["sandbox"]

		// and fill in the rest
		for (var i=1;i<=14;i++) {presetnames.push("e"+i) ; presethtmlnames.push("election"+i+".html") ; presetdescription.push("election"+i+".html")}
		presetnames.push("O") ; presethtmlnames.push(filename) ; presetdescription.push("original intended preset")
		// TODO
		for (var i=1;i<=12;i++) {presetnames.push("b"+i) ; presethtmlnames.push("ballot"+i+".html") ; presetdescription.push("ballot"+i+".html")}
		


		var presetconfig = []
		for (i in presetnames) presetconfig.push({name:presetnames[i],realname:presetdescription[i],htmlname:presethtmlnames[i],margin:4})

		var onChoosepresetconfig = function(data){
			var firstletter = data.htmlname[0]
			if (firstletter == 'e' || firstletter == 's' || firstletter == 'f') {
				config = loadpreset(data.htmlname)
				loadDefaults()
				model.reset(true);
				model.onInit();
				setInPosition();
				selectUI();
			} else if (firstletter == 'b') {
				//document.location.replace(data.htmlname);
				ballotconfig = loadpreset(data.htmlname)
				var systemTranslator = {Plurality:"FPTP",Ranked:"Condorcet",Approval:"Approval",Score:"Score",Three:"3-2-1"}
				config = {}
				config.system = systemTranslator[ballotconfig.system]
				var s = ballotconfig.strategy || "zero strategy. judge on an absolute scale."
				config.voterStrategies = [s,s,s]
				config.frontrunnerSet = ballotconfig.frontrunnerSet
				config.featurelist = []
				if (ballotconfig.showChoiceOfFrontrunners) {config.featurelist.push("frontrunners")}
				if (ballotconfig.showChoiceOfStrategy) {config.featurelist.push("strategy")}
				config.oneVoter = true
				loadDefaults()
				model.reset(true);
				model.onInit();
				setInPosition();
				selectUI();
			}
		};
		window.choosepresetconfig = new ButtonGroup({
			label: "pick a preset:",
			width: 38,
			data: presetconfig,
			onChoose: onChoosepresetconfig
		});
		choosepresetconfig.dom.hidden = true
		document.querySelector("#left").insertBefore(choosepresetconfig.dom,doms["systems"]);
		
		if(window.choosepresetconfig) choosepresetconfig.highlight("htmlname", config.presethtmlname);
		// only do this once.  Otherwise it would be in SelectUI


		// Also handle messages from the parent window
		function bindEvent(element, eventName, eventHandler) {
            if (element.addEventListener) {
                element.addEventListener(eventName, eventHandler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventName, eventHandler);
            }
        }
        // Listen to messages from parent window
        bindEvent(window, 'message', function (e) {
			onChoosepresetconfig({htmlname:parent.globalHtmlName})
        });



		var computeMethod = [{name:"gpu",margin:4},{name:"js",margin:4},{name:"ez"}]
		var onChooseComputeMethod = function(data){
			config.computeMethod = data.name
			model.computeMethod = data.name
			if (model.yeeon) {model.calculateYee(); model.update()}
		};
		window.chooseComputeMethod = new ButtonGroup({
			label: "method of computing yee diagram:",
			width: 38,
			data: computeMethod,
			onChoose: onChooseComputeMethod
		});
		chooseComputeMethod.dom.hidden = true
		document.querySelector("#left").insertBefore(chooseComputeMethod.dom,doms["systems"]);
		
		// gear button (combines with above)
		
		var gearicon = [{name:"config"}]
		var onChoosegearicon = function(data){
			if (data.isOn) {
				choosegearconfig.dom.hidden = false
				choosepresetconfig.dom.hidden = false
				chooseComputeMethod.dom.hidden = false
			} else {
				choosegearconfig.dom.hidden = true
				choosepresetconfig.dom.hidden = true
				chooseComputeMethod.dom.hidden = true
			}
		};
		window.choosegearicon = new ButtonGroup({
			label: "",
			width: 60,
			data: gearicon,
			onChoose: onChoosegearicon,
			isCheckbox: true
		});
		document.querySelector("#left").insertBefore(choosegearicon.dom,choosegearconfig.dom);
		
		if(config.hidegearconfig) choosegearicon.dom.hidden = true
		
		
		///////////////////////
		//////// INIT! ////////
		///////////////////////

		model.onInit(); // NOT init, coz don't update yet...
		setInPosition();

		// Select the UI!
		var selectUI = function(){
			if(window.chooseSystem) chooseSystem.highlight("name", model.system);
			if(window.chooseCandidates) chooseCandidates.highlight("num", model.numOfCandidates);
			if(window.chooseVoters) chooseVoters.highlight("realname", model.votersRealName);
			if(window.choosePercentStrategy) choosePercentStrategy.highlight("num", model.voters[0].percentStrategy);
			if(window.chooseVoterStrategyOn) {
				if (model.voters[0].strategy != "starnormfrontrunners") { // kind of a hack for now, but I don't really want another button
					chooseVoterStrategyOn.highlight("realname", model.voters[0].strategy);
				}
			}
			if(window.chooseVoterStrategyOff) chooseVoterStrategyOff.highlight("realname", model.voters[0].unstrategic);
			if(window.chooseFrun) chooseFrun.highlight("realname", model.frontrunnerSet);
			if(stratsliders) {
				for (i in stratsliders) {
					stratsliders[i].value = config.voterPercentStrategy[i]
				}
			}
			if(window.chooseyeeobject) chooseyeeobject.highlight("keyyee", config.keyyee);
			if(window.choosegearconfig) choosegearconfig.highlight("realname", new Set(config.featurelist));
			if(window.chooseComputeMethod) chooseComputeMethod.highlight("name", config.computeMethod);
			
		};
		selectUI();


		//////////////////////////
		//////// RESET... ////////
		//////////////////////////

		// CREATE A RESET BUTTON
		var resetDOM = document.createElement("div");
		resetDOM.id = "reset";
		resetDOM.innerHTML = "reset";
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
		document.querySelector("#center").appendChild(resetDOM);


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
			var aloc = window.location.pathname.split('/')
			logtext += "\n\npaste this JSON into" + aloc[aloc.length-2] + "/" + aloc[aloc.length-1]
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

			
			if (config.sandboxsave) {
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
			// Create a "save" button
			var saveDOM = document.createElement("div");
			saveDOM.id = "save";
			saveDOM.innerHTML = "save:";
			
			saveDOM.onclick = function(){
				_saveModel();
			};
			document.querySelector("#center").appendChild(saveDOM);

			// The share link textbox
			linkText = document.createElement("input");
			linkText.id = "savelink";
			linkText.placeholder = "[when you save your model, a link you can copy will show up here]";
			linkText.setAttribute("readonly", true);
			linkText.onclick = function(){
				linkText.select();
			};
			document.querySelector("#center").appendChild(linkText);

			// Create a URL... (later, PARSE!)
			// save... ?d={s:[system], v:[voterPositions], c:[candidatePositions], d:[description]}

		}


	};

	Loader.load([
		
		// the peeps
		"img/voter_face.png",
		"img/square.png",
		"img/triangle.png",
		"img/hexagon.png",
		"img/pentagon.png",
		"img/bob.png",

		// Ballot instructions
		"img/ballot5_fptp.png",
		"img/ballot5_ranked.png",
		"img/ballot5_approval.png",
		"img/ballot5_range.png",

		// The boxes
		"img/ballot5_box.png",
		"img/ballot_rate.png",
		"img/ballot_three.png"

	]);

	//if(config.sandboxsave) resetDOM.onclick();
	
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

};
