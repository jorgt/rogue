define([
	"helpers/log",
	"settings",
	"game/landtypes/worlds/climate",
	"libs/simplex",
	"game/tilebank",
	"helpers/grids"
], function(
	log,
	settings,
	climate,
	Simplex,
	bank,
	Grids) {

	'use strict';

	var ranges = {
		altitude: {
			min: -9000, //-10000,
			max: 9000
		},
		precipitation: {
			min: 50,
			max: 16000
		},
		temperature: {
			min: -25,
			max: 50
		}
	}
	var chunk = 50;

	var sAlt = new Simplex({
		octaves: 20,
		persistence: 0.2,
		level: 0.0065
	});

	var sAlt2 = new Simplex({
		octaves: 20,
		persistence: 0.4,
		level: 0.0095
	});

	var sAlt3 = new Simplex({
		octaves: 20,
		persistence: 0.7,
		level: 0.0155
	});

	var sPre = new Simplex({
		octaves: 20,
		persistence: 0.2,
		level: 0.0085
	});

	var sTem = new Simplex({
		octaves: 20,
		persistence: 0.4,
		level: 0.0075
	});

	return function world(opt) {
		var _size = opt.size || uneven(random(60, 70));
		var _width = opt.width || _size;
		var _height = opt.height || _size;
		var _grid = [];
		var _start = null;
		var _end = null;
		var gAltRadial = _rollingParticles();
		var gTemAxial = _axialParticles();

		var gAlt = _edges(_chunk(sAlt, ranges.altitude, _height, _width, 0, 0, gAltRadial));
		log.low('[WORLD]', 'first range of altitude done');

		var gAlt2 = _edges(_chunk(sAlt2, ranges.altitude, _height, _width, 0, 0));
		log.low('[WORLD]', 'second range of altitude done');
		//var gAlt3 = _edges(_chunk(sAlt3, ranges.altitude, _height, _width, 0, 0));
		//log.low('[WORLD]', 'first range of altitude done');
		var gTem = _chunk(sTem, ranges.temperature, _height, _width, 0, 0, gTemAxial);
		log.low('[WORLD]', 'temperature done');

		var gDir = _directionalParticles(gAlt, gTem);
		var gPre = _chunk(sPre, _randomize(ranges.precipitation), _height, _width, 0, 0, gDir);
		log.low('[WORLD]', 'precipitation done');

		var aa = 0,
			ap = 0,
			at = 0;

		for (var x = 0; x < _width; x++) {
			_grid[x] = [];
			for (var y = 0; y < _height; y++) {
				var c = {
					temp: ~~(gTem[x][y] * 1.8) + 5,
					prec: ~~(Math.pow(gPre[x][y], 1.1)),
					alt: ~~(2000 + gAlt[x][y] + gAlt2[x][y])
				}
				c.climate = climate(c.temp, c.prec, c.alt);
				var obj = bank.get(c.climate.replace(/\s/g, ''));
				obj.info.climate = c;
				_grid[x][y] = obj;
			}
		}

		_getStartAndEndTiles();

		return new WorldObject(_grid, _start, _end, _height, _width);

		function WorldObject(g, s, e, h, w) {
			this.grid = g;
			this.start = s;
			this.end = e;
			this.height = h;
			this.width = w;
			this.canWalk = function(x, y) {
				return this.grid[x][y].walkable;
			};
			this.getTile = function(x, y) {
				return this.grid[x][y];
			};
		}

		function _chunk(noise, range, h, w, startx, starty, merge) {
			var generator = Grids({
				type: Grids.tileable,
				h: h,
				w: w,
				noise: noise.noise,
				scale: noise.level,
				repeats: 0
			});

			var grid = generator.grid();
			var world = [];

			for (var x = 0; x < grid.length; x++) {
				world[x] = [];
				for (var y = 0; y < grid[x].length; y++) {
					var m = (merge instanceof Array) ? merge[x][y] : 1;
					world[x][y] = Math.floor(_range(range, grid[x][y] * m));
				}
			}
			return world;
		}

		function _randomize(range, variation) {
			return {
				min: ~~(range.min * (Math.random() * 0.4 + 0.8)),
				max: ~~(range.max * (Math.random() * 0.4 + 0.8))
			}
		}

		function _range(range, n) {
			return (range.max - range.min) * n + range.min;
		}

		function _getStartAndEndTiles() {
			log.med('[WORLD]', 'getting start- and end tiles');
			var start = null;
			var end = null;
			while (_start === null || _end === null) {
				var sx = random(0, _grid.length - 1);
				var sy = random(0, _grid[0].length - 1)
				var ex = random(0, _grid.length - 1);
				var ey = random(0, _grid[0].length - 1)
				start = _grid[sx][sy];
				end = _grid[ex][ey];
				_start = (start.walkable === true) ? [sx, sy] : null;
				_end = (end.walkable === true) ? [ex, ey] : null;
			}
		}

		function _axialParticles() {
			var grid = [];
			for (var x = 0; x < _width; x++) {
				grid[x] = [];
				for (var y = 0; y < _height; y++) {
					var n = 1 - (Math.abs(_height / 2 - y) / (_height));
					grid[x][y] = n;
				}
			}
			return grid;
		}

		function _directionalParticles(h, t) {
			var dir = ((2 * Math.PI) / 360 * (Math.random() * 360));
			h = _normalize(h, true);
			t = _normalize(t, true);
			var grid = [];
			for (var x = 0; x < _width; x++) {
				grid[x] = [];
				for (var y = 0; y < _height; y++) {
					var n1 = point(x, y, 2, dir);
					var x1 = (n1.x >= 0 && n1.y >= 0 && n1.x < _width && n1.y < _height) ? h[n1.x][n1.y] : 0;

					var x3 = h[x][y];

					grid[x][y] = (x1 <= x3) ? (x3 - x1) + t[x][y] : t[x][y] / 2;
				}
			}

			//return h;
			return _normalize(grid);

			function point(x, y, length, rad) {
				return {
					x: ~~(x + (length * Math.sin(rad))),
					y: ~~(y + (length * Math.cos(rad)))
				}
			}
		}

		function _rollingParticles() {
			var grid = [];
			var _its = 10000;
			var _life = 40;
			var _edgex = _width * 0.15;
			var _edgey = _height * 0.15;
			var _blur1 = 0.35;
			var _blur2 = 0.20;

			for (var x = 0; x < _width; x++) {
				grid[x] = [];
				for (var y = 0; y < _height; y++) {
					grid[x][y] = 0;
				}
			}

			for (var i = 0; i < _its; i++) {
				var x = ~~(Math.random() * (_width - (_edgex * 2)) + _edgex);
				var y = ~~(Math.random() * (_height - (_edgey * 2)) + _edgey);

				for (var j = 0; j < _life; j++) {
					x += Math.round(Math.random() * 2 - 1);
					y += Math.round(Math.random() * 2 - 1);

					if (x < 1 || x > _width - 2 || y < 1 || y > _height - 2) continue;

					var hood = _next(x, y);

					for (var k = 0; k < hood.length; k++) {
						if (grid[hood[k][0]][hood[k][1]] < grid[x][y]) {
							x = hood[k][0];
							y = hood[k][1];
							continue;
						}
					}

					grid[x][y]++;
				}
			}

			return _normalize(grid);

			function _range(min, max) {
				return ~~((max - min) * Math.random() + min);
			}

			function _next(x, y) {
				var result = [];

				for (var a = -1; a <= 1; a++) {
					for (var b = -1; b <= 1; b++) {
						if (a || b && (x + a >= 0 && x + a < _width && y + b >= 0 && y + b < _height)) {
							result.push([x + a, y + b]);
						}
					}
				}

				return _shuffle(result);
			};

			function _shuffle(o) { //v1.0
				for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
				return o;
			};
		}


		function _normalize(grid, copy) {
			var max = 0;
			var min = 10000000;
			for (var x = 0; x < grid.length; x++) {
				for (var y = 0; y < grid[0].length; y++) {
					var g = grid[x][y];
					if (g > max) max = g;
					if (g < min) min = g;
				}
			}

			var ret = [];
			for (var x = 0; x < grid.length; x++) {
				ret[x] = [];
				for (var y = 0; y < grid[0].length; y++) {
					if (copy) {
						ret[x][y] = (grid[x][y] - min) / (max - min);
					} else {
						grid[x][y] = (grid[x][y] - min) / (max - min);
					}

				}
			}
			return (copy) ? ret : grid;
		}

		function _edges(grid) {
			for (var x = 0; x < grid.length; x++) {
				for (var y = 0; y < grid[x].length; y++) {
					if (x == 0 || x == _width - 1 || y == 0 || y == _height - 1) {
						grid[x][y] *= (grid[x][y] > 0) ? 0.67 : 1;
					} else if (x == 1 || x == _width - 2 || y == 1 || y == _height - 2) {
						grid[x][y] *= (grid[x][y] > 0) ? 0.75 : 1;
					}
				}
			}
			return grid;
		}
	}

});