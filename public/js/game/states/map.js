define([
	'helpers/log',
	"engine/states",
	"game/game"
], function(log, states, Game) {

	var game;

	states.add({
		game: null,
		name: 'map',
		init: function() {
			this.keys.press('m', function(e) {
				states.switch('play');
			}.bind(this));

			var g = Game();
			g.then(function(obj) {
				this.game = obj;
			}.bind(this));
		},
		start: function() {
			//don't need to do this in the 'draw' function at the moment 
			//because there are no updates, and start is executed on display.
			if (this.game) {
				this.screen.map(this.game.world, this.game.player);
			}
		},
		draw: function() {

		},
		stop: function() {

		},
		update: function() {

		}
	});
});