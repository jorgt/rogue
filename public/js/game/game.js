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
		var _sidebar = parentScreen.get('sidebar', true, 300).position('left');
		var _assets = new Assets('game');
		var _current = Planes.createPlane({
			type: 'world',
			options: {
				assets: _assets
			}
		});

		_setupMovementEvents();
		_setupDelving();

		var _navigation = [];

		this.start = function() {
			_setupScreen(_current.type);
			var grid = _current.getGrid();

			for (var x = 0; x < grid.length; x++) {
				for (var y = 0; y < grid[x].length; y++) {
					_screen.add(grid[x][y], x, y);
				}
			}
			_screen.add(_assets.player(_current.enter().start[0], _current.enter().start[1], this));
			_screen.size(grid.length * settings.square, grid[0].length * settings.square);
			var player = _assets.player();

			player.move(_current.getGrid(), _current.enter().start[0], _current.enter().start[1]);
			player.view.update(player.position(), this);
			player.draw();
			_scroll(player, player.position()[0], player.position()[1]);

			var dim = _screen.dimensions();
			if (dim.canvas.height < dim.parent.height) {
				_screen.classList.add('center-vert')
			}
			if (dim.canvas.width < dim.parent.width) {
				_screen.classList.add('center-hori')
			}

			log.urgent('[GAME:' + _guid + ']', 'game running!');
		};

		this.dungeon = function() {
			return _current;
		}

		this.update = function() {};

		function _setupScreen(type) {
			if (_screen !== null) {
				_screen.hide();
			}
			_screen = _mainscreen.independent('dungeon');
			_screen.classList.remove('center');
			_screen.classList.add('game-screen-' + type)
		}

		function _setupDelving() {
			//var player = _assets.player();
			//console.log(_current)
		}

		function _setupMovementEvents() {
			Events.on('game.movement', function(evt) {
				var player = _assets.player();
				var dir = evt.detail.direction;
				var x = (dir === 'up') ? -1 : (dir === 'down') ? 1 : 0;
				var y = (dir === 'left') ? -1 : (dir === 'right') ? 1 : 0;
				var old = player.position();
				//move player
				if (x !== 0 || y !== 0) {
					player.move(_current.getGrid(), x, y);
					if (player.position().toString() !== old.toString()) {
						player.view.update(player.position(), _current);
						player.draw();
						_scroll(player, x, y);

						Events.raise('game.update');
					}
				}
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