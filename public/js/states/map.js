define([
	'helpers/log',
	"engine/states",
	"game/game"
], function(log, states, Game) {

	var game;

	states.add({
		name: 'map',
		init: function() {
			this.keys.press('m', function(e) {
				states.switch('play');
			}.bind(this));
		},
		start: function() {
			game = Game();

			this.screen.map(game.world.background, game.player);
		},
		draw: function() {

		},
		stop: function() {

		},
		update: function() {

		}
	});
});