// addEventListener support for IE8
function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener){
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}
// Send a message to the child iframe
var iframeEl = document.getElementById('fixedbox')
var sendMessage = function(msg) {
    // Make sure you are sending a string, and to stringify JSON
    iframeEl.contentWindow.postMessage(msg, '*');
};


// console.log("ScrollMagic v%s loaded", ScrollMagic.version);
// init
var ctrl = new ScrollMagic.Controller();
function maketrigger(divname,f,htmlname) {
    // create scene
    var scene = new ScrollMagic.Scene({
        triggerElement: divname
    })
    .on('start', function() {return f(htmlname)})
    .addTo(ctrl);
}
// maketrigger("#ballot4.html-toptrigger",sendMessage,'ballot4.html')
// maketrigger("#b4bottomtrigger",sendMessage,'ballot4.html')
// maketrigger("#b5toptrigger",sendMessage,'ballot5.html')
// maketrigger("#b5bottomtrigger",sendMessage,'ballot5.html')
//ballot4t

// get all class triggers
var triggers = document.getElementsByClassName("spacer")

var sendGlobalHtmlMessage = function(htmlname) {
    globalHtmlName = htmlname
    iframeEl.contentWindow.postMessage(globalHtmlName, '*');
}
for (var i in triggers) {
    // var divname = triggers[i].id
    // var htmlname = divname.split("")[0]
    var id1 = triggers[i].id
    if (id1) {
            
        var divname = id1
        //var htmlname = id1.substring(0, id1.length - 1) + ".html"
        
        var htmlname = id1.slice(0, -1) + ".html"
        maketrigger("#"+divname,sendGlobalHtmlMessage,htmlname)
    }
}


// Open console to see output!