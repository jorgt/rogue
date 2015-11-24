define([
	'helpers/log',
	"engine/states",
	"game/game"
], function(log, states, Game) {

	states.add({
		game: null,
		name: 'play',
		init: function() {
			this.keys.press('m', function(e) {
				this.game.screen.hide();
				states.switch('map');
			}.bind(this));
		},
		start: function() {
			Game().then(function(obj) {
				this.game = obj;
				this.game.addKeyboard(this.keys);
				this.game.addMouse(this.mouse);
				this.game.screen.show();
			}.bind(this));
		},
		stop: function() {

		},
		update: function() {
			if (this.game) {
				this.game.update();
			}
		},
		draw: function() {
			this.screen.clear();
			if (this.game) {
				this.game.draw();
			}
		}
	});
});