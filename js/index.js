var _onscroll = function(){
	var scrollY = window.pageYOffset;
	var innerHeight = window.innerHeight;
	document.getElementById("splash_iframe").contentWindow.postMessage({
		isOnScreen: (scrollY<400)
	},"*");
};
window.addEventListener("scroll",_onscroll,false);
setTimeout(_onscroll,1000);
setTimeout(_onscroll,5000);
setTimeout(_onscroll,10000);
