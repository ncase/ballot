$('#nav nav a').on('click', function(event) {
	$(this).parent().find('a').removeClass('active');
	$(this).addClass('active');
});
var old_div = null;
var window_height = $(window).height();
var exampleLoaded = null
$(window).on('scroll', function() {
	
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
			$(this).css('background-color',"#00ff00");
			if (id!=old_div) {
				exampleLoaded = $(this).attr('exampleLoad')
				window.alert(exampleLoaded)
			}
			old_div = id
		} else {
			$(this).css('background-color',"#aaa");
		}
	});
});