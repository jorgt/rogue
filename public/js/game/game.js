define([
	"helpers/log",
	"game/tilebank",
	"game/assets",
	"game/worlds/planes",
	"helpers/events",
	"settings"
], function(
	log,
	bank,
	Assets,
	Planes,
	Events,
	settings) {

	'use strict';

	function Game(parentScreen) {
		var _guid = guid();
		log.urgent('[GAME:' + _guid + ']', 'initializing game');

		var _mainscreen = parentScreen.get('main');
		_mainscreen.classList.remove('center');
		var _screen = null;
		var _sidebar = parentScreen.get('sidebar', true, 300).position('left')
		var _assets = new Assets('game');
		var _current = Planes.createPlane({
			type: 'world',
			options: _assets
		});

		this.start = function() {
			_setupScreen(_current.type);
			var grid = _current.getGrid();

			for (var x = 0; x < grid.length; x++) {
				for (var y = 0; y < grid[x].length; y++) {
					_screen.add(grid[x][y], x, y);
				}
			}

			_screen.add(_assets.player(0, 0, this));
			_setupMovementEvents();
			_screen.size(grid.length * settings.square, grid[0].length * settings.square);
			var player = _assets.player();
			player.move(_current.getGrid(), _current.enter().start[0], _current.enter().start[1]);
			player.draw();
			player.view.update(player.position());
			player.draw();
			_scroll(player, player.position()[0], player.position()[1]);
			log.urgent('[GAME:' + _guid + ']', 'game running!');

			//this.start();

		};

		this.dungeon = function() {
			return _current;
		}

		this.update = function() {
			// monster stuff
		};

		function _setupScreen(type) {
			if (_screen !== null) {
				_screen.hide();
			}
			_screen = _mainscreen.independent('dungeon');
			_screen.classList.remove('center');
			_screen.classList.add('game-screen-'+type)
		}

		function _setupMovementEvents() {
			var _player = _assets.player();
			Events.on('game.movement', function(evt) {
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
				_player.move(_current.getGrid(), x, y);
				_player.view.update(_player.position());
				_player.draw();
				_scroll(_player, x, y);

			}.bind(this));

			Events.on('game.screen.resize', function(e) {
				//console.log(e)
			});
		}

		function _scroll(player, x, y) {

			var dim = _screen.dimensions();
			var ph = player.get('top') + dim.canvas.top;
			var pw = player.get('left') + dim.canvas.left;
			var halfH = dim.parent.height / 2;
			var halfW = dim.parent.width / 2;
			var top = 0;
			var left = 0
			if (x === 1 && ph >= halfH && !(dim.canvas.height + dim.canvas.top <= dim.parent.height)) {
				top = -1 * settings.square
			}

			if (x === -1 && dim.canvas.top !== 0 && ph <= halfH) { //down
				_screen.scroll(settings.square, 0)
			}

			if (y === 1 && pw >= halfW && !(dim.canvas.width + dim.canvas.left <= dim.parent.width)) { //down
				left = -1 * settings.square;
			}

			if (y === -1 && dim.canvas.left !== 0 && pw <= halfW) { //down
				left = settings.square;
			}

			_screen.scroll(top, left)
		}

		function _toBlock(n) {
			return Math.floor(n / settings.square);
		}
	}

	return Game;
});