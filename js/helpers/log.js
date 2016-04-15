define(['settings'], function(settings) {
	'use strict';

	var _none = function() {};

	var log = {
		throw: function(args) {
			throw new Error('[GAME ERROR]: ' + args.toString());
		},
		error: function(args) {
			window.console.error(args)
		},
		low: _none,
		med: _none,
		high: _none,
		urgent: _none,
		setDebug: function(_lvl) {
			if (settings.debug === true) {
				log.lvl = (_lvl > 4) ? 4 : _lvl;
				switch (4 - log.lvl) {
					case 0:
						log.low = window.console.log.bind(window.console, '%c   [GAME] 4:', 'color:gray');
						/* falls through */
					case 1:
						log.med = window.console.log.bind(window.console, '%c  [GAME] 3:', 'color:green');
						/* falls through */
					case 2:
						log.high = window.console.log.bind(window.console, '%c [GAME] 2:', 'color:orange');
						/* falls through */
					case 3:
						log.urgent = window.console.log.bind(window.console, '%c[GAME] 1:', 'color:red');
						/* falls through */
				}

				log.low('[DEBUG]', 'setting debugging level to', log.lvl);
			}
		},
		lvl: 0
	};

	return log;

});