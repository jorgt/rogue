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
		},
		start: function() {
			Game().then(function(obj) {
				this.game = obj;
				this.screen.map(this.game.world, this.game.player, true);
			}.bind(this));
			
			//don't need to do this in the 'draw' function at the moment 
			//because there are no updates, and start is executed on display.
		},
		draw: function() {

		},
		stop: function() {

		},
		update: function() {

		}
	});
});