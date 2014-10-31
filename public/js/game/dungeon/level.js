define(["helpers/log", "game/tilebank", "game/pathfinding/astar"], function(
	log,
	bank,
	AStar) {

	'use strict';

	function Dungeon() {
		var _guid = guid();
		var _height = uneven(random(35, 50));
		var _width = uneven(random(60, 80));
		var _surface = _height * _width;
		var _grid = [];
		var _floorspace = 0;
		var _totalfloorspace = uneven(random(_surface * 0.3, _surface * 0.4));
		var _doors = [];

		log.high('[DUNGEON:' + _guid + ']',
			'dimensions', _height, 'x', _width, 'blocks');

		_initializeRooms();
		_connectDoors();

		this.getGrid = function() {
			return _grid;
		};

		this.size = function() {
			return {
				x: _height,
				y: _width
			}
		}

		this.tile = function(pos) {
			if (_grid[pos[0]] && _grid[pos[0]][pos[1]]) {
				return _grid[pos[0]][pos[1]];
			}
		}

		function _fill(tile) {
			for (var x = 0; x < _height; x++) {
				_grid[x] = _grid[x] || [];
				for (var y = 0; y < _width; y++) {
					_grid[x][y] = tile;
				}
			}
		}

		function _initializeRooms() {
			_fill(bank.get('rock'));
			for (var x = 0; x < 10000 && _floorspace < _totalfloorspace; x++) {
				if (x > 0 && x % 500 === 0) {
					log.low('[DUNGEON:' + _guid + ']', x, 'room runs');
				}
				_floorspace += _makeRoom();
			}

			log.med('[DUNGEON:' + _guid + ']', _doors.length,
				'rooms in', x, 'attemps covering', _totalfloorspace,
				'of', _surface, 'surface area');
		}

		function _connectDoors() {
			log.med('[DUNGEON:' + _guid + ']', 'connecting rooms');

			for (var x = 0; x < _doors.length - 1; x++) {
				var d1 = _doors[x][0];
				var d2 = _doors[x + 1][1];
				//console.log(d1, d2);
				_grid[d1[0]][d1[1]] = bank.get('door');
				_grid[d2[0]][d2[1]] = bank.get('door');
				var result = AStar.search(clone(_grid), d1, d2);
				for (var r in result) {
					if (result.hasOwnProperty(r)) {
						_grid[result[r].x][result[r].y] = bank.get('road');
					}
				}
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

			for (var x = sh; x < h + sh; x++) {
				for (var y = sw; y < w + sw; y++) {
					if (grid[x][y].diggable === true) {
						if (x === sh || x === sh + h - 1 || y === sw || y === sw + w - 1) {
							grid[x][y] = bank.get('wall');
							if (x === sh && y === sw ||
								x === sh && y === sw + w - 1 ||
								x === sh + h - 1 && y === sw ||
								x === sh + h - 1 && y === sw + w - 1) {
								//this is a corner
							} else {
								walls.push([x, y]);
							}
						} else {
							grid[x][y] = bank.get('floor');
						}
					} else {
						return 0;
					}
				}
			}

			//log.low('  room success!')
			doors.push(walls[random(0, walls.length - 1)]);
			doors.push(walls[random(0, walls.length - 1)]);
			//console.log(_doors);
			_doors.push(doors);
			_grid = grid;
			return w * h;
		}
	}

	return Dungeon;

	function clone(array) {
		var newObj = (array instanceof Array) ? [] : {};
		for (var i in array) {
			if (array.hasOwnProperty(i)) {
				if (i === 'clone') {
					continue;
				}
				if (array[i] && typeof array[i] === "object") {
					newObj[i] = clone(array[i]);
				} else {
					newObj[i] = array[i];
				}
			}
		}
		return newObj;
	}
});