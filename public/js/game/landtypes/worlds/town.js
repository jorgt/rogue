define([
	"helpers/log",
	"settings",
	"helpers/maths"
], function(log, settings) {

	var creator;

	var Town = Class.extend({
		type: null,
		connected: [],
		init: function(x, y, tiles, world, bank) {
			this.type = 'town';
			this.size = tiles.length;
			this.tiles = tiles;
			this.x = x;
			this.y = y;
			this.connected = [];
			this.bank = bank;
			this.world = world;

			for (var x = 0; x < this.tiles.length; x++) {
				var t = this.tiles[x];
				world.grid[t[0]][t[1]].sub(bank.get(this.type, t[0], t[1]), ['name', 'color', 'sign']);
			}
		},
		connectTo: function(town) {
			if (!this.isConnectedTo(town)) {
				this.connected.push(town);
				town.connectTo(this);
			}
		},
		isConnectedTo: function(town) {
			return this.connected.indexOf(town) >= 0;
		},
		numberOfConnections: function() {
			return this.connected.length;
		},
		upgrade: function(tiles) {
			if (this.type !== 'city') {
				this.type = 'city';
				this.tiles = tiles;

				log.med('[' + this.type.toUpperCase() + ']', 'upgrade town to city');
				for (var x = 0; x < tiles.length; x++) {
					var g = tiles[x];
					this.world.grid[g[0]][g[1]].sub(this.bank.get('city', g[0], g[1]), ['name', 'sign', 'cost']);
					this.world.changeTile(this.world.grid[g[0]][g[1]]);
				}
			}
		}
	});

	var City = Town.extend({
		init: function(tiles) {
			this._super.call(this, tiles);
			this.type = 'city';
		}
	});

	var TownCreator = Class.extend({
		towns: [],
		town: function(world, bank) {
			return this._create(Town, 0, world, bank);
		},
		city: function(world, bank) {
			return this._create(City, 3, world, bank);
		},
		getRandom: function() {
			return this.towns[Math.between(0, this.towns.length - 1)];
		},
		getRandomTown: function(i) {
			var t = {},
				i = i + 1 || 1

			if (t === 1000) return null;

			t = this.getRandom();
			if (t.type === 'city') {
				t = this.getRandom(i);
			} else {
				return t;
			}
		},
		getClosest: function(town) {
			var minDistance = Number.MAX_VALUE;
			var result, dx, dy;

			if (this.towns.length > 1) {
				for (var t = 0; t < this.towns.length; t++) {
					if (town === this.towns[t]) continue;
					dx = Math.abs(town.x - this.towns[t].x);
					dy = Math.abs(town.y - this.towns[t].y);
					if (dx + dy < minDistance) {
						minDistance = dx + dy;
						result = this.towns[t];
					}
				}
			}

			return result;
		},
		getClosestNotConnected: function(town) {
			var minDistance = Number.MAX_VALUE;
			var result, dx, dy;

			if (this.towns.length > 1) {
				for (var t = 0; t < this.towns.length; t++) {
					if (town === this.towns[t]) continue;
					if (this.towns[t].isConnectedTo(town)) continue;
					dx = Math.abs(town.x - this.towns[t].x);
					dy = Math.abs(town.y - this.towns[t].y);
					if (dx + dy < minDistance) {
						minDistance = dx + dy;
						result = this.towns[t];
					}
				}
			}

			return result;
		},
		numberOfTownsAndCities: function() {
			return this.towns.length;
		},
		upgradeRandomTownToCity: function(world, bank) {
			var t = this.getRandomTown();
			if (t) {
				this._upgradeTownToCity(world, t);
			}
		},
		_upgradeTownToCity: function(world, town) {
			var grid = [];

			this._scanGrid(world, town.x, town.y, 1, function(tile, a, b) {
				if (tile.info.climate.alt > 0) {
					grid.push([a, b])
				} else {
					return true;
				}
			});

			town.upgrade(grid);
		},
		_create: function(cls, size, world, bank) {
			var tiles = this._start(world, size);
			var town = new cls(tiles.x, tiles.y, tiles, world, bank);
			this.towns.push(town);
			return town;
		},
		_start: function(world, size) {
			var g = [];
			var attempts = 0;

			while (g.length === 0 && attempts++ < 1000) {
				var x = Math.between(0, world.grid.length - 1);
				var y = Math.between(0, world.grid[0].length - 1);
				g = [];
				//see if there's another city or town within 11 tiles
				if (!this._scanGrid(world, x, y, 11, function(tile) {
						return (tile.name === 'city' || tile.name === 'town');
					})) {

					//scoop at an n-sized chunk of land only. 
					this._scanGrid(world, x, y, size, function(tile, a, b) {
						if (tile.info.climate.alt > 0) {
							g.push([a, b])
						} else {
							return true;
						}
					});
				}
			}
			g.x = x;
			g.y = y;
			return g;
		},

		_scanGrid: function(world, centerx, centery, cells, func) {
			var x, y, sx, sy, ex, ey;

			sx = Math.max(0, centerx - cells);
			sy = Math.max(0, centery - cells);
			ex = Math.min(world.grid.length - 1, centerx + cells);
			ey = Math.min(world.grid[0].length - 1, centery + cells);
			for (x = sx; x <= ex; x++) {
				for (y = sy; y <= ey; y++) {
					if (func(world.grid[x][y], x, y) === true) return true;
				}
			}
			return false;
		}

	});

	return function() {
		if (!creator) creator = new TownCreator();

		return creator;
	}
});