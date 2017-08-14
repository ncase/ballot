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
});