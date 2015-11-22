define(["helpers/log"], function(
	log) {

	log.setDebug(4);

	window.guid = function() {
		return ~~(Math.random() * 100000);
	};

	window.uneven = function(n) {
		return (n % 2 === 0) ? n + 1 : n;
	};

	window.random = function(low, high) {
		return ~~(Math.random() * (high - low + 1) + low);
	};

	//animationframe polyfill
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( /* function */ callback, /* DOMElement */ element) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	window.cancelAnimFrame = (function() {
		window.cancelAnimFrame ||
			function(id) {
				clearTimeout(id);
			};
	})();

	//Class
	window.Class = (function() {
		var initializing = false,
			fnTest = /xyz/.test(function() {
				xyz;
			}) ? /\b_super\b/ : /.*/;

		// The base Class implementation (does nothing)
		function Class() {};

		// Create a new Class that inherits from this class
		function extend(prop) {
			var _super = this.prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			var prototype = new this();
			initializing = false;

			// Copy the properties over onto the new prototype
			for (var name in prop) {
				// Check if we're overwriting an existing function
				prototype[name] = typeof prop[name] == "function" &&
					typeof _super[name] == "function" && fnTest.test(prop[name]) ?
					(function(name, fn) {
						return function() {
							var tmp = this._super;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(name, prop[name]) :
					prop[name];
			}

			// The dummy class constructor
			function Class() {
				// All construction is actually done in the init method
				if (!initializing && this.init)
					this.init.apply(this, arguments);
			}

			// Populate our constructed prototype object
			Class.prototype = prototype;

			// Enforce the constructor to be what we expect
			Class.prototype.constructor = Class;

			// And make this class extendable
			Class.extend = extend;

			return Class;
		};

		Class.extend = extend;

		return Class;
	})();

	//hdpi canvas polyfill 
	//https://github.com/jondavidjohn/hidpi-canvas-polyfill
	
	(function(prototype) {
		prototype.getContext = (function(_super) {
			return function(type) {
				var backingStore, ratio,
					context = _super.call(this, type);

				if (type === '2d') {

					backingStore = context.backingStorePixelRatio ||
						context.webkitBackingStorePixelRatio ||
						context.mozBackingStorePixelRatio ||
						context.msBackingStorePixelRatio ||
						context.oBackingStorePixelRatio ||
						context.backingStorePixelRatio || 1;

					ratio = (window.devicePixelRatio || 1) / backingStore;

					if (ratio > 1) {
						this.style.height = this.height + 'px';
						this.style.width = this.width + 'px';
						this.width *= ratio;
						this.height *= ratio;
					}
				}
				return context;
			};
		})(prototype.getContext);
	})(HTMLCanvasElement.prototype);

	//hdpi canvas polyfill
	//https://github.com/jondavidjohn/hidpi-canvas-polyfill
	(function(prototype) {

		var pixelRatio = window.pixelRatio = (function(context) {
				var backingStore = context.backingStorePixelRatio ||
					context.webkitBackingStorePixelRatio ||
					context.mozBackingStorePixelRatio ||
					context.msBackingStorePixelRatio ||
					context.oBackingStorePixelRatio ||
					context.backingStorePixelRatio || 1;

				return (window.devicePixelRatio || 1) / backingStore;
			})(prototype),

			forEach = function(obj, func) {
				for (var p in obj) {
					if (obj.hasOwnProperty(p)) {
						func(obj[p], p);
					}
				}
			},

			ratioArgs = {
				'fillRect': 'all',
				'clearRect': 'all',
				'strokeRect': 'all',
				'moveTo': 'all',
				'lineTo': 'all',
				'arc': [0, 1, 2],
				'arcTo': 'all',
				'bezierCurveTo': 'all',
				'isPointinPath': 'all',
				'isPointinStroke': 'all',
				'quadraticCurveTo': 'all',
				'rect': 'all',
				'translate': 'all',
				'createRadialGradient': 'all',
				'createLinearGradient': 'all',
				'drawImage': [1,2,3,4,5,6,7,8]
				//'drawImage': [1,2,3,4]
			};

		if (pixelRatio === 1) return;

		forEach(ratioArgs, function(value, key) {
			prototype[key] = (function(_super) {
				return function() {
					var i, len,
						args = Array.prototype.slice.call(arguments);

					if (value === 'all') {
						args = args.map(function(a) {
							return a * pixelRatio;
						});
					} else if (Array.isArray(value)) {
						for (i = 0, len = value.length; i < len; i++) {
							args[value[i]] *= pixelRatio;
						}
					}

					return _super.apply(this, args);
				};
			})(prototype[key]);
		});

		// Stroke lineWidth adjustment
		prototype.stroke = (function(_super) {
			return function() {
				this.lineWidth *= pixelRatio;
				_super.apply(this, arguments);
				this.lineWidth /= pixelRatio;
			};
		})(prototype.stroke);

		// Text
		//
		prototype.fillText = (function(_super) {
			return function() {
				var args = Array.prototype.slice.call(arguments);

				args[1] *= pixelRatio; // x
				args[2] *= pixelRatio; // y

				this.font = this.font.replace(
					/(\d+)(px|em|rem|pt)/g,
					function(w, m, u) {
						return (m * pixelRatio) + u;
					}
				);

				_super.apply(this, args);

				this.font = this.font.replace(
					/(\d+)(px|em|rem|pt)/g,
					function(w, m, u) {
						return (m / pixelRatio) + u;
					}
				);
			};
		})(prototype.fillText);

		prototype.drawImage = (function(_super) {
			return function() {
				//this.scale(pixelRatio, pixelRatio);
				_super.apply(this, arguments);
			};
		})(prototype.drawImage);

		prototype.strokeText = (function(_super) {
			return function() {
				var args = Array.prototype.slice.call(arguments);

				args[1] *= pixelRatio; // x
				args[2] *= pixelRatio; // y

				this.font = this.font.replace(
					/(\d+)(px|em|rem|pt)/g,
					function(w, m, u) {
						return (m * pixelRatio) + u;
					}
				);

				_super.apply(this, args);

				this.font = this.font.replace(
					/(\d+)(px|em|rem|pt)/g,
					function(w, m, u) {
						return (m / pixelRatio) + u;
					}
				);
			};
		})(prototype.strokeText);
	})(CanvasRenderingContext2D.prototype);
	

	(function(win, doc) {
		"use strict";

		var TEST_STRING = 'AxmTYklsjo190QW',
			SANS_SERIF_FONTS = 'sans-serif',
			SERIF_FONTS = 'serif',

			defaultOptions = {
				tolerance: 2, // px
				delay: 100,
				glyphs: '',
				success: function() {},
				error: function() {},
				timeout: 5000,
				weight: '400', // normal
				style: 'normal'
			},

			// See https://github.com/typekit/webfontloader/blob/master/src/core/fontruler.js#L41
			style = [
				'display:block',
				'position:absolute',
				'top:-999px',
				'left:-999px',
				'font-size:48px',
				'width:auto',
				'height:auto',
				'line-height:normal',
				'margin:0',
				'padding:0',
				'font-variant:normal',
				'white-space:nowrap'
			],
			html = '<div style="%s">' + TEST_STRING + '</div>';

		var FontFaceOnloadInstance = function() {
			this.fontFamily = '';
			this.appended = false;
			this.serif = undefined;
			this.sansSerif = undefined;
			this.parent = undefined;
			this.options = {};
		};

		FontFaceOnloadInstance.prototype.getMeasurements = function() {
			return {
				sansSerif: {
					width: this.sansSerif.offsetWidth,
					height: this.sansSerif.offsetHeight
				},
				serif: {
					width: this.serif.offsetWidth,
					height: this.serif.offsetHeight
				}
			};
		};

		FontFaceOnloadInstance.prototype.load = function() {
			var startTime = new Date(),
				that = this,
				serif = that.serif,
				sansSerif = that.sansSerif,
				parent = that.parent,
				appended = that.appended,
				dimensions,
				options = that.options,
				ref = options.reference;

			function getStyle(family) {
				return style
					.concat(['font-weight:' + options.weight, 'font-style:' + options.style])
					.concat("font-family:" + family)
					.join(";");
			}

			var sansSerifHtml = html.replace(/\%s/, getStyle(SANS_SERIF_FONTS)),
				serifHtml = html.replace(/\%s/, getStyle(SERIF_FONTS));

			if (!parent) {
				parent = that.parent = doc.createElement("div");
			}

			parent.innerHTML = sansSerifHtml + serifHtml;
			sansSerif = that.sansSerif = parent.firstChild;
			serif = that.serif = sansSerif.nextSibling;

			if (options.glyphs) {
				sansSerif.innerHTML += options.glyphs;
				serif.innerHTML += options.glyphs;
			}

			function hasNewDimensions(dims, el, tolerance) {
				return Math.abs(dims.width - el.offsetWidth) > tolerance ||
					Math.abs(dims.height - el.offsetHeight) > tolerance;
			}

			function isTimeout() {
				return (new Date()).getTime() - startTime.getTime() > options.timeout;
			}

			(function checkDimensions() {
				if (!ref) {
					ref = doc.body;
				}
				if (!appended && ref) {
					ref.appendChild(parent);
					appended = that.appended = true;

					dimensions = that.getMeasurements();

					// Make sure we set the new font-family after we take our initial dimensions:
					// handles the case where FontFaceOnload is called after the font has already
					// loaded.
					sansSerif.style.fontFamily = that.fontFamily + ', ' + SANS_SERIF_FONTS;
					serif.style.fontFamily = that.fontFamily + ', ' + SERIF_FONTS;
				}

				if (appended && dimensions &&
					(hasNewDimensions(dimensions.sansSerif, sansSerif, options.tolerance) ||
						hasNewDimensions(dimensions.serif, serif, options.tolerance))) {

					options.success();
				} else if (isTimeout()) {
					options.error();
				} else {
					if (!appended && "requestAnimationFrame" in window) {
						win.requestAnimationFrame(checkDimensions);
					} else {
						win.setTimeout(checkDimensions, options.delay);
					}
				}
			})();
		}; // end load()

		FontFaceOnloadInstance.prototype.cleanFamilyName = function(family) {
			return family.replace(/[\'\"]/g, '').toLowerCase();
		};

		FontFaceOnloadInstance.prototype.cleanWeight = function(weight) {
			// lighter and bolder not supported
			var weightLookup = {
				normal: '400',
				bold: '700'
			};

			return '' + (weightLookup[weight] || weight);
		};

		FontFaceOnloadInstance.prototype.checkFontFaces = function(timeout) {
			var _t = this;
			doc.fonts.forEach(function(font) {
				if (_t.cleanFamilyName(font.family) === _t.cleanFamilyName(_t.fontFamily) &&
					_t.cleanWeight(font.weight) === _t.cleanWeight(_t.options.weight) &&
					font.style === _t.options.style) {
					font.load().then(function() {
						_t.options.success();
						win.clearTimeout(timeout);
					});
				}
			});
		};

		FontFaceOnloadInstance.prototype.init = function(fontFamily, options) {
			var timeout;

			for (var j in defaultOptions) {
				if (!options.hasOwnProperty(j)) {
					options[j] = defaultOptions[j];
				}
			}

			this.options = options;
			this.fontFamily = fontFamily;

			// For some reason this was failing on afontgarde + icon fonts.
			if (!options.glyphs && "fonts" in doc) {
				if (options.timeout) {
					timeout = win.setTimeout(function() {
						options.error();
					}, options.timeout);
				}

				this.checkFontFaces(timeout);
			} else {
				this.load();
			}
		};

		var FontFaceOnload = function(fontFamily, options) {
			var instance = new FontFaceOnloadInstance();
			instance.init(fontFamily, options);

			return instance;
		};

		// intentional global
		win.FontFaceOnload = FontFaceOnload;
	})(this, this.document);
});