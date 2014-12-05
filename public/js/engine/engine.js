define(["engine/states", "helpers/log", "states/all"], function(
        states,
        log) {

	'use strict';

	return (function Engine() {
		var engine = {
			start: function(state) {
				log.urgent('[ENGINE]', 'engine starting in state:', state);
				states.switch(state);
				engine.loop(0);
			},
			stop: function() {
				log.urgent('[ENGINE]', 'engine stopping, cleaning up');
			},
			loop: function(time) {
				if (states.active.isPaused() === false) {
					engine.update(time);
				}
				engine.draw(time);
				if (states.active.isRunning() === true) {
					window.requestAnimFrame(function(time) {
						engine.loop(time);
					});
				} else {
					engine.stop();
				}
			},
			update: function(time) {
					states.active.update(time);
			},
			draw: function(time) {
				states.active.draw(time);
			},
			pause: function() {
				states.active.pause();
			}
		};

		return engine;
	})();

});