// addEventListener support for IE8
function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener){
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}
// Send a message to the child iframe
var iframeEl = document.getElementById('arena')
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
maketrigger("#b4toptrigger",sendMessage,'ballot4.html')
maketrigger("#b4bottomtrigger",sendMessage,'ballot4.html')
maketrigger("#b5toptrigger",sendMessage,'ballot5.html')
maketrigger("#b5bottomtrigger",sendMessage,'ballot5.html')
// Open console to see output!