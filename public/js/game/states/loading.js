define([
	'helpers/log',
	"engine/states",
	"settings"
], function(log, states, settings) {

	'use strict';

	states.add({
		name: 'loading',
		init: function() {
			this.textx = 0;
			this.texty = 0;
		},
		start: function() {
			this._newOffset();
		},
		update: function() {
			if (Math.random() < 0.01) {
				this._newOffset();
			}
		},
		draw: function() {
			this.screen.clear();
			var str = 'Loading...';
			this.screen.write(str, this.textx - ((str.length / 2) * settings.screen.block) , this.texty);
		},
		stop: function() {

		},
		_newOffset: function() {
			this.textx = random(this.screen.width / 2 - 10, this.screen.width / 2 + 10);
			this.texty = random(this.screen.height / 2 - 10, this.screen.height / 2 + 10);
		}
	});
});