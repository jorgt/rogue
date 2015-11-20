define([
	"helpers/log",
	"game/pathfinding/astar",
	"game/landtypes/base"
], function(
	log,
	AStar,
	Base) {

	'use strict';

	return function dungeon(opt) {

		var _guid = guid();
		var _height = uneven(random(40, 50));
		var _width = uneven(random(60, 80));
		var _grid = [];
		var _start = null;
		var _end = null;
		var _surface = _height * _width;
		var _floorspace = 0;
		var _totalfloorspace = uneven(random(_surface * 0.3, _surface * 0.4));
		var _doors = [];

		log.high('[DUNGEON:' + _guid + ']', 'dimensions', _height, 'x', _width, 'blocks');

		_initializeRooms();
		_connectDoors();
		_getStartAndEndTiles();

		return new Base(_grid, _start, _end, _height, _width);

		function _fill(tile) {
			for (var x = 0; x < _width; x++) {
				_grid[x] = _grid[x] || [];
				for (var y = 0; y < _height; y++) {
					_grid[x][y] = opt.bank.get(tile);
				}
			}
		}

		function _initializeRooms() {
			_fill('rock');
			for (var x = 0; x < 10000 && _floorspace < _totalfloorspace; x++) {
				if (x > 0 && x % 500 === 0) {
					log.low('[DUNGEON:' + _guid + ']', x, 'room runs');
				}
				_floorspace += _makeRoom();
			}

			log.med('[DUNGEON:' + _guid + ']', _doors.length,
				'rooms in', x, 'attemps covering', _totalfloorspace,
				'of', _surface, 'surface area');

			if (_floorspace === 0) {
				log.throw('No rooms created');
			}
		}

		function _connectDoors() {
			log.med('[DUNGEON:' + _guid + ']', 'connecting rooms');

			for (var x = 0; x < _doors.length - 1; x++) {
				var d1 = _doors[x][0];
				var d2 = _doors[x + 1][1];
				_grid[d1[0]][d1[1]] = opt.bank.get('door');
				_grid[d2[0]][d2[1]] = opt.bank.get('door');
				var result = AStar.search(clone(_grid), d1, d2);
				for (var r in result) {
					if (result.hasOwnProperty(r)) {
						_grid[result[r].x][result[r].y] = opt.bank.get('road');
					}
				}
			}
		}

		function _getStartAndEndTiles() {
			log.med('[DUNGEON:' + _guid + ']', 'getting start- and end tiles');
			var start = null;
			var end = null;
			while (_start === null || _end === null) {
				var sx = random(0, _grid.length - 1);
				var sy = random(0, _grid[0].length - 1);
				var ex = random(0, _grid.length - 1);
				var ey = random(0, _grid[0].length - 1);
				start = _grid[sx][sy];
				end = _grid[ex][ey];
				_start = (start.walkable === true) ? [sx, sy] : null;
				_end = (end.walkable === true) ? [ex, ey] : null;
			}
		}

		function _makeRoom() {
			var grid = clone(_grid);
			var w = uneven(random(5, 20));
			var h = uneven(random(3, 20));
			var sw = uneven(random(1, _width));
			var sh = uneven(random(1, _height));
			var walls = [];
			var doors = [];
			// out of bounds
			if (h + sh > _height || w + sw > _width) {
				return 0;
			}

			for (var x = sw; x < w + sw; x++) {
				for (var y = sh; y < h + sh; y++) {
					if (grid[x][y].diggable === true) {
						if (x === sw || x === sw + w - 1 || y === sh || y === sh + h - 1) {
							grid[x][y] = opt.bank.get('wall');
							if (x === sw && y === sh ||
								x === sw && y === sh + h - 1 ||
								x === sw + w - 1 && y === sh ||
								x === sw + w - 1 && y === sh + w - 1) {
								//this is a corner
							} else {
								walls.push([x, y]);
							}
						} else {
							grid[x][y] = opt.bank.get('floor');
						}
					} else {
						return 0;
					}
				}
			}

			doors.push(walls[random(0, walls.length - 1)]);
			doors.push(walls[random(0, walls.length - 1)]);

			_doors.push(doors);
			_grid = grid;
			return w * h;
		}
	};

	function clone(array) {
		var newObj = (array instanceof Array) ? [] : {};
		for (var x = 0; x < array.length; x++) {
			newObj[x] = array[x].slice(0);
		}
		return newObj;
	}
});