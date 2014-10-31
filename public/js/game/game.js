define([
	"helpers/log",
	"game/tilebank",
	"game/assets",
	"game/dungeon/level",
	"helpers/events",
	"settings"
], function(
	log,
	bank,
	Assets,
	Level,
	Events,
	settings) {

	'use strict';

	function Game(scrn) {
		var _guid = guid();
		log.urgent('[GAME:' + _guid + ']', 'initializing game');

		var _level = new Level();
		var _size = settings.square;
		var _asset = new Assets('game', bank);

		var _events = new Events();

		this.start = function() {
			var grid = _level.getGrid();

			for (var x = 0; x < grid.length; x++) {
				for (var y = 0; y < grid[x].length; y++) {
					scrn.add(_asset.object(grid[x][y], x, y));
				}
			}

			scrn.add(_asset.player(3, 6, this));
			_setupMovementEvents();

			scrn.setSize(grid[0].length * _size, grid.length * _size);
			_asset.player().view.calculate();
			_asset.player().parseData();
			log.urgent('[GAME:' + _guid + ']', 'game running!');

		};

		this.level = function() {
			return _level;
		}

		this.assets = function() {
			return _asset;
		}

		this.update = function() {

		};

		this.fire = function(evt, direction) {
			_events.raise('game.movement', {
				direction: direction
			});
		};

		function _setupMovementEvents() {
			var _player = _asset.player();
			_events.on('game.movement', function(evt) {
				var x = 0,
					y = 0;
				switch (evt.detail.direction) {
					case 'left':
						y = -1;
						break;
					case 'up':
						x = -1;
						break;
					case 'right':
						y = 1;
						break;
					case 'down':
						x = 1;
						break;
					default:
						throw new Error('Game:', 'direction not defined', evt.detail.direction);
				}
				//always move player
				_player.move(_level.getGrid(), x, y);
				_player.view.update(_player.position());
				_player.parseData();
				_scroll(_player, x, y);

			}.bind(this));
		}

		function _scroll(player, x, y) {

			var dim = scrn.dimensions();
			var ph = player.get('top') + dim.canvas.top;
			var pw = player.get('left') + dim.canvas.left;
			var halfH = dim.screen.height / 2;
			var halfW = dim.screen.width / 2;
			var top = 0;
			var left = 0
			if (x === 1 && ph >= halfH && !(dim.canvas.height + dim.canvas.top <= dim.screen.height)) {
				top = -1 * _size
			}

			if (x === -1 && dim.canvas.top !== 0 && ph <= halfH) { //down
				scrn.scroll(_size, 0)
			}

			if (y === 1 && pw >= halfW && !(dim.canvas.width + dim.canvas.left <= dim.screen.width)) { //down
				left = -1 * _size;
			}

			if (y === -1 && dim.canvas.left !== 0 && pw <= halfW) { //down
				left = _size;
			}

			scrn.scroll(top, left)
		}

		function _toBlock(n) {
			return Math.floor(n / _size);
		}
	}

	return Game;
});