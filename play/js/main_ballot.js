window.ONLY_ONCE = false;
function main(config){

	ballotType = config.system;
	config.strategy = config.strategy || "nope";
	config.frontrunnerSet = config.frontrunnerSet || new Set(["square"]);
	config.showChoiceOfStrategy = config.showChoiceOfStrategy || false
	config.showChoiceOfFrontrunners = config.showChoiceOfFrontrunners || false
	
	// ONCE.
	if(ONLY_ONCE) return;
	ONLY_ONCE=true;

	var VoterType = window[ballotType+"Voter"];
	var BallotType = window[ballotType+"Ballot"];

	Loader.onload = function(){

		// SELF CONTAINED MODEL
		window.model = new Model({ size:250, border:2 });
		document.body.appendChild(model.dom);
		model.frontrunnerSet = config.frontrunnerSet;
		model.strategy = config.strategy;
		model.onInit = function(){
			model.addVoters({
				dist: SingleVoter,
				type: VoterType,
				strategy: config.strategy,
				frontrunners: config.frontrunners,
				x:81, y:92
			});
			model.addCandidate("square", 41, 50);
			model.addCandidate("triangle", 153, 95);
			model.addCandidate("hexagon", 216, 216);
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
				{name:"NO", realname:"nope", margin:4},
				{name:"FL", realname:"justfirstandlast", margin:4},
				{name:"NR", realname:"normalized", margin:4},
				{name:"T", realname:"threshold", margin:4},
				{name:"TF", realname:"thresholdfrontrunners", margin:4},
				{name:"NTF", realname:"normfrontrunners", margin:4},
				{name:"MTF", realname:"morethresholdfrontrunners", margin:4},
				{name:"SNTF", realname:"starnormfrontrunners"}
			];
			var onChooseVoterStrategyOn = function(data){
				config.strategy = data.realname; 
				model.strategy = config.strategy; 
				model.update();
				
			};
			window.chooseVoterStrategyOn = new ButtonGroup({
				label: "which strategy?",
				width: 52,
				data: strategyOn,
				onChoose: onChooseVoterStrategyOn
			});
			document.body.appendChild(chooseVoterStrategyOn.dom);
		}
			
		if(config.showChoiceOfFrontrunners) {
			
			var frun = [
				{name:"square",margin:4},
				{name:"triangle",margin:4},
				{name:"hexagon",margin:4},
				{name:"pentagon",margin:4},
				{name:"bob"}
			];
			var onChooseFrun = function(data){
				
				// update config...
				// no reset...
				if (data.isOn) {
					config.frontrunnerSet.add(data.name)
				} else {
					config.frontrunnerSet.delete(data.name)
				} 
				model.frontrunnerSet = config.frontrunnerSet
				model.update();
				
			};
			window.chooseFrun = new ButtonGroup({
				label: "which candidates are the frontrunners?",
				width: 52,
				data: frun,
				onChoose: onChooseFrun,
				isCheckbox: true
			});
			document.body.appendChild(chooseFrun.dom);
		}
		
		var selectUI = function(){
			if(window.chooseVoterStrategyOn) chooseVoterStrategyOn.highlight("realname", model.strategy);
			if(window.chooseFrun) chooseFrun.highlight("name", model.frontrunnerSet);
		};
		selectUI();
		
		
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