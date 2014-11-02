requirejs.config({
	baseUrl: 'js',
	urlArgs: "bust=" + (new Date()).getTime()
});

require(['helpers/log', 'util'], function(log) {
	'use strict';

	log.urgent('[MAIN]', 'fetching engine, gathering parts');

	require(['engine/engine'], function(engine) {
		//try {
			engine.start('menu');
		//} catch (e) {
		//	log.error(e.message)
		//	engine.stop();	
		//} 
	});

});