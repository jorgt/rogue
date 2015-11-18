define([
	'helpers/log',
	"engine/states",
	"game/game"
], function(log, states, Game) {

	var game;
	
	states.add({
		name: 'play',
		init: function() {
			this.keys.press('left', function(e) {
				game.move(-1, 0);
			});
			this.keys.press('right', function(e) {
				game.move(1, 0);
			});
			this.keys.press('up', function(e) {
				game.move(0, -1);
			});
			this.keys.press('down', function(e) {
				game.move(0, 1);
			});

			this.keys.press('p', function(e) {
				game.pause();
			}.bind(this));

			this.keys.press('m', function(e) {
				game.screen.hide();
				states.switch('map');
			}.bind(this));
		},
		start: function() {
			game = Game();
			this.mouse.setup('game');
			game.screen.show();

			//we need the x and y offset in the game, not just the screen
			this.mouse.move(function(e) {
				var tile = game.getTile(e.tile.height, e.tile.width);
			})
		},
		stop: function() {

		},
		update: function() {
			game.update();
		},
		draw: function() {
			game.draw();
		}
	});
});