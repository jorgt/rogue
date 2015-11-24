requirejs.config({
	baseUrl: 'js',
	urlArgs: "bust=" + (new Date()).getTime()
});

require(['helpers/log', 'settings', 'util'], function(log, settings) {
	'use strict';

	log.urgent('[MAIN]', 'START!');

	require(['engine/engine'], function(engine) {
		//the timeouts are necessary. they interrupt the execution order of 
		//javascript functions. it means util will be loaded fully in the 
		//first one, and the loading screen is set and displayed in the second.

		FontFaceOnload(settings.screen.font, {
			success: function() {

				log.urgent('[MAIN]', 'font ready, starting the loading screen');

				engine.start('loading');

				window.setTimeout(function() {
					require(['game/game'], function(game) {

						window.setTimeout(function() {
							game().then(function() {
								log.urgent('[MAIN]', 'Game creation done, now starting engine');
								engine.switch('menu');
							});
						}.bind(this), 1);
					});
				}.bind(this), 1);

			},
			error: function() {
				log.urgent('[MAIN]', 'font not loaded!');
			},
			timeout: 5000 // in ms. Optional, default is 10 seconds
		})
	});
});