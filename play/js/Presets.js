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
    } else if (htmlname == "election.html") {
        config = {}
    }
    return config
}
