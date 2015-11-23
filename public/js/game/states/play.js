define([
	'helpers/log',
	"engine/states",
	"game/game"
], function(log, states, Game) {

	states.add({
		game: null,
		name: 'play',
		init: function() {
			this.keys.press('left', function(e) {
				this.game.move(-1, 0);
			}.bind(this));

			this.keys.press('right', function(e) {
				this.game.move(1, 0);
			}.bind(this));

			this.keys.press('up', function(e) {
				this.game.move(0, -1);
			}.bind(this));

			this.keys.press('down', function(e) {
				this.game.move(0, 1);
			}.bind(this));

			this.keys.press('p', function(e) {
				this.game.pause();
			}.bind(this));

			this.keys.press('m', function(e) {
				this.game.screen.hide();
				states.switch('map');
			}.bind(this));
		},
		start: function() {
			var g = Game();

			g.then(function(obj) {
				this.game = obj;
				this.game.screen.show();
			}.bind(this));

			this.mouse.setup('game-screen-game');

			//we need the x and y offset in the game, not just the screen
			this.mouse.up(function(e) {
				this._mouse(e.tile);
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
			this._selectedTile();
		},
		_mouse: function(loc) {
			var x = loc.width,
				y = loc.height;
			if (this.game && this._mouseLocation.x !== x && this._mouseLocation.y !== y) {
				this._mouseLocation = {
					x: x,
					y: y,
					px: loc.pixWidth,
					py: loc.pixHeight
				};
				log.low('[PLAY]', 'mouse location: ', x, y);
				this.screen.drawMouse(loc.pixWidth, loc.pixHeight, this.game.getTile(x, y));
			} else if (this._mouseLocation.x === x && this._mouseLocation.y === y) {
				log.low('[PLAY]', 'reset mouse location');
				this._mouseLocation = {
					x: -1,
					y: -1,
					px: -1,
					py: - 1
				};
			}
		},
		_selectedTile: function(x, y, tile) {
			if (this._mouseLocation.x > 0 && this._mouseLocation.y > 0) {
				this.screen.box('white', this._mouseLocation.px, this._mouseLocation.py);
			}
		},
		_mouseLocation: {
			x: -1,
			y: -1,
			px: -1,
			py: - 1
		}
	});
});