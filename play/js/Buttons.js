/*********************

Create a group of buttons,
only one of which can be activated at a time.

*********************/

function ButtonGroup(config){

	var self = this;
	self.config = config;

	self.buttonConfigs = config.data;
	self.onChoose = config.onChoose;
	self.isCheckbox = config.isCheckbox || false;
	self.justButton = config.justButton || false;

	// DOM!
	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "button-group");

	// Label!
	self.label = document.createElement("div");
	self.label.setAttribute("class", "button-group-label");
	self.label.innerHTML = config.label;
	self.dom.appendChild(self.label);

	// Toggle buttons
	self.buttons = [];
	self.onToggle = function(button, buttonData){
		if (self.isCheckbox) {
			if (button.isOn) {
				button.turnOff();
			} else {
				button.turnOn();
			}
		} else if (! self.justButton) { // justButton means it doesn't get selected
			// Turn all off
			for(var i=0;i<self.buttons.length;i++) self.buttons[i].turnOff();
			button.turnOn(); // except one
		}
		// And send the data up
		self.onChoose(buttonData);

	};

	// Highlight based on data...
	self.highlight = function(propName, propValue){
		
		// Turn all off
		for(var i=0;i<self.buttons.length;i++) self.buttons[i].turnOff();
		
		if (self.isCheckbox) {
			for (ibu in self.buttons) {
				var bu = self.buttons[ibu]
				if (propValue.includes(bu.config[propName])) { // the propValue is an array of values
					bu.turnOn();
				}
			}
		} else {
			// Find the one...
			var theButton =self.buttons.filter(function(button){
				var config = button.config;
				return (config[propName]==propValue);
			})[0];
			theButton.turnOn();
		}
	};

	// Create & place buttons!
	for(var i=0; i<self.buttonConfigs.length; i++){
		var conf = self.buttonConfigs[i];
		var button = new Button(conf, self.onToggle);
		button.dom.style.width = config.width+"px"; // whatever
		self.buttons.push(button);
		self.dom.appendChild(button.dom);
	}

	// And then select the one that says "selected"! Fake a click.
	for(var i=0;i<self.buttons.length;i++){
		var button = self.buttons[i];
		if(button.config.selected){
			button.turnOn();
			break;
		}
	}

}

function Button(buttonConfig, onChoose){

	var self = this;

	self.config = buttonConfig;

	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "button");
	self.dom.style.marginRight = buttonConfig.margin+"px";

	// Click!
	self.dom.innerHTML = buttonConfig.name;
	self.dom.setAttribute("title", buttonConfig.realname || "");
	self.onClick = function(){
		onChoose(self, buttonConfig);
	};
	self.dom.onclick = self.onClick;
	// Turn on or off!
	self.turnOff = function(){
		self.isOn = false;
		self.config.isOn = false;
		self.dom.setAttribute("on", "no");
	};
	self.turnOn = function(){
		self.isOn = true;
		self.config.isOn = true;
		self.dom.setAttribute("on", "yes");
	};
	self.turnOff();

}