define([
	'helpers/log',
	"engine/states"
], function(log, states) {

	states.add({
		name: 'exit',
		init: function() {

		},
		start: function() {
			this.quit();
		},
		stop: function() {

		},
		update: function() {

		}
	});
});