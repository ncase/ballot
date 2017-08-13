var loadpreset = function(htmlname) {
    if (htmlname == "election1.html") {
        config = {
	
	system: "FPTP",

	candidates: 3,
	candidatePositions: [[50,125],[250,125],[280,280]],

	voters: 1,
	voterPositions: [[155,125]]

}
    } else if (htmlname == "election2.html") {
        config = {
	
	features:1,
	system: "IRV",

	candidates: 3,
	candidatePositions: [[41,271],[257,27],[159,65]],

	voters: 1,
	voterPositions: [[257,240]]

}
    } else if (htmlname == "election3.html") {
        config = {
	
	features:1,
	
	system: "Borda",

	candidates: 3,
	candidatePositions: [[173,150],[275,150],[23,150]],
	//candidates: 4,
	//candidatePositions: [[174,175],[271,266],[23,149],[23,23]],

	voters: 1,
	voterPositions: [[232,150]]
	// voterPositions: [[226,230]]

}
    } else if (htmlname == "election4.html") {
        config = {
	features:2,
	system: "Condorcet",
	candidates: 3,
	voters: 3
}
    } else if (htmlname == "election5.html") {
        config = 
{

	features:2,
	system: "Borda",

	candidates: 3,
	candidatePositions: [[40,115+10],[177,185+10],[224,118+10]],
	
	voters: 2,
	voterPositions: [[75,120+10],[225,120+10]]

}
    } else if (htmlname == "election6.html") {
        config = {

	system: "Score",
	strategy: "normalize",

	candidates: 3,
	candidatePositions: [[50,125],[250,125],[280,280]],

	voters: 1,
	voterPositions: [[155,125]]

}
    } else if (htmlname == "election7.html") {
		config = 
{
	featurelist: ["percentstrategy"],
	voterPercentStrategy: [100,0,0],
	
	system: "Score",

	candidates: 3,
	candidatePositions: [[150-30,150],[150+130,150],[150+50,150]],
	
	voters: 1,
	voterPositions: [[150,150]],
	voterStrategies: ["normalize"]
	
}
    } else if (htmlname == "election8.html") {
		config = 
{

	/*
	features:3,
	system: "Score",

	candidates: 3,
	candidatePositions: [[100,150],[150,150+100],[300-100,150]],
	
	voters: 2,
	voterPositions: [[100,150],[300-100,150]],
	voterStrategies: ["normalize","zero strategy. judge on an absolute scale."],
	frontrunnerSet: new Set(["square","hexagon"])
	*/
	
candidatePositions: [[50,150],[250,150]],
voterPositions: [[100,150],[200,150]],
system: "Score",
candidates: 2,
voters: 2,
voterStrategies: ["normalize","normalize","zero strategy. judge on an absolute scale."],
frontrunnerSet: new Set(["square","hexagon"]),
featurelist: ["percentstrategy"],
sandboxsave: false,
hidegearconfig: false,
description: "",
voterPercentStrategy: ["70","49",0],
snowman: false,
unstrategic: "zero strategy. judge on an absolute scale.",
keyyee: "off",
features: undefined,
doPercentFirst: undefined,
doFullStrategyConfig: undefined,
	
}
    } else if (htmlname == "election9.html") {
		config = 
{

	features:3,
	doPercentFirst:true,
	system: "Score",

	candidates: 3,
	
	voters: 2,
	voterPositions: [[200,160],[100,160]],
	voterStrategies: ["normalize","normalize"],
	voterPercentStrategy: [50,50],
	doFullStrategyConfig: true
	
}
    } else if (htmlname == "election10.html") {
		config = 
{
/*
	features:3,
	doPercentFirst:true,
	system: "Approval",

	candidates: 3,
	candidatePositions: [[150-25,150-20],
						 [150+20,150-20],
						 [150,150+75]],
	
	voters: 3,
	voterPositions: [[150,150-70],
						 [150,150+10],
						 [150,150+90]],
	voterStrategies: ["normalize frontrunners only","normalize frontrunners only","normalize frontrunners only"],
	voterPercentStrategy: [100,100,100],
	frontrunnerSet: new Set(['square','triangle','hexagon']),
	doFullStrategyConfig: true
	*/
	
candidatePositions: [[121,149],[118,170],[194,159]],
voterPositions: [[116,121],[116,184],[195,155]],
system: "Approval",
candidates: 3,
voters: 3,
voterStrategies: ["best frontrunner","best frontrunner","best frontrunner"],
voterPercentStrategy: ["100","100",100],
frontrunnerSet: new Set(["square","triangle","hexagon"]),
featurelist: ["percentstrategy"],
sandboxsave: false,
hidegearconfig: false,
description: "",
snowman: true,
unstrategic: "normalize",
keyyee: "off",
kindayee: "off",
features: undefined,
doPercentFirst: undefined,
doFullStrategyConfig: undefined
}
    } else if (htmlname == "election11.html") {
		config = 
{
/*
	features:1,
	doPercentFirst:true,
	system: "Approval",

	candidates: 3,
	candidatePositions: [[150-25,150-20],
						 [150+20,150-20],
						 [150,150+75]],
	
	voters: 3,
	voterPositions: [[150,150-70],
						 [150,150+10],
						 [150,150+90]],
	voterStrategies: ["best frontrunner","best frontrunner","best frontrunner"],
	voterPercentStrategy: [0,100,100],
	frontrunnerSet: new Set(['square','triangle','hexagon']),
	doFullStrategyConfig: true,
	unstrategic: "normalize"
	*/
	
candidatePositions: [[121,149],[118,170],[194,159]],
voterPositions: [[116,121],[116,184],[195,155]],
system: "Approval",
candidates: 3,
voters: 3,
voterStrategies: ["best frontrunner","best frontrunner","best frontrunner"],
voterPercentStrategy: ["100","100",100],
frontrunnerSet: new Set(["square","triangle","hexagon"]),
featurelist: ["percentstrategy","systems"],
sandboxsave: false,
hidegearconfig: false,
description: "",
snowman: true,
unstrategic: "normalize",
keyyee: "off",
kindayee: "off",
features: undefined,
doPercentFirst: undefined,
doFullStrategyConfig: undefined
}
    } else if (htmlname == "election12.html") {
		config = 
{
/*
	features:3,
	doPercentFirst:true,
	system: "IRV",

	candidates: 4,
	candidatePositions: [[150-25,150-20],
						 [150+20,150-20],
						 [150,150+75],
						 [150+0,150+10]],
	
	voters: 3,
	voterPositions: [[150,150-70],
						 [150,150+10],
						 [150,150+90]],
	voterStrategies: ["normalize frontrunners only","normalize frontrunners only","normalize frontrunners only"],
	voterPercentStrategy: [100,100,100],
	frontrunnerSet: new Set(['square','triangle','hexagon'])
	*/
	
candidatePositions: [[145,155],[184,153],[106,157]],
voterPositions: [[150,150]],
system: "IRV",
candidates: 3,
voters: 1,
voterStrategies: ["zero strategy. judge on an absolute scale.","normalize frontrunners only","normalize frontrunners only"],
voterPercentStrategy: ["100",100,100],
frontrunnerSet: new Set(["square","triangle","hexagon"]),
featurelist: ["systems"],
sandboxsave: false,
hidegearconfig: false,
description: "",
snowman: false,
unstrategic: "zero strategy. judge on an absolute scale.",
keyyee: "off",
features: undefined,
doPercentFirst: undefined,
doFullStrategyConfig: undefined,
}
    } else if (htmlname == "election13.html") {
		config = 
{
/*
	features:3,
	doPercentFirst:true,
	system: "STAR",

	candidates: 3,
	candidatePositions: [[150-25,150-20],
						 [150+20,150-20],
						 [150,150+75]],
	
	voters: 3,
	voterPositions: [[150,150-70],
						 [150,150+10],
						 [150,150+90]],
	voterStrategies: ["starnormfrontrunners","starnormfrontrunners","starnormfrontrunners"],
	voterPercentStrategy: [100,100,100],
	frontrunnerSet: new Set(['square','triangle','hexagon'])
	*/
	
candidatePositions: [[121,149],[118,170],[194,159]],
voterPositions: [[116,121],[116,184],[195,155]],
system: "STAR",
candidates: 3,
voters: 3,
voterStrategies: ["best frontrunner","best frontrunner","best frontrunner"],
voterPercentStrategy: ["100","100",100],
frontrunnerSet: new Set(["square","triangle","hexagon"]),
featurelist: ["percentstrategy"],
sandboxsave: false,
hidegearconfig: false,
description: "",
snowman: true,
unstrategic: "normalize",
keyyee: "off",
kindayee: "off",
features: undefined,
doPercentFirst: undefined,
doFullStrategyConfig: undefined
}
    } else if (htmlname == "election14.html") {
		config = 
{
/*
	features:3,
	doPercentFirst:true,
	system: "3-2-1",

	candidates: 3,
	candidatePositions: [[150-25,150-20],
						 [150+20,150-20],
						 [150,150+75]],
	
	voters: 3,
	voterPositions: [[150,150-70],
						 [150,150+10],
						 [150,150+90]],
	voterStrategies: ["starnormfrontrunners","starnormfrontrunners","starnormfrontrunners"],
	voterPercentStrategy: [100,100,100],
	frontrunnerSet: new Set(['square','triangle','hexagon'])
	*/
	
candidatePositions: [[121,149],[118,170],[194,159]],
voterPositions: [[116,121],[116,184],[195,155]],
system: "3-2-1",
candidates: 3,
voters: 3,
voterStrategies: ["best frontrunner","best frontrunner","best frontrunner"],
voterPercentStrategy: ["100","100",100],
frontrunnerSet: new Set(["square","triangle","hexagon"]),
featurelist: ["percentstrategy"],
sandboxsave: false,
hidegearconfig: false,
description: "",
snowman: true,
unstrategic: "normalize",
keyyee: "off",
kindayee: "off",
features: undefined,
doPercentFirst: undefined,
doFullStrategyConfig: undefined
}
    } else if (htmlname == "election15.html") {
		config = 
{
	candidatePositions: [[92,69],[210,70],[245,182],[149,250],[55,180]],
voterPositions: [[150,150]],
description: "",
features: undefined,
system: "FPTP",
candidates: 5,
voters: 1,
doFullStrategyConfig: undefined,
doPercentFirst: undefined,
featurelist: ["systems","voters","candidates","percentstrategy","strategy","percentstrategy","unstrategic","frontrunners","poll","yee"],
sandboxsave: true,
hidegearconfig: false,
frontrunnerSet: new Set(["square"]),
voterStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
voterPercentStrategy: [0,0,0],
snowman: false,
unstrategic: "zero strategy. judge on an absolute scale.",
keyyee: "pentagon",
kindayee: "can",
}
    } else if (htmlname == "sandbox.html") {
		config = 
{
	description: "[type a description for your model here. for example...]\n\nLook, it's the whole shape gang! Steven Square, Tracy Triangle, Henry Hexagon, Percival Pentagon, and last but not least, Bob.",
	features: 4,
	system: "FPTP",
	candidates: 5,
	voters: 1,
	doFullStrategyConfig: true,
	doPercentFirst: true
}
    } else if (htmlname == "fixedbox.html") {
		config = 
{
	description: "",
	features: 4,
	system: "FPTP",
	candidates: 5,
	voters: 1,
}
    } else if (htmlname == "ballot1.html") {
		config = 
{system: "Plurality"}

    } else if (htmlname == "ballot2.html") {
		config = 
{system: "Ranked"}

    } else if (htmlname == "ballot3.html") {
		config = 
{system: "Approval"}

    } else if (htmlname == "ballot4.html") {
		config = 
{system: "Score"}

    } else if (htmlname == "ballot5.html") {
		config = 
{
	system: "Score",
	strategy: "normalize"
}
    } else if (htmlname == "ballot6.html") {
		config = 
{
	system: "Score",
	strategy: "best frontrunner",
	frontrunnerSet: new Set(["square","triangle"]),
	showChoiceOfFrontrunners: true,
	showChoiceOfStrategy: true
}
    } else if (htmlname == "ballot7.html") {
		config = 
{
	system: "Score",
	strategy: "not the worst frontrunner",
	showChoiceOfFrontrunners: true
}
    } else if (htmlname == "ballot8.html") {
		config = 
{
	system: "Score",
	strategy: "normalize frontrunners only",
	frontrunnerSet: new Set(["square","triangle"]),
	showChoiceOfFrontrunners: true,
	showChoiceOfStrategy: true
}
    } else if (htmlname == "ballot9.html") {
		config = 
{
	system: "Score",
	strategy: "starnormfrontrunners", // for now we are using an "off-menu" option.  We should make versions of each of hte strategies for star.
	frontrunnerSet: new Set(["square","triangle"]),
	showChoiceOfFrontrunners: true
}
    } else if (htmlname == "ballot10.html") {
		config = 
{
	system: "Three",
	strategy: "starnormfrontrunners",
	frontrunnerSet: new Set(["square","triangle"]),
	showChoiceOfFrontrunners: true
}
    } else if (htmlname == "ballot11.html") {
		config = 
{
	system: "Score",
	strategy: "best frontrunner",
	frontrunnerSet: new Set(["square","triangle"]),
	showChoiceOfFrontrunners: true,
	showChoiceOfStrategy: true
}
    } else if (htmlname == "ballot12.html") {
		config = 
{
	system: "Score",
	strategy: "not the worst frontrunner",
	frontrunnerSet: new Set(["square","triangle"]),
	showChoiceOfFrontrunners: true,
	showChoiceOfStrategy: true
}
    // } else if (htmlname == "election.html") {
	// 	config = 


    }
    return config
}


var url = window.location.pathname;
var filename = url.substring(url.lastIndexOf('/')+1);
main(loadpreset(filename));
