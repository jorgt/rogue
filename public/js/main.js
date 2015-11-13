requirejs.config({
	baseUrl: 'js',
	urlArgs: "bust=" + (new Date()).getTime()
});

require(['helpers/log', 'game/game', 'util'], function(log, game) {
	'use strict';

	log.urgent('[MAIN]', 'fetching engine, gathering parts');

	require(['engine/engine'], function(engine) {
		game().create().then(function() {
			log.urgent('[MAIN]', 'Game creation done, now starting engine');
			engine.start('menu');
		});
	});

});