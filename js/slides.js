$('#nav nav a').on('click', function(event) {
	$(this).parent().find('a').removeClass('active');
	$(this).addClass('active');
});
var old_div = null;
var globalHtmlName = "ballot4.html"
var exampleLoaded = null


$(window).on('scroll', function() {
	var window_height = $(window).height();
	$('.target').each(function() {
		// this function runs on each text box and checks to see if the middle of the page is inside the box.
		var scrollMiddle = $(window).scrollTop() + (window_height/2);
		elTop = $(this).offset().top;
		elBtm = elTop + $(this).height();
		var inView = elTop < scrollMiddle && elBtm > scrollMiddle;
		// var inView = $(window).scrollTop() >= $(this).offset().top
		if(inView) {
			var id = $(this).attr('id');
			$('#nav nav a').removeClass('active');
			$('#nav nav a[href=#'+ id +']').addClass('active');
			$(this).css('background-color',"#ddddee");
			if (id!=old_div) {
				globalHtmlName = $(this).attr('id') + ".html"
				// $('#example div').html(exampleLoaded)
				msg = ''
				var iframeEl = document.getElementById('fixedbox')
				iframeEl.contentWindow.postMessage(msg, '*');
			}
			old_div = id
		} else {
			$(this).css('background-color',"#fff");
		}
	});
	// also, lets make the nav sticky
	var topoffirst = $('.target:first').offset().top;
	var bottomoflast = $('.target:last').offset().top + $('.target:last').height();
	var prejump = 0; // makes it smooth
	var prejump = 100; 
	var scrollTop = $(window).scrollTop()
	var scrollBottom = scrollTop + window_height
	var abovetopoffirst = ( scrollTop < topoffirst );
	var nav1 = $('#nav')
	var nav2 = $('#nav nav')
	var fb1 = $('#fixedbox')
	
//	var sidebarheight = fb1.css("height")
	// var sidebarheight = 1300
	var sidebarheight = window_height
	
	var belowbottomoflast = ( scrollTop + sidebarheight + 2*prejump > bottomoflast );
	
	var lel = [nav1]
	for (i in lel) {
		var n1 = lel[i]
		if (abovetopoffirst) {
			console.log("topper")
			n1.css("position","absolute")
			n1.css("top", topoffirst)
		} else if (belowbottomoflast) {
			console.log("bottomer")
			n1.css("position","absolute")
			n1.css("top",bottomoflast-sidebarheight+"px")
		} else { // sticky
			console.log("sticky")
			n1.css("position","fixed")
			n1.css("top",prejump+"px")
		}
	}
});