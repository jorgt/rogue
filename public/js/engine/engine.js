define([
	"engine/states",
	"helpers/log",
	"settings",
	"game/states/all"
], function(states, log, settings) {

	'use strict';

	var ticks = 0,
		timePassed = 0,
		timeSecond = 0,
		fps = 0,
		div = 0;

	if (settings.debug === true) {
		div = document.createElement('div');
		div.style.cssText = 'background-color:black;color:white;position:fixed;top:0,left:0;font-family:"Courier New", Courier, monospace;';
		document.body.appendChild(div);
	}

	return (function Engine() {
		var engine = {
			start: function(state) {
				log.urgent('[ENGINE]', 'engine starting in state:', state);
				states.switch(state);
				timePassed = new Date().getTime();
				engine.loop(0);
			},
			stop: function() {
				log.urgent('[ENGINE]', 'engine stopping, cleaning up');
			},
			loop: function(time) {
				if (states.active.isPaused() === false) {
					//console.time("update");
					engine.update(time);
					//console.timeEnd("update");
				}

				engine.draw(time);

				if (states.active.isRunning() === true) {
					window.requestAnimFrame(engine.loop);
				} else {
					engine.stop();
				}

				var now = new Date().getTime();
				timeSecond += (now - timePassed);
				timePassed = now;
				ticks++;

				if (timeSecond >= 1000) {
					fps = ticks;
					ticks = 0;
					timeSecond = 0;
					if (settings.debug === true) {
						div.innerHTML = (fps < 10) ? "0" + fps : fps;
					}
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
			},
			switch: function(name) {
				states.switch(name);
			}
		};

		return engine;
	})();

});