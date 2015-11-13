define([
	'helpers/log',
	"engine/states",
	"game/game"
], function(log, states, game) {

	var game = game();

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
		},
		start: function() {

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