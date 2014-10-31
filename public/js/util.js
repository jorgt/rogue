define(["helpers/log"], function(
	log) {

	window.guid = function() {
		return~~ (Math.random() * 100000);
	};

	window.uneven = function(n) {
		return (n % 2 === 0) ? n + 1 : n;
	};

	window.random = function(low, high) {
		return~~ (Math.random() * (high - low + 1) + low);
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

	log.setDebug(3);
});