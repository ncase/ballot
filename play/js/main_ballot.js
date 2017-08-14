window.ONLY_ONCE = false;
function main(config){

	ballotType = config.system;
	config.strategy = config.strategy || "zero strategy. judge on an absolute scale.";
	config.frontrunnerSet = config.frontrunnerSet || new Set(["square"]);
	config.showChoiceOfStrategy = config.showChoiceOfStrategy || false
	config.showChoiceOfFrontrunners = config.showChoiceOfFrontrunners || false
	
	// make a copy of the config
	config.afrontrunnerArray = Array.from(config.frontrunnerSet)// stringify a set is not good
	var initialConfig = JSON.parse(JSON.stringify(config));
	
	// ONCE.
	if(ONLY_ONCE) return;
	ONLY_ONCE=true;

	var VoterType = window[ballotType+"Voter"];
	var BallotType = window[ballotType+"Ballot"];

	Loader.onload = function(){

		// SELF CONTAINED MODEL
		window.model = new Model({ size:250, border:2 });
		document.body.appendChild(model.dom);
		model.onInit = function(){
			model.addVoters({
				dist: SingleVoter,
				type: VoterType,
				strategy: config.strategy,
				frontrunners: config.frontrunners,
				x:81, y:92
			});
			model.addCandidate("square", 41, 50);
			model.addCandidate("triangle", 173, 95);
			model.addCandidate("hexagon", 216, 216);
			model.frontrunnerSet = config.frontrunnerSet;
			model.strategy = config.strategy;
		};

		// CREATE A BALLOT
		window.ballot = new BallotType();
		document.body.appendChild(ballot.dom);
		model.onUpdate = function(){
			ballot.update(model.voters[0].ballot);
		};


		
		// Init!
		model.init();
		
		if(config.showChoiceOfStrategy) {
			
			var strategyOn = [
				{name:"O", realname:"zero strategy. judge on an absolute scale.", margin:4},
				{name:"N", realname:"normalize", margin:4},
				{name:"F", realname:"normalize frontrunners only", margin:4},
				{name:"B", realname:"best frontrunner", margin:4},
				{name:"W", realname:"not the worst frontrunner"}
			];
			// old ones
			// {name:"FL", realname:"justfirstandlast", margin:4},
			// {name:"T", realname:"threshold"},
			// {name:"SNTF", realname:"starnormfrontrunners"}
			var onChooseVoterStrategyOn = function(data){
				config.strategy = data.realname; 
				model.strategy = config.strategy; 
				model.update();
				
			};
			window.chooseVoterStrategyOn = new ButtonGroup({
				label: "which strategy?",
				width: 42,
				data: strategyOn,
				onChoose: onChooseVoterStrategyOn
			});
			document.body.appendChild(chooseVoterStrategyOn.dom);
		}
			
		if(config.showChoiceOfFrontrunners) {
			
			var h1 = function(x) {return "<span class='buttonshape'>"+_icon(x)+"</span>";};
			var frun = [
				{name:h1("square"),realname:"square",margin:4},
				{name:h1("triangle"),realname:"triangle",margin:4},
				{name:h1("hexagon"),realname:"hexagon",margin:4},
				//{name:h1("pentagon"),realname:"pentagon",margin:4},
				//{name:h1("bob"),realname:"bob"}
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
				width: 42,
				data: frun,
				onChoose: onChooseFrun,
				isCheckbox: true
			});
			document.body.appendChild(chooseFrun.dom);
		}
		
		var selectUI = function(){
			if(window.chooseVoterStrategyOn) chooseVoterStrategyOn.highlight("realname", model.strategy);
			if(window.chooseFrun) chooseFrun.highlight("realname", model.frontrunnerSet);
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
			//setInPosition();
			model.update()
			// Back to ol' UI
			selectUI();
			console.log(initialConfig)
		};
		document.querySelector("#center").appendChild(resetDOM);
		
	};

	Loader.load([
		
		// the peeps
		"img/voter_face.png",
		"img/square.png",
		"img/triangle.png",
		"img/hexagon.png",
		
		// Ballot instructions
		"img/ballot_fptp.png",
		"img/ballot_ranked.png",
		"img/ballot_approval.png",
		"img/ballot_range.png",

		// The boxes
		"img/ballot_box.png",
		"img/ballot_rate.png"

	]);

}