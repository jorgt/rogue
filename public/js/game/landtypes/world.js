define([
	"helpers/log",
	"settings",
	"game/landtypes/worlds/climate",
	"libs/simplex",
	"helpers/grids",
	"game/landtypes/base",
], function(
	log,
	settings,
	climate,
	Simplex,
	Grids,
	Base) {

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
		log.med('[WORLD]', 'start building the overworld');
		var _size = opt.size || uneven(random(60, 70));
		var _width = opt.width || _size;
		var _height = opt.height || _size;
		var _grid = [];
		var _start = null;
		var _end = null;
		var _cities = [];
		var _gAltRadial = _rollingParticles();
		var _gTemAxial = _axialParticles();

		var _gAlt = _edges(_chunk(sAlt, ranges.altitude, _height, _width, 0, 0, _gAltRadial));
		log.low('[WORLD]', 'first range of altitude done');

		var _gAlt2 = _edges(_chunk(sAlt2, ranges.altitude, _height, _width, 0, 0));
		log.low('[WORLD]', 'second range of altitude done');

		var _gTem = _chunk(sTem, ranges.temperature, _height, _width, 0, 0, _gTemAxial);
		log.low('[WORLD]', 'temperature done');

		var _gDir = _directionalParticles(_gAlt, _gTem);
		var _gPre = _chunk(sPre, _randomize(ranges.precipitation), _height, _width, 0, 0, _gDir);
		log.low('[WORLD]', 'precipitation done');

		var aa = 0,
			ap = 0,
			at = 0,
			x = 0,
			y = 0;

		for (x = 0; x < _width; x++) {
			_grid[x] = [];
			for (y = 0; y < _height; y++) {
				var c = {
					temp: ~~(_gTem[x][y] * 1.8) + 5,
					prec: ~~(Math.pow(_gPre[x][y], 1.1)),
					alt: ~~(2000 + _gAlt[x][y] + _gAlt2[x][y])
				}
				c.climate = climate(c.temp, c.prec, c.alt);
				var obj = opt.bank.get(c.climate.replace(/\s/g, ''));

				obj.info.climate = c;
				_grid[x][y] = obj;
			}
		}
		//normalize the colors
		var cols = {
			total: {
				min: Number.MAX_VALUE,
				max: Number.MIN_VALUE
			}
		};

		for (x = 0; x < _width; x++) {
			for (y = 0; y < _height; y++) {
				var t = _grid[x][y];
				if (!cols[t.name]) {
					cols[t.name] = {
						min: Number.MAX_VALUE,
						max: Number.MIN_VALUE
					}
				}
				if (t.info.climate.alt < cols[t.name].min) cols[t.name].min = t.info.climate.alt;
				if (t.info.climate.alt > cols[t.name].max) cols[t.name].max = t.info.climate.alt;
				if (t.info.climate.alt < cols.total.min) cols.total.min = t.info.climate.alt;
				if (t.info.climate.alt > cols.total.max) cols.total.max = t.info.climate.alt;
			}
		}

		for (x = 0; x < _width; x++) {
			for (y = 0; y < _height; y++) {
				var t = _grid[x][y];
				var c = cols[t.name];
				t.info.alt = (t.info.climate.alt - c.min) / (c.max - c.min);
				t.info.tot = (t.info.climate.alt - cols.total.min) / (cols.total.max - cols.total.min);
			}
		}

		_getStartAndEndTiles();
		_getCitiesAndTowns();

		return new Base(_grid, _start, _end, _height, _width);

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
				var sy = random(0, _grid[0].length - 1);
				var ex = random(0, _grid.length - 1);
				var ey = random(0, _grid[0].length - 1);
				start = _grid[sx][sy];
				end = _grid[ex][ey];
				_start = (start.walkable === true) ? [sx, sy] : null;
				_end = (end.walkable === true) ? [ex, ey] : null;
			}
		}

		function _getCitiesAndTowns() {
			log.med('[WORLD]', 'creating cities and towns');
			var x, y;
			var city = Math.random() > 0.7; // ratio towns/cities 7:3
			var totalCities = 0;
			var totalTowns = 0;
			while (_cities.length < 5) {
				_createCity((city) ? 1 : random(5, 9));
			}

		}

		function _createCity(n) {
			var x, y, r, g = [],
				r = [-1, 0, 1];

			x = random(0, _grid.length - 1);
			y = random(0, _grid[0].length - 1);
			for (var a = 0; a < r.length; a++) {
				for (var b = 0; b < r.length; b++) {
					if (x + r[a] < _grid.length && x + r[a] >= 0 && y + r[b] < _grid[0].length && y + r[b] >= 0) {
						if (_grid[x + r[a]][y + r[b]].info.climate.alt < 0) return 0;
						g.push([x + r[a], y + r[b]]);
					} else {
						return 0;
					}
				}
			}

			g = shuffle(g).slice(0, n);

			for (var c = 0; c < g.length; c++) {
				var tile = _grid[g[c][0]][g[c][1]];
				var climate = tile.info.climate;
				tile.subtile = opt.bank.get('city');
				tile.subtile.info.climate = climate;
				tile.sign = tile.subtile.sign;
				tile.name = tile.subtile.name;
			}

			_cities.push([x, y]);

			log.low('[WORLD]', 'created a city at', x, y);

			return 1;
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

				return shuffle(result);
			};
		}


		function _normalize(grid, copy) {
			var max = Number.MIN_VALUE;
			var min = Number.MAX_VALUE;
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