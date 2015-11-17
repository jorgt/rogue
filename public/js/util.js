define(["helpers/log"], function(
	log) {

	log.setDebug(3);

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

		var pixelRatio = (function(context) {
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
				'createLinearGradient': 'all'
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
});