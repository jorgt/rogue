define([
	'helpers/log',
	"engine/states",
	"settings"
], function(log, states, settings) {

	'use strict';

	states.add({
		name: 'menu',
		init: function() {
			this.keys.press('enter', function() {
				states.switch('play');
			});

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
			var str = 'Press ENTER to start!';
			this.screen.write(str, this.textx - ((str.length / 2) * settings.screen.block) , this.texty);
		},
		stop: function() {

		},
		_newOffset: function() {
			this.textx = Math.between(this.screen.width / 2 - 10, this.screen.width / 2 + 10);
			this.texty = Math.between(this.screen.height / 2 - 10, this.screen.height / 2 + 10);
		}
	});
});