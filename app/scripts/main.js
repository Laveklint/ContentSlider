$(function() {
	// init a kanShow
	$('#myshow').contentslider({

		// // build pagination list in the following dom (jQuery dom)
		paginationContainer: $('#pag-container'),

		// // on each swtich, run this callback function (function)
		onSwitchCallback: myFunc,

		// // when reached the end of items, start from beginning (bool)
		loop: false,

		// // how many items should be visible on side before making switch (int, default:2)
		loopNeedle:1,

		itemMargin:10,

		// // use 'slide' or 'fade' transition (string)
		transition: 'slide',

		// // time for the transitino
		transitionTime: 500,

		// // auto play (bool)
		auto:  false,

		// // overflow:visible?
		bleed: false,

		// touch enabled
		touch: false

	});

	// reference the plugin api
	var api = $('#myshow').data('contentslider');

	// click a next-button and trigger the 'next' method
	$('.btn-next').on('click', function() {
		api.next();
	});

	// click a prev-button and trigger the 'prev' method
	$('.btn-prev').on('click', function() {
		api.prev();
	});

	// click next sectoion to trigger next
	$(document).on('click', '.contentslider-next-item', function(){
		api.next();
	});

	// click previous sectoion to trigger previous
	$(document).on('click', '.contentslider-previous-item', function(){
		api.prev();
	});

	// callback function to each switch in the slideshow
	function myFunc(currentIndex, totalCount) {
		$('.active-li').removeClass('active-li');
		$.each($('#pag-container ul li'), function(key, item) {
			if(key == currentIndex) {
				$(item).addClass("active-li");
			}
		});

		$('#pag-count').html('<p>' + (1+currentIndex) + ' / ' + totalCount);
	}



});