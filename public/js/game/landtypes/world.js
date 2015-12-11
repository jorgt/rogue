define([
	"helpers/log",
	"settings",
	"game/landtypes/worlds/climate",
	"libs/simplex",
	"helpers/grids",
	"game/landtypes/base",
	"game/pathfinding/astar",
	'game/landtypes/worlds/town',
	"helpers/maths"
], function(
	log,
	settings,
	climate,
	Simplex,
	Grids,
	Base,
	AStar,
	townFactory) {

	'use strict';

	var World = Base.extend({
		grid: [],
		width: 0,
		height: 0,
		start: null,
		end: null,
		cities: [],
		roads: {},
		rivers: [],
		_bank: null,
		init: function(opt) {
			this.width = opt.width;
			this.height = opt.height;
			this._bank = opt.bank;
			this._time = opt.time;

			this._createBase();
			this._normalizeAltitude();
			this._createRivers();
			this._createCities();
			this._createRoadsBetweenCities();
			this._reSignRivers();
			this._getStartAndEndTiles();
		},
		update: function() {
			var t = this.getTile(20, 20);
			t.sign = ['1', '2', '3'][~~(Math.random() * 3)];

			this.changeTile(t);
			if (Object.keys(this.roads).length < this.cities.length * 2) {
				this._time().timer('addroadtimer', {
					h: 5
				}, function() {
					var road = this.createOneRoad();
					var id = ~~(Math.random() * 10000000);

					if (road.length > 0) {
						log.med('[WORLD]', 'Adding a new road with length', road.length);
						this._time().interval(id, road.length, {
							m: 30
						}, function(times) {
							var x = road[times - 1].x;
							var y = road[times - 1].y;
							this._addRoadTile(x, y, 'path');
							this._reSignFromArray([road[times - 1].tile], /path/, ['─', '│', '┼', '┤', '├', '┴', '┬', '┌', '┐', '└', '┘'], function(n, g) {
								if (g.name === 'ferry' || g.name === 'city') return g.sign;
							});

							this.changeTile(road[times - 1].tile);
							if (road.length === times) log.med('[WORLD]', 'Road of length', road.length, 'done');
						}.bind(this));
					}
				}.bind(this));
			}

		},
		_getStartAndEndTiles: function() {
			log.med('[WORLD]', 'getting start- and end tiles');

			while (this.start === null || this.end === null) {
				var sx = Math.between(0, this.grid.length - 1);
				var sy = Math.between(0, this.grid[0].length - 1);
				var ex = Math.between(0, this.grid.length - 1);
				var ey = Math.between(0, this.grid[0].length - 1);

				this.start = (this.grid[sx][sy].walkable === true) ? [sx, sy] : null;
				this.end = (this.grid[ex][ey].walkable === true) ? [ex, ey] : null;
			}
		},
		_createBase: function() {
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

			var _gAltRadial = this._rollingParticles();
			var _gTemAxial = this._axialParticles();

			var _gAlt = this._chunk(sAlt, ranges.altitude, this.height, this.width, 0, 0, _gAltRadial, true);
			log.low('[WORLD]', 'first range of altitude done');

			var _gAlt2 = this._chunk(sAlt2, ranges.altitude, this.height, this.width, 0, 0, null, true);
			log.low('[WORLD]', 'second range of altitude done');

			var _gTem = this._chunk(sTem, ranges.temperature, this.height, this.width, 0, 0, _gTemAxial);
			log.low('[WORLD]', 'temperature done');

			var _gDir = this._directionalParticles(_gAlt, _gTem);
			var _gPre = this._chunk(sPre, this._randomize(ranges.precipitation), this.height, this.width, 0, 0, _gDir);
			log.low('[WORLD]', 'precipitation done');

			var aa = 0,
				ap = 0,
				at = 0,
				x = 0,
				y = 0;

			//combine everything into base
			for (x = 0; x < this.width; x++) {
				this.grid[x] = [];
				for (y = 0; y < this.height; y++) {
					var c = {
						temp: ~~(_gTem[x][y] * 1.8) + 5,
						prec: ~~(Math.pow(_gPre[x][y], 1.1)),
						alt: ~~(2000 + _gAlt[x][y] + _gAlt2[x][y])
					}
					c.climate = climate(c.temp, c.prec, c.alt);
					var obj = this._bank.get(c.climate.replace(/\s/g, ''), x, y);
					obj.info.climate = c;
					if (obj.name === 'ice') obj.info.climate.alt = Math.abs(obj.info.climate.alt);
					this.grid[x][y] = obj;
				}
			}
		},

		_randomize: function(range, variation) {
			return {
				min: ~~(range.min * (Math.random() * 0.4 + 0.8)),
				max: ~~(range.max * (Math.random() * 0.4 + 0.8))
			}
		},

		_normalizeAltitude: function() {
			var x, y;

			//normalize the colors
			var cols = {
				total: {
					min: Number.MAX_VALUE,
					max: Number.MIN_VALUE
				}
			};

			//first determine minimum and maximum
			for (x = 0; x < this.width; x++) {
				for (y = 0; y < this.height; y++) {
					var t = this.grid[x][y];
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

			for (x = 0; x < this.width; x++) {
				for (y = 0; y < this.height; y++) {
					var t = this.grid[x][y];
					var c = cols[t.name];
					t.info.alt = (t.info.climate.alt - c.min) / (c.max - c.min);
					t.info.tot = (t.info.climate.alt - cols.total.min) / (cols.total.max - cols.total.min);
				}
			}
		},

		_chunk: function(noise, range, h, w, startx, starty, merge, edges) {
			var generator = Grids({
				type: Grids.tileable,
				h: h,
				w: w,
				noise: noise.noise,
				scale: noise.level,
				repeats: 0
			});

			var grid = generator.grid();
			if (edges) this._edges(grid);
			var world = [];

			for (var x = 0; x < grid.length; x++) {
				world[x] = [];
				for (var y = 0; y < grid[x].length; y++) {
					var m = (merge instanceof Array) ? merge[x][y] : 1;
					world[x][y] = Math.floor(this._range(range, grid[x][y] * m));
				}
			}
			return world;
		},

		_range: function(range, n) {
			return (range.max - range.min) * n + range.min;
		},

		_createCities: function() {
			townFactory().town(this.grid);
			log.med('[WORLD]', 'creating cities and towns');
			var x, y;
			var attempts = 0;
			while (this.cities.length < 15 && attempts++ < 5000) {
				this._createCity('town');
			}
			log.med('[WORLD]', 'created', this.cities.length, 'cities and towns');
		},

		_createCity: function(type) {
			var c, d, x, y, r, g = [];

			//get a Math.between tile with starting point as a multiple of some number
			//to prevent cities from being built next to each other
			x = Math.between(0, this.grid.length - 1);
			y = Math.between(0, this.grid[0].length - 1);

			//check if another city exists in an 11 cell block around x and y. 
			//exit function if it exists
			if (this._scanGrid(x, y, 11, function(tile) {
					return (tile.name === 'city' || tile.subtile === 'city');
				})) {
				return false;
			}

			if (this._scanGrid(x, y, 1, function(tile, a, b) {
					if (tile.info.climate.alt > 0) {
						g.push([a, b])
					} else {
						return true;
					}
				})) {
				return false;
			}

			g = shuffle(g).slice(0, 1);

			for (var c = 0; c < g.length; c++) {
				this.grid[g[c][0]][g[c][1]].sub(this._bank.get('city', g[c][0], g[c][1]), ['name', 'color', 'sign']);
			}

			this.cities.push([x, y]);

			log.low('[WORLD]', 'created a city at', x, y);

			return true;
		},
		_createRivers: function() {
			log.med('[WORLD]', 'creating rivers');
			var attempts = 0;

			while (this.rivers.length < Math.between(5, 7) && attempts++ < 5000) {
				this._createRiver();
			}

			log.med('[WORLD]', 'created', this.rivers.length, 'rivers');
		},
		_createRiver: function() {
			var a, b, x, y, i, next,
				g = [],
				life = 100;

			x = Math.between(0, this.grid.length - 1);
			y = Math.between(0, this.grid[x].length - 1);

			if (this.grid[x][y].info.climate.alt < 4000 && this.grid[x][y].info.climate.prec > 10000) return false;

			a = Math.between(0, this.grid.length - 1);
			b = Math.between(0, this.grid[x].length - 1);

			if (this.grid[a][b].info.climate.alt > 0) return false;

			var g = AStar.search(this.grid, [x, y], [a, b], false, null, function(tile) {
				return (tile.name === 'river') ? 0 : Math.pow(100, tile.info.tot);
			});

			var tot;
			for (i = 0; i < g.length; i++) {
				if (!this.grid[g[i].x][g[i].y].name.match(/sea$/)) {
					tot++;
					break;
				}
			}

			if (tot < 30) return false;

			for (i = 0; i < g.length; i++) {
				if (!this.grid[g[i].x][g[i].y].name.match(/sea$/)) {
					this.grid[g[i].x][g[i].y].sub(this._bank.get('river', g[i].x, g[i].y), ['name', 'sign']);
				}
			}

			this.rivers.push([x, y]);
		},
		_scanGrid: function(centerx, centery, cells, func) {
			var x, y, sx, sy, ex, ey;

			sx = Math.max(0, centerx - cells);
			sy = Math.max(0, centery - cells);
			ex = Math.min(this.grid.length - 1, centerx + cells);
			ey = Math.min(this.grid[0].length - 1, centery + cells);
			for (x = sx; x <= ex; x++) {
				for (y = sy; y <= ey; y++) {
					if (func(this.grid[x][y], x, y) === true) return true;
				}
			}
			return false;
		},
		_createRoadsBetweenCities: function() {
			log.med('[WORLD]', 'connecting cities and roads');

			this.createThisManyRoads(this.cities.length * 0.4, 'path');
			log.med('[WORLD]', 'total roads created:', Object.keys(this.roads).length / 2);
		},
		createOneRoad: function() {
			var city1, city2, result = false,
				attemps = 0;

			while (result === false && Object.keys(this.roads).length < this.cities.length * 2 && attemps++ < 200) {
				var x = window.Math.between(0, this.cities.length - 1);
				var y = window.Math.between(0, this.cities.length - 1);

				if ((typeof this.roads[x + '.' + y] !== 'undefined' || typeof this.roads[y + '.' + x] !== 'undefined') || x === y) {
					continue;
				} else {
					result = this.createARoad(x, y, 'path', false);
					if (result !== false) {
						this.roads[x + '.' + y] = {
							type: 'path',
							tiles: result
						}
						this.roads[x + '.' + y] = {
							type: 'path',
							tiles: result
						};
					}
				}
			}

			return result;

		},
		createThisManyRoads: function(a, type) {
			var attempts, x, y;
			type = type || 'path'
			attempts = 0;

			while (Object.keys(this.roads).length / 2 < a && attempts++ < 1000) {
				x = window.Math.between(0, this.cities.length - 1);
				y = window.Math.between(0, this.cities.length - 1);

				if ((typeof this.roads[x + '.' + y] !== 'undefined' || typeof this.roads[y + '.' + x] !== 'undefined') || x === y) {
					continue;
				} else {
					var result = this.createARoad(x, y, type, true);
					if (result !== false) {
						this.roads[x + '.' + y] = {
							type: 'path',
							tiles: result
						};
						this.roads[y + '.' + x] = {
							type: 'path',
							tiles: result
						};
					}
				}
			}
		},
		getRoadResultSet: function(city1, city2) {
			return AStar.search(this.grid, this.cities[city1], this.cities[city2]);
		},
		createARoad: function(city1, city2, type, create) {
			var result, path;


			result = this.getRoadResultSet(city1, city2);
			if (create === true, result.length > 0) {
				for (var r = 0; r < result.length; r++) {
					this._addRoadTile(result[r].x, result[r].y, type)
				}
				log.low('[WORLD]', 'connected 2 cities:', this.cities[city1], this.cities[city2]);

				if (type === 'path') {
					this._reSignFromArray(result, /path/, ['─', '│', '┼', '┤', '├', '┴', '┬', '┌', '┐', '└', '┘'], function(n, g) {
						if (g.name === 'ferry' || g.name === 'city') return g.sign;
					});
				} else {
					this._reSignFromArray(result, /ferry|highway|path/, ['═', '║', '╬', '╣', '╠', '╩', '╦', '╔', '╗', '╚', '╝'], function(n, g) {
						if (g.name === 'ferry' || g.name === 'city') return g.sign;
					});
				}

				return result;
			} else if (result.length > 0 && create === false) {
				return result;
			}
			return false;
		},
		_addRoadTile: function(x, y, type) {
			var tile = (this.grid[x][y].name.match(/sea$/)) ? 'ferry' : type;

			if (!this.grid[x][y].name.match(/city|highway|ferry/)) {
				this.grid[x][y].sub(this._bank.get(tile, x, y), ['name', 'sign', 'cost']);
			}
		},
		_reSignFromArray: function(array, h, chars, func) {
			var x, y, a, r;

			for (a = 0; a < array.length; a++) {
				x = array[a].x
				y = array[a].y;
				var n = this._neighbours(x, y);
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

				r = (func) ? func(n, this.grid[x][y]) : null;
				s = (r) ? r : s;

				this.grid[x][y].sign = s || this.grid[x][y].sign;
				if (this.grid[x][y].subtile.sign) this.grid[x][y].subtile.sign = s;
			}
		},
		_reSignRoads: function() {
			log.med('[WORLD]', 'fixing road signs');
			this._reSignSomething(/ferry|highway|path/, ['═', '║', '╬', '╣', '╠', '╩', '╦', '╔', '╗', '╚', '╝'], function(n, g) {
				if (g.name === 'ferry') return g.sign;
			});

			this._reSignSomething(/path/, ['─', '│', '┼', '┤', '├', '┴', '┬', '┌', '┐', '└', '┘'], function(n, g) {
				if (g.name === 'ferry') return g.sign;
			});
		},
		_reSignRivers: function() {
			log.med('[WORLD]', 'fixing river signs');
			this._reSignSomething(/river/, ['─', '│', '┼', '┤', '├', '┴', '┬', '┌', '┐', '└', '┘']);
		},
		_reSignSomething: function(h, chars, func) {
			var r;
			for (var x = 0; x < this.grid.length; x++) {
				for (var y = 0; y < this.grid[x].length; y++) {
					if (this.grid[x][y].name.match(h) || (this.grid[x][y].subtile.name && this.grid[x][y].subtile.name.match(h))) {
						var n = this._neighbours(x, y);
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

						r = (func) ? func(n, this.grid[x][y]) : null;
						s = (r) ? r : s;

						this.grid[x][y].sign = s || this.grid[x][y].sign;
						if (this.grid[x][y].subtile.sign) this.grid[x][y].subtile.sign = s;
					}
				}
			}
		},
		_neighbours: function(x, y) {
			var ret = [];
			var dir = [
				[0, -1], //south
				[-1, 0], //west
				[0, 1], //north
				[1, 0], //east
			];

			for (var d = 0; d < dir.length; d++) {
				if (this.grid[x + dir[d][0]] && this.grid[x + dir[d][0]][y + dir[d][1]]) {
					ret.push(this.grid[x + dir[d][0]][y + dir[d][1]]);
				} else {
					ret.push({
						name: 'unknown'
					});
				}
			}

			return ret;
		},
		_axialParticles: function() {
			var grid = [];
			for (var x = 0; x < this.width; x++) {
				grid[x] = [];
				for (var y = 0; y < this.height; y++) {
					var n = 1 - (Math.abs(this.height / 2 - y) / (this.height));
					grid[x][y] = n;
				}
			}
			return grid;
		},
		_directionalParticles: function(h, t) {
			var dir = ((2 * Math.PI) / 360 * (Math.random() * 360));
			h = this._normalize(h, true);
			t = this._normalize(t, true);
			var grid = [];
			for (var x = 0; x < this.width; x++) {
				grid[x] = [];
				for (var y = 0; y < this.height; y++) {
					var n1 = point(x, y, 2, dir);
					var x1 = (n1.x >= 0 && n1.y >= 0 && n1.x < this.width && n1.y < this.height) ? h[n1.x][n1.y] : 0;

					var x3 = h[x][y];

					grid[x][y] = (x1 <= x3) ? (x3 - x1) + t[x][y] : t[x][y] / 2;
				}
			}

			//return h;
			return this._normalize(grid);

			function point(x, y, length, rad) {
				return {
					x: ~~(x + (length * Math.sin(rad))),
					y: ~~(y + (length * Math.cos(rad)))
				}
			}
		},
		_rollingParticles: function() {
			var _grid = [];
			var _its = 10000;
			var _life = 40;
			var _edgex = this.width * 0.15;
			var _edgey = this.height * 0.15;
			var _blur1 = 0.35;
			var _blur2 = 0.20;

			for (var x = 0; x < this.width; x++) {
				_grid[x] = [];
				for (var y = 0; y < this.height; y++) {
					_grid[x][y] = 0;
				}
			}

			for (var i = 0; i < _its; i++) {
				var x = ~~(Math.random() * (this.width - (_edgex * 2)) + _edgex);
				var y = ~~(Math.random() * (this.height - (_edgey * 2)) + _edgey);

				for (var j = 0; j < _life; j++) {
					x += Math.round(Math.random() * 2 - 1);
					y += Math.round(Math.random() * 2 - 1);

					if (x < 1 || x > this.width - 2 || y < 1 || y > this.height - 2) continue;

					var hood = _next(x, y, this.width, this.height);

					for (var k = 0; k < hood.length; k++) {
						if (_grid[hood[k][0]][hood[k][1]] < _grid[x][y]) {
							x = hood[k][0];
							y = hood[k][1];
							continue;
						}
					}

					_grid[x][y]++;
				}
			}

			return this._edges(this._normalize(_grid));

			function _range(min, max) {
				return ~~((max - min) * Math.random() + min);
			}

			function _next(x, y, width, height) {
				var result = [];

				for (var a = -1; a <= 1; a++) {
					for (var b = -1; b <= 1; b++) {
						if (a || b && (x + a >= 0 && x + a < width && y + b >= 0 && y + b < height)) {
							result.push([x + a, y + b]);
						}
					}
				}

				return shuffle(result);
			};
		},
		_normalize: function(grid, copy) {
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
		},
		_edges: function(grid) {
			for (var x = 0; x < grid.length; x++) {
				for (var y = 0; y < grid[x].length; y++) {
					if (x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1) {
						grid[x][y] *= (grid[x][y] > 0.5) ? 0.45 : 1;
					} else if (x == 1 || x == this.width - 2 || y == 1 || y == this.height - 2) {
						grid[x][y] *= (grid[x][y] > 0.4) ? 0.85 : 1;
					}
				}
			}
			return grid;

		}
	});

	return function world(opt) {
		log.med('[WORLD]', 'start building the overworld');
		opt.size = opt.size || Math.uneven(Math.between(60, 70));
		opt.width = opt.width || opt.size;
		opt.height = opt.height || opt.size;

		return new World(opt);
	}



});