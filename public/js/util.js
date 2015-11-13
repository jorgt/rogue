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
});