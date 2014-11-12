define([
	"helpers/log",
	"game/tilebank",
	"game/assets",
	"game/landtypes/all",
	"game/text",
	"helpers/events",
	"settings"
], function(
	log,
	bank,
	Assets,
	Planes,
	Txt,
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
				assets: _assets,
				size: 41
			}
		});

		var _txt = new Txt(_sidebar, _assets);

		var _lastposition = null;
		var _selected = null;

		_setupEvents();
		_setupDelving();


		var _navigation = [];

		this.start = function() {
			_setupScreen(_current);
			_setupSidebar();
			log.urgent('[GAME:' + _guid + ']', 'game running!');
		};

		this.dungeon = function() {
			return _current;
		}

		this.update = function() {};

		function _setupScreen(cur) {

			if (_screen !== null) {
				_screen.hide();
			}
			_screen = _mainscreen.independent('dungeon');
			_screen.classList.remove('center');
			_screen.classList.add('game-screen-' + cur.type);
			var grid = cur.getGrid();

			for (var x = 0; x < grid.length; x++) {
				for (var y = 0; y < grid[x].length; y++) {
					_screen.add(grid[x][y], x, y);
				}
			}

			_screen.add(_assets.player(_current));
			_screen.size(grid.length * settings.square, grid[0].length * settings.square);
			var player = _assets.player(_current);

			var start = (_lastposition === null) ? _current.enter().start : _lastposition;
			player.move(_current.getGrid(), start[0], start[1]);
			player.view.update(player.position(), _current);
			player.draw();
			_scroll(player, player.position()[0], player.position()[1]);
		}

		function _setupDelving() {
			var order = ['world', 'dungeon'];
			Events.on('game.delve', function(e) {
				var next = null;
				var player = _assets.player(_current);
				var land = _current.get(player.position()).get('child');
				if (land === "false") {
					if (e.detail.direction === 'down') {
						if (order.indexOf(_current.type) < order.length - 1 && order.indexOf(_current.type) > -1) {
							next = order[order.indexOf(_current.type) + 1]
						}
					} else if (e.detail.direction === 'up') {
						if (order.indexOf(_current.type) > 0) {
							next = order[order.indexOf(_current.type) - 1]
						}
					}
					if (next !== null) {
						//get a new dungeon
						_lastposition = player.position();
						_current = Planes.createPlane({
							type: next,
							options: {
								assets: _assets
							}
						});
						_setupScreen(_current);
					}
				} else {
					_current = Planes.getPlane(land);
				}
			}.bind(this));
		}

		function _setupEvents() {
			Events.on('game.update', function(e) {
				_setupSidebar();
			}.bind(this));

			Events.on('game.movement', function(evt) {
				var player = _assets.player(_current);
				var dir = evt.detail.direction;
				var x = (dir === 'up') ? -1 : (dir === 'down') ? 1 : 0;
				var y = (dir === 'left') ? -1 : (dir === 'right') ? 1 : 0;
				var old = player.position();
				//move player
				if (x !== 0 || y !== 0) {
					player.move(_current.getGrid(), x, y);
					player.view.update(player.position(), this);
					player.draw();
					_scroll(player, x, y);

					Events.raise('game.update');
				}
			}.bind(this));

			Events.on('game.screen.resize', function(e) {
				//console.log(e)
			});

			Events.on('game.click', function(e) {
				if (e.detail.location.width < _current.size().y) {
					if (_selected !== null &&
						_selected[0] === e.detail.location.height &&
						_selected[1] === e.detail.location.width &&
						_current.get(_selected) !== null) {

						_current.get(_selected).classList.remove('selected');
						_selected = null;
					} else {
						if (_selected !== null) {
							_current.get(_selected).classList.remove('selected');
						}
						_selected = [e.detail.location.height, e.detail.location.width]
						_current.get(_selected).classList.add('selected');

					}
				}

				_setupSidebar()
			}.bind(this));
		}

		function _setupSidebar() {
			var player = _assets.player();

			var start = 2;

			_txt.set('current-pos-txt', 'Current Position:', start++, 2)
			_txt.next('current-pos', player.position().toString(), 2);

			_txt.set('line1', '----------------------------------', start++, 2);

			if (_current.type === 'world') {
				_txt.set('current-climate-txt', 'Climate:', start++, 2);
				_txt.next('current-climate', _current.get(player.position()).info.climate.climate, 2);

				_txt.set('current-climate-alt-txt', 'Altitude:', start++, 3);
				_txt.next('current-climate-alt', _current.get(player.position()).info.climate.alt + 'm', 2);

				_txt.set('current-climate-prec-txt', 'Precipitation:', start++, 3);
				_txt.next('current-climate-prec', _current.get(player.position()).info.climate.prec + 'mm', 2);

				_txt.set('current-climate-temp-txt', 'Temperature:', start++, 3);
				_txt.next('current-climate-temp', _current.get(player.position()).info.climate.temp + '&deg;', 2);

				start += 1;

				_txt.set('selected-pos-txt', 'Selected Position:', start++, 2);
				_txt.next('selected-pos', ((_isnull(_selected)) ? 'none' : _selected.toString()), 2);

				_txt.set('line2', '----------------------------------', start++, 2);

				_txt.set('selected-climate-txt', 'Climate:', start++, 2);
				_txt.next('selected-climate', ((_isnull(_selected)) ? 'n/a' : _current.get(_selected).info.climate.climate), 2);

				_txt.set('selected-climate-alt-txt', 'Altitude:', start++, 3);
				_txt.next('selected-climate-alt', ((_isnull(_selected)) ? 'n/a' : _current.get(_selected).info.climate.alt + 'm'), 2);

				_txt.set('selected-climate-prec-txt', 'Precipitation:', start++, 3);
				_txt.next('selected-climate-prec', ((_isnull(_selected)) ? 'n/a' : _current.get(_selected).info.climate.prec + 'mm'), 2);

				_txt.set('selected-climate-temp-txt', 'Temperature:', start++, 3);
				_txt.next('selected-climate-temp', ((_isnull(_selected)) ? 'n/a' : _current.get(_selected).info.climate.temp + '&deg;'), 2);
			}
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

		function _isnull(v) {
			return v === null;
		}
	}

	return Game;
});