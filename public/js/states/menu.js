define([
	'helpers/log',
	"engine/states"
], function(log, states) {

	'use strict';

	states.add({
		name: 'menu',
		init: function() {
			this.keys.press('enter', function() {
				states.switch('play');
			});
		},
		start: function() {

		},
		stop: function() {

		}
	});
});