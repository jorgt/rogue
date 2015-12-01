define([
	"helpers/log",
	"settings",
	"game/landtypes/worlds/climate",
	"libs/simplex",
	"helpers/grids",
	"game/landtypes/base",
	"game/pathfinding/astar",
	"helpers/maths"
], function(
	log,
	settings,
	climate,
	Simplex,
	Grids,
	Base,
	AStar) {

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
		persistence: 0.6,
		level: 0.0035
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
		var _size = opt.size || Math.uneven(Math.between(60, 70));
		var _width = opt.width || _size;
		var _height = opt.height || _size;
		var _grid = [];
		var _start = null;
		var _end = null;
		var _cities = [];
		var _rivers = [];

		_createBase();
		_normalizeAltitude();
		_createRivers();
		_createCities();
		_createRoadsBetweenCities();
		_reSignRivers();
		_reSignRoads();
		_getStartAndEndTiles();

		return new Base(_grid, _start, _end, _height, _width);

		function _createBase() {
			var _gAltRadial = _rollingParticles();
			var _gTemAxial = _axialParticles();

			var _gAlt = _chunk(sAlt, ranges.altitude, _height, _width, 0, 0, _gAltRadial, true);
			log.low('[WORLD]', 'first range of altitude done');

			var _gAlt2 = _chunk(sAlt2, ranges.altitude, _height, _width, 0, 0, null, true);
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

			//combine everything into base
			for (x = 0; x < _width; x++) {
				_grid[x] = [];
				for (y = 0; y < _height; y++) {
					var c = {
						temp: ~~(_gTem[x][y] * 1.8) + 5,
						prec: ~~(Math.pow(_gPre[x][y], 1.1)),
						alt: ~~(2000 + _gAlt[x][y] + _gAlt2[x][y])
					}
					c.climate = climate(c.temp, c.prec, c.alt);
					var obj = opt.bank.get(c.climate.replace(/\s/g, ''), x, y);
					obj.info.climate = c;
					if (obj.name === 'ice') obj.info.climate.alt = Math.abs(obj.info.climate.alt);
					_grid[x][y] = obj;
				}
			}
		}

		function _normalizeAltitude() {
			var x, y;

			//normalize the colors
			var cols = {
				total: {
					min: Number.MAX_VALUE,
					max: Number.MIN_VALUE
				}
			};

			//first determine minimum and maximum
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
		}

		function _chunk(noise, range, h, w, startx, starty, merge, edges) {
			var generator = Grids({
				type: Grids.tileable,
				h: h,
				w: w,
				noise: noise.noise,
				scale: noise.level,
				repeats: 0
			});

			var grid = generator.grid();
			if (edges) _edges(grid);
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
				var sx = Math.between(0, _grid.length - 1);
				var sy = Math.between(0, _grid[0].length - 1);
				var ex = Math.between(0, _grid.length - 1);
				var ey = Math.between(0, _grid[0].length - 1);
				start = _grid[sx][sy];
				end = _grid[ex][ey];
				_start = (start.walkable === true) ? [sx, sy] : null;
				_end = (end.walkable === true) ? [ex, ey] : null;
			}
		}

		function _createCities() {
			log.med('[WORLD]', 'creating cities and towns');
			var x, y;
			var city = Math.random() > 0.85; // ratio towns/cities 7:3
			var attempts = 0;
			while (_cities.length < 15 && attempts++ < 5000) {
				_createCity((city) ? 1 : Math.between(5, 9));
			}
			log.med('[WORLD]', 'created', _cities.length, 'cities and towns');
		}

		function _createCity(n) {
			var c, d, x, y, r, g = [];

			//get a Math.between tile with starting point as a multiple of some number
			//to prevent cities from being built next to each other
			x = Math.between(0, _grid.length - 1);
			y = Math.between(0, _grid[0].length - 1);

			//check if another city exists in an 11 cell block around x and y. 
			//exit function if it exists
			if (_scanGrid(x, y, 11, function(tile) {
					return (tile.name === 'city' || tile.subtile === 'city');
				})) {
				return false;
			}

			if (_scanGrid(x, y, 1, function(tile, a, b) {
					if (tile.info.climate.alt > 0) {
						g.push([a, b])
					} else {
						return true;
					}
				})) {
				return false;
			}

			g = shuffle(g).slice(0, n);

			for (var c = 0; c < g.length; c++) {
				_grid[g[c][0]][g[c][1]].sub(opt.bank.get('city', g[c][0], g[c][1]), ['name', ['sign']]);
			}

			_cities.push([x, y]);

			log.low('[WORLD]', 'created a city at', x, y);

			return true;
		}

		function _createRivers() {
			log.med('[WORLD]', 'creating rivers');
			var attempts = 0;

			while (_rivers.length < Math.between(5, 7) && attempts++ < 5000) {
				_createRiver();
			}

			log.med('[WORLD]', 'created', _rivers.length, 'rivers');
		}

		function _createRiver() {
			var a, b, x, y, i, next,
				g = [],
				life = 100;

			x = Math.between(0, _grid.length - 1);
			y = Math.between(0, _grid[x].length - 1);

			if (_grid[x][y].info.climate.alt < 4000 && _grid[x][y].info.climate.prec > 10000) return false;

			a = Math.between(0, _grid.length - 1);
			b = Math.between(0, _grid[x].length - 1);

			if (_grid[a][b].info.climate.alt > 0) return false;

			var g = AStar.search(_grid, [x, y], [a, b], false, null, function(tile) {
				return (tile.name === 'river') ? 0 : Math.pow(100, tile.info.tot);
			});

			var tot;
			for (i = 0; i < g.length; i++) {
				if (!_grid[g[i].x][g[i].y].name.match(/sea$/)) {
					tot++;
					break;
				}
			}

			if (tot < 30) return false;

			for (i = 0; i < g.length; i++) {
				if (!_grid[g[i].x][g[i].y].name.match(/sea$/)) {
					_grid[g[i].x][g[i].y].sub(opt.bank.get('river', g[i].x, g[i].y), ['name', 'sign']);
				}
			}

			_rivers.push([x, y]);
		}

		function _scanGrid(centerx, centery, cells, func) {
			var x, y, sx, sy, ex, ey;

			sx = Math.max(0, centerx - cells);
			sy = Math.max(0, centery - cells);
			ex = Math.min(_grid.length - 1, centerx + cells);
			ey = Math.min(_grid[0].length - 1, centery + cells);
			for (x = sx; x <= ex; x++) {
				for (y = sy; y <= ey; y++) {
					if (func(_grid[x][y], x, y) === true) return true;
				}
			}
			return false;
		}

		function _createRoadsBetweenCities() {
			log.med('[WORLD]', 'connecting cities and roads');
			var attempts, x, y, result, r, done = [],
				path;

			attempts = 0;

			while (done.length < _cities.length * 1.8 && attempts++ < 1000) {
				x = window.Math.between(0, _cities.length - 1);
				y = window.Math.between(0, _cities.length - 1);

				if (x === y || done.indexOf(x + '.' + y) >= 0 || done.indexOf(y + '.' + x) >= 0) {
					continue;
				} else {
					result = AStar.search(_grid, _cities[x], _cities[y]);
					if (result.length > 0) {
						path = (Math.random() < 0.8) ? 'path' : 'highway';

						for (var r = 0; r < result.length; r++) {
							var tile = (_grid[result[r].x][result[r].y].name.match(/sea$/)) ? 'ferry' : path;
							if (!_grid[result[r].x][result[r].y].name.match(/city|highway|ferry/)) {
								_grid[result[r].x][result[r].y].sub(opt.bank.get(tile, result[r].x, result[r].y), ['name', 'sign', 'cost']);
							}
						}

						done.push(x + '.' + y);

						log.low('[WORLD]', 'connected 2 cities:', _cities[x], _cities[y]);
					}
				}
			}

			log.med('[WORLD]', 'total roads created:', done.length);
		}

		function _reSignRoads() {
			log.med('[WORLD]', 'fixing road signs');
			_reSignSomething(/ferry|highway|path/, ['═', '║', '╬', '╣', '╠', '╩', '╦', '╔', '╗', '╚', '╝'], function(n, g) {
				if (g.name === 'ferry') return g.sign;
			});

			_reSignSomething(/path/, ['─', '│', '┼', '┤', '├', '┴', '┬', '╭', '╮', '╰', '╯'], function(n, g) {
				if (g.name === 'ferry') return g.sign;
			});
		}

		function _reSignRivers() {
			log.med('[WORLD]', 'fixing river signs');
			_reSignSomething(/river/, ['─', '│', '┼', '┤', '├', '┴', '┬', '╭', '╮', '╰', '╯']);
		}

		function _reSignSomething(h, chars, func) {
			var r;
			for (var x = 0; x < _grid.length; x++) {
				for (var y = 0; y < _grid[x].length; y++) {
					if (_grid[x][y].name.match(h) || (_grid[x][y].subtile.name && _grid[x][y].subtile.name.match(h))) {
						var n = _neighbours(x, y);
						var s = '·';

						if (n[0].name.match(h) && n[1].name.match(h) && n[2].name.match(h) && n[3].name.match(h)) {
							s = chars[2]
						} else if (n[0].name.match(h) && n[1].name.match(h) && n[2].name.match(h)) {
							s = chars[3];
						} else if (n[1].name.match(h) && n[2].name.match(h) && n[3].name.match(h)) {
							s = chars[6];
						} else if (n[2].name.match(h) && n[3].name.match(h) && n[0].name.match(h)) {
							s = chars[4]
						} else if (n[3].name.match(h) && n[0].name.match(h) && n[1].name.match(h)) {
							s = chars[5];
						} else if (n[0].name.match(h) && n[2].name.match(h)) {
							s = chars[1];
						} else if (n[1].name.match(h) && n[3].name.match(h)) {
							s = chars[0];
						} else if (n[0].name.match(h) && n[1].name.match(h)) {
							s = chars[10];
						} else if (n[1].name.match(h) && n[2].name.match(h)) {
							s = chars[8];
						} else if (n[2].name.match(h) && n[3].name.match(h)) {
							s = chars[7];
						} else if (n[3].name.match(h) && n[0].name.match(h)) {
							s = chars[9];
						} else if (!!n[1].name.match(h) || !!n[3].name.match(h)) {
							s = chars[0];
						} else if (!!n[0].name.match(h) || !!n[2].name.match(h)) {
							s = chars[1];
						}

						r = (func) ? func(n, _grid[x][y]) : null;
						s = (r) ? r : s;
						//if(_grid[x][y].name === 'ferry') console.log(_grid[x][y], _grid[x][y].sign, s, r);
						_grid[x][y].sign = s || _grid[x][y].sign;
						if (_grid[x][y].subtile.sign) _grid[x][y].subtile.sign = s;
					}
				}
			}
		}

		function _neighbours(x, y) {
			var ret = [];
			var dir = [
				[0, -1], //south
				[-1, 0], //west
				[0, 1], //north
				[1, 0], //east
			];

			for (var d = 0; d < dir.length; d++) {
				if (_grid[x + dir[d][0]] && _grid[x + dir[d][0]][y + dir[d][1]]) {
					ret.push(_grid[x + dir[d][0]][y + dir[d][1]]);
				} else {
					ret.push({
						name: 'unknown'
					});
				}
			}

			return ret;
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

			return _edges(_normalize(grid));

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
						grid[x][y] *= (grid[x][y] > 0.5) ? 0.45 : 1;
					} else if (x == 1 || x == _width - 2 || y == 1 || y == _height - 2) {
						grid[x][y] *= (grid[x][y] > 0.4) ? 0.85 : 1;
					}
				}
			}
			return grid;
		}
	}

});