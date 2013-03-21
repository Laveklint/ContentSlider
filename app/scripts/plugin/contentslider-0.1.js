;(function ($) {

	$.contentslider = function(el, opts) {

		var items = null,
			element = $(el),
			config = {},
			options = $.extend({}, $.contentslider.defaults, opts),
			namespace = options.namespace,
			touch = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch,
			eventType = (touch) ? "touchend" : "click",
			vertical = options.transition === 'slidey',
			single = false,
			fade = options.transition === 'fade',
			api = {},
			container = null;

		api = {

			init: function() {
				var bleed = options.bleed ? ' contentslider-bleed' : '';
				element.wrap('<div class="contentslider-wrapper' + bleed+ '"><div class="contentslider-inner">');
				items = $('> *', element);
				items.addClass('contentslider-item');
				container = $('.contentslider-inner');

				config.prop = options.transition == 'slidey' ? 'top' : 'left'
				config.transitions = api.getTransitionState();
				config.count = items.length;
				config.args = {};
				config.isAnimating = false;
				config.itemWidth = items[0].offsetWidth;
				config.itemHeight = items[0].offsetHeight;
				config.itemsPerPage = Math.floor(element.innerWidth()/config.itemWidth) > 0 ? Math.floor(element.innerWidth()/config.itemWidth) : 1;
				config.distance = config.itemWidth * config.itemsPerPage;
				config.pages = Math.round(Math.ceil(config.count/config.itemsPerPage));
				config.currentPage = options.loop && options.startIndex != null ? 1 : 0;
				config.prevPage = config.count-1;
				config.nextPage = config.currentPage+1;
				config.positions = [];
				config.autoTimer = null;

				config.wrapper = document.querySelectorAll('.contentslider-wrapper')[0];
				config.wrapper.style.width = config.itemWidth + 'px';
				config.wrapper.style.height = config.itemHeight + 'px';

				if( options.paginationContainer && config.count > 1 ) {
					api.constructPagination();
				}

				if( options.auto === true) api.setupAutoBehaviour();

				if( touch && options.touch && config.count > 1 ) api.touch();

				api.setup();

				api.handleItemClasses();
        		if(options.onSwitchCallback)  options.onSwitchCallback(config.currentPage, config.count);

			},

			setup: function() {
				if( fade || options.loopNeedle === 0 || config.count === 1 ) {
					 api.positionStatic();
				} else {
					api.positionSlide();
				}
			},

			positionStatic: function() {
		        var i, li, z, props;

		        if(!vertical) {
		            props = {left: '0px', display: 'none', zIndex: z};
		            z = '';
		        } else {
		            props = {top: '0px', display: 'none', zIndex: z};
		            z = '-2';
		        }

		        for(i = 0; i <config.count; i++) {
		            li = $(items[i]);
		            
		            li.css(props);

		            if(i === config.currentPage) {
		                li.fadeIn();
		            }
		        }
		    },

		    positionSlide: function() {
		        var i, li, p, k, offset, props;

		        offset = options.transition === 'slide' ? config.itemWidth : config.itemHeight;
		        for(p = 0; p < config.count; p++) {
		            config.positions.push((p-options.loopNeedle)*(offset+options.itemMargin));
		        }

		        for(i = 0; i <config.count; i++) {
		            li = $(items[i]);

		            props = options.transition === 'slide' ? {left:  config.positions[i] +'px'} : {top:  config.positions[i] +'px'}
		            li.css(props);

		            if(i === 0) {
		                li.fadeIn();
		            } else {
		                li.show();
		            }
		        }

		        k = options.loopNeedle;
		        while(k--) {
		            api.slideReset(0);
		        }
		    },

		    slideReset: function(delta) {
		        var that = this,
		            mostRight = (config.positions[config.count-1]+(config.itemWidth+options.itemMargin));
		            breakPos = delta === 1 ? '-='+Math.round(config.itemWidth+options.itemMargin)+'px' : '+='+Math.round(config.itemWidth+options.itemMargin)+'px',
		            breakPoint = delta === 1 ? (config.positions[0]-(config.itemWidth+options.itemMargin))+'px' : mostRight+'px',
		            newPos = delta === 1 ? mostRight-(config.itemWidth+options.itemMargin)+'px' : ''+(config.positions[0])+'px',
		            cssVal = options.transition === 'slide' ? 'left' : 'top',
		            innerResetPos = options.transition === 'slide' ? {left: '0px'} : {top: '0px'},
		            props = options.transition === 'slide' ? {left:  breakPos} : {top:  breakPos},
		            newPosition = options.transition === 'slide' ? {left:newPos} : {top:newPos};

		        $.each(items, function(key, item) {
		            var $item = $(item);

		            $item.css(props);

		            if(options.loop === true && $item.css(cssVal) == breakPoint ) {
		                $item.css(newPosition);
		            }
		        });

		        var target = "translate3d(0,0,0)";
		        config.args[config.prop] = target;
		        container.css(config.args);

		        container.css("-" + config.pref + "-transition-duration", "0s");
		        // container.css({"-" + config.pref + : -(config.itemWidth+options.itemMargin)+'px'});
		        container.animate(config.args, 0);
		        // container.css(innerResetPos);
		    },

			getTransitionState: function() {
				return touch && !fade && (function() {
					var obj = document.createElement('div'),
					props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
					
					for (var i in props) {
						if ( obj.style[ props[i] ] !== undefined ) {
						  config.pref = props[i].replace('Perspective','').toLowerCase();
						  config.prop = "-" + config.pref + "-transform";
							return true;
						}
					}
					return false;
				}());
			},

			setupAutoBehaviour: function() {
				if( config.count == 1 ) return;

				element.on('mousemove', function() {
	                api.pause();
	            });
	            element.on('mouseleave', function() {
	                api.play();
	            })

	            api.play();
			},

			handleItemClasses: function() {
		        $('.contentslider-previous-item').removeClass('contentslider-previous-item');
		        $('.contentslider-next-item').removeClass('contentslider-next-item');
		        $('.contentslider-active-item').removeClass('contentslider-active-item');

		        $(items[config.currentPage]).addClass('contentslider-active-item');

		        if( config.count == 1 ) return;
		        
		        if(config.currentPage === 0) {
		            $(items[config.count-1]).addClass('contentslider-previous-item');
		        } else {
		            $(items[config.currentPage-1]).addClass('contentslider-previous-item');
		        }

		        if(config.currentPage === config.count-1) {
		            $(items[0]).addClass('contentslider-next-item');
		        } else {
		            $(items[config.currentPage+1]).addClass('contentslider-next-item');
		        }
		    },

			constructPagination: function() {
				var uul = document.createElement('ul'),
					frag = document.createDocumentFragment();

				for(var i=0; i<config.count; i++) {
					var li = document.createElement('li');
					frag.appendChild(li);
				}

				uul.appendChild(frag);
				options.paginationContainer[0].appendChild(uul);

				$(uul).find('li').on('click', function() {
					var k = $(this).index();
					api.goTo(k);
				});
			},

			navigate: function(delta) {
		        var prevPage, nextPage, currPage;

		        if(config.currentPage >= config.pages) {
		            config.currentPage = 0;
		        }

		        if(config.currentPage < 0) {
		            config.currentPage = config.pages-1;
		        }

		        config.prevPage = config.currentPage === 0 ? config.count-1 : config.currentPage-1;
		        config.nextPage = config.currentPage === config.count-1 ? 0 : config.currentPage+1;

		        prevPage = $(items[config.previousPage]);
		        currPage = $(items[config.currentPage]);
		        nextPage = $(items[config.nextPage]);

		        switch ( options.transition ) {

		            case 'slidey' :

		                if(delta === 0) {

		                    if(options.loopNeedle === 0) {
		                        $(items[config.currentPage]).show().css({top:-config.itemHeight+'px', zIndex:'1'});
		                        
		                        container.stop().animate({top: (config.itemHeight)+'px'}, options.transitionTime, 'expo', function() {
		                            $(items[config.nextPage]).hide();
		                            $(items[config.currentPage]).css({top:'0px'});
		                            prevPage.css({zIndex:'-1'}).hide();
		                            container.css({top:'0px'});
		                        });
		                    } else {
		                        api.slideReset(0);
		                        container.css({top: '-'+(config.itemHeight+options.itemMargin)+'px'});
		                        container.animate({top: '0px' }, options.transitionTime, 'expo');
		                    }
		                } else {
		                    if(options.loopNeedle === 0) {
		                        $(items[config.currentPage]).show().css({top:config.itemHeight+'px', zIndex:'1'});
		                        
		                        container.stop().animate({top: (-config.itemHeight)+'px'}, options.transitionTime, 'expo', function() {
		                            $(items[config.prevPage]).hide();
		                            $(items[config.currentPage]).css({top:'0px'});
		                            prevPage.css({zIndex:'-1'}).hide();
		                            container.css({top:'0px'});
		                        });
		                    } else {
		                        api.slideReset(1);
		                        container.css({top: (config.itemHeight+options.itemMargin)+'px'});
		                        container.animate({top: '0px' }, options.transitionTime, 'expo');
		                    }
		                }
		            break;

		            case 'fade' :
		                
		                prevPage.fadeTo('fast',0, function() {
		                    prevPage.css({zIndex: '-1'});
		                });
		                currPage.stop().fadeTo('normal',1);

		            break;

		            default :

		                if(delta === 0) {
		                    if(options.loopNeedle === 0) {
		                        $(items[config.currentPage]).show().css({left:-config.itemWidth+'px', zIndex:'1'});
		                        
		                        container.stop().animate({left: (config.itemWidth)+'px'}, options.transitionTime, 'expo', function() {
		                            $(items[config.nextPage]).hide();
		                            $(items[config.currentPage]).css({left:'0px'});
		                            prevPage.css({zIndex:'-1'}).hide();
		                            container.css({left:'0px'});
		                        });
		                    } else {
		                        api.slideReset(0);
		                        container.css({left: '-'+(config.itemWidth+options.itemMargin)+'px'});
		                        container.animate({left: '0px' }, options.transitionTime, 'expo');
		                    }

		                } else {
		                    if(options.loopNeedle === 0) {
		                        $(items[config.currentPage]).show().css({left:config.itemWidth+'px', zIndex:'1'});
		                        
		                        container.stop().animate({left: (-config.itemWidth)+'px'}, options.transitionTime, 'expo', function() {
		                            $(items[config.prevPage]).hide();
		                            $(items[config.currentPage]).css({left:'0px'});
		                            prevPage.css({zIndex:'-1'}).hide();
		                            container.css({left:'0px'});
		                        });
		                    } else {
		                        api.slideReset(1);
		                        container.css({left: (config.itemWidth+options.itemMargin)+'px'});
		                        container.animate({left: '0px' }, options.transitionTime, 'expo');
		                    }
		                }

		            break;
		        }
		        
		        api.handleItemClasses();

		        if(options.onSwitchCallback)  options.onSwitchCallback(config.currentPage, config.count);
		    },

		    navigateTouch: function(target, delta, dx, time) {
		        var prevPage, nextPage, currPage;

		        if(config.currentPage >= config.pages) {
		            config.currentPage = 0;
		        }

		        if(config.currentPage < 0) {
		            config.currentPage = config.pages-1;
		        }

		        config.isAnimating = true;

		        config.prevPage = config.currentPage === 0 ? config.count-1 : config.currentPage-1;
		        config.nextPage = config.currentPage === config.count-1 ? 0 : config.currentPage+1;

		        prevPage = $(items[config.previousPage]);
		        currPage = $(items[config.currentPage]);
		        nextPage = $(items[config.nextPage]);

		        container.unbind("webkitTransitionEnd transitionend");
		        container.bind("webkitTransitionEnd transitionend", function() {
		            if(delta === 0 ) {
		                api.slideReset(0);
		            } else {
		                api.slideReset(1);
		            }
		            api.onTransitionEndHandler();
		        });

		        var rat = Math.abs(dx) / config.itemWidth;
		        var t = (time/300) > 0.5 ? 0.5 + "s" : (time/300) + "s";
		        container.css("-" + config.pref + "-transition-duration", t);

		        this.handleItemClasses();

		        if(options.onSwitchCallback)  options.onSwitchCallback(config.currentPage, config.count);
		        
		    },

		    onTransitionEndHandler: function() {
		        config.isAnimating = false;
		    },

		    navigateRestore: function(target) {
		        var that = this;
		        container.unbind("webkitTransitionEnd transitionend");
		        container.bind("webkitTransitionEnd transitionend", function() {
		            api.onTransitionEndHandler(that);
		        });
		        container.css("-" + config.pref + "-transition-duration", "0.4s");
		        // container.css({"-" + config.pref + : -(config.itemWidth+options.itemMargin)+'px'});
		        // container.animate(config.args, options.transitionTime, 'expo');
		    },

			increment: function() {
		        api.setPrevious();
		        config.currentPage++;
		    },

		    decrement: function() {
		        api.setPrevious();
		        config.currentPage--;
		    },

		    setPrevious: function() {
		        config.previousPage = config.currentPage;
		    },

		    next: function() {
		    	if( config.count === 1 ) return;

		        if(config.currentPage < config.pages-1 || options.loop === true) {

		            if(options.auto === true) {
		                api.pause();
		            }
		            api.increment();
		            api.navigate(1);
		        }
		    },

		    prev: function() {
		    	if( config.count === 1 ) return;

		        if(config.currentPage > 0 || options.loop === true) {
		            
		            if(options.auto === true) {
		                api.pause();
		            }
		            api.decrement();
		            api.navigate(0);
		        }
		    },

			goTo: function(key) {
		        if(options.auto === true) {
		            clearInterval(config.autoTimer);
		        }
		        
		        var tmpPage = config.currentPage;
		        api.setPrevious();
		        if(options.loopNeedle === 0) {
		            config.currentPage = key;
		        }
		        
		        if(tmpPage > key) {
		            if(options.loopNeedle === 0) return api.navigate(0);

		            while(config.currentPage > key) {
		                config.currentPage--;
		                api.navigate(0);

		            }

		        } else {
		            if(options.loopNeedle === 0) return api.navigate(1);

		            while(config.currentPage < key) {
		                config.currentPage++;
		                api.navigate(1);
		            }
		        }
		    },

		    play: function() {
		        var that = this;
		        config.autoTimer = setInterval( function(){ 
		            api.increment();
		            api.navigate(1);
		        }, options.delay);
		    },

		    pause: function() {
		        if(config.autoTimer != null) {
		            clearInterval(config.autoTimer);
		            config.autoTimer = null;
		        }
		    },

			touch: function() {
				var startX,
					startY,
					offset,
					cwidth,
					dx,
					startT,
					scrolling = false,
					el = element[0];

				el.addEventListener('touchstart', onTouchStart, false);

				function onTouchStart(event) {
				  if (config.isAnimating) {
					container.css("-" + config.pref + "-transition-duration", "0s");
					event.preventDefault();
				  } else if (event.touches.length === 1) {
					api.pause();
					
					cwidth = (vertical) ? config.itemWidth : config.itemHeight;
					startT = Number(new Date());

					offset = 0;
					startX = (vertical) ? event.touches[0].pageY : event.touches[0].pageX;
					startY = (vertical) ? event.touches[0].pageX : event.touches[0].pageY;

					el.addEventListener('touchmove', onTouchMove, false);
					el.addEventListener('touchend', onTouchEnd, false);
				  }
				}

				function onTouchMove(event) {
					dx = (vertical) ? startX - event.touches[0].pageY : startX - event.touches[0].pageX;
					scrolling = (vertical) ? (Math.abs(dx) < Math.abs(event.touches[0].pageX - startY)) : (Math.abs(dx) < Math.abs(event.touches[0].pageY - startY));

					if (!scrolling || Number(new Date()) - startT > 500) {
						event.preventDefault();
						if (!fade && config.transitions) {
							if (!options.loop) {
								dx = dx/((config.currentPage === 0 && dx < 0 || config.currentPage === config.count-1 && dx > 0) ? (Math.abs(dx)/cwidth+2) : 1);
							}

							setProps(offset+dx, "setTouch");
						}
					}
				}

				function setProps(val, type, dur) {
					val = (val*-1) + 'px';
					var target = (vertical) ? "translate3d(0," + val + ",0)" : "translate3d(" + val + ",0,0)";
					dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";

					container.css("-" + config.pref + "-transition-duration", dur);

					config.args[config.prop] = target;

					container.css(config.args);
				}
				
				function onTouchEnd(event) {
				  el.removeEventListener('touchmove', onTouchMove, false);

				  if (!scrolling && !(dx === null)) {
					var updateDx = dx,
						target = (updateDx > 0) ? config.nextPage : config.prevPage;
					
					if ((Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
					  if(dx < 0) {
						if(config.currentPage > 0) {
							api.decrement();
							setProps( -(config.itemWidth+options.itemMargin), "setTouch");
							api.navigateTouch(target, 0, dx, Number(new Date()) - startT);
						} else {
							setProps(0, "setTouch");
							api.navigateRestore(target);
						}
					  } else {
						if(config.currentPage < config.count-1) {
							api.increment();
							setProps(config.itemWidth+options.itemMargin, "setTouch");
							api.navigateTouch(target, 1, dx, Number(new Date()) - startT);
						} else {
							setProps(0, "setTouch");
							api.navigateRestore(target);
						}
					  }

					} else {
					  setProps(0, "setTouch");
					  api.navigateRestore(target);
					}
				  }

				  el.removeEventListener('touchend', onTouchEnd, false);
				  startX = null;
				  startY = null;
				  dx = null;
				  offset = null;
				}
			}
		}

		api.init();

		return api;
	}

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

	$.easing.expo = function (x, t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    };

	$.fn.contentslider = function(options) {
	    return this.each(function() {
	        if ( !$.data(this, "contentslider")) {
                $.data( this, "contentslider", new $.contentslider( this, options ));
            }
	    });
	  }  

})(jQuery);