define([
	"helpers/log",
	"settings",
	"game/landtypes/worlds/climate",
	"libs/simplex",
	"helpers/grids",
	"game/landtypes/base",
	"game/pathfinding/astar",
	'game/landtypes/worlds/town',
	'game/landtypes/worlds/road',
	"helpers/maths"
], function(
	log,
	settings,
	climate,
	Simplex,
	Grids,
	Base,
	AStar,
	townFactory,
	roadFactory) {

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
			this._reSignRivers();
			this._getStartAndEndTiles();
		},
		update: function() {
			var nt = townFactory().numberOfTownsAndCities();
			var rt = roadFactory().numberOfRoads();

			/*
				road animations. every 10 in-game days, this checks if 
				there is a road to update. if there is, animate building that road
			 */
			if (rt < (rt * (rt + 1)) / 2) {
				this._time().timer('addroadtimer', {
					d: 10
				}, function() {
					var t1 = townFactory().getRandom();
					var t2 = townFactory().getClosestNotConnected(t1);
					if (t1 && t2) {
						var road = roadFactory().road(this, this._bank, [t1.x, t1.y], [t2.x, t2.y], this._time());
						t1.connectTo(t2);
					} 
				}.bind(this));
			}

			/*
				every 30 in-game days, this upgrade a city to a town
			 */
			this._time().timer('addcitytimer', {
				d: 30
			}, function() {
				townFactory().upgradeRandomTownToCity(this);
			}.bind(this));
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
			log.med('[WORLD]', 'creating cities and towns');
			var x, y;
			var attempts = 0;
			var numberOfCities = Math.ceil((this.height * this.width) / (150 * Math.pow((this.height * this.width), 0.15)));

			while (townFactory().numberOfTownsAndCities() < numberOfCities && attempts++ < 5000) {
				townFactory().town(this, this._bank)
			}
			log.med('[WORLD]', 'created', townFactory().numberOfTownsAndCities(), 'cities and towns');

			log.med('[WORLD]', 'connecting towns, creating roads');

			attempts = 0;

			while (roadFactory().numberOfRoads() < numberOfCities * 0.4 && attempts++ < 10000) {
				var t1 = townFactory().getRandom();
				var t2 = townFactory().getClosestNotConnected(t1);
				var road = roadFactory().road(this, this._bank, [t1.x, t1.y], [t2.x, t2.y]);
				t1.connectTo(t2);
			}

			log.med('[WORLD]', 'created', roadFactory().numberOfRoads(), 'roads');
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