ContentSlider
=========

One of those contentsliders...
Quite flexible and responsive.

``` javascript
$.contentslider.defaults = {
	transition: "slide", // if using slide with 'loop' no pagination will constructed
	transitionTime: 500, // time for transition
	itemMargin: 0, // margin between sections
	loop: false, // infinite slide loop
	loopNeedle:0, // how many pictures to wrap to the left of the index img, may be used with: bleed:true
	auto: true, // auto slideshow
	delay: 5000, // the delay before switch - only used with auto:true
	startIndex: null, // want to start at an alternate section/img-index
	onSwitchCallback: null, // callback function on switch
	paginationContainer: null, // if passed a $-dom, a pagination will be constructed within that dom
	bleed: false // setting this to true will drop the overflow hidden of the wrapper, may be used with loopNeedle
};
```
