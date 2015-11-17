requirejs.config({
	baseUrl: 'js',
	urlArgs: "bust=" + (new Date()).getTime()
});

require(['helpers/log', 'game/game', 'util'], function(log, game) {
	'use strict';

	log.urgent('[MAIN]', 'fetching engine, gathering parts');

	//the timeouts are necessary. they interrupt the execution order of 
	//javascript functions. it means util will be loaded fully in the 
	//first one, and the loading screen is set and displayed in the second.
	window.setTimeout(function() {
		require(['engine/engine'], function(engine) {
			engine.start('loading');

			window.setTimeout(function() {
				game().create().then(function() {
					log.urgent('[MAIN]', 'Game creation done, now starting engine');
					engine.switch('menu');
				});
			}.bind(this), 1);
		});
	}.bind(this), 1);

});