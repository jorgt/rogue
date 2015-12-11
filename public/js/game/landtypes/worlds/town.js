define([
	"helpers/log",
	"settings",
	"helpers/maths"
], function(log, settings) {

	var creator;

	var Town = Class.extend({
		type: null,
		init: function(tiles) {
			this.type = 'town';
			this.size = 1;
			this.tiles = tiles;
		},
		setup: function(grid, bank) {
			for (var x = 0; x < this.tiles.length; x++) {
				var t = this.tiles[x];
				grid[t[0]][t[1]] = bank.get(this.type, t[0], t[1]), ['name', 'color', 'sign'];
			}
			return this;
		}
	});

	var City = Town.extend({
		init: function(tiles) {
			_super.call(this, tiles);
			this.type = 'city'
		}
	});

	var TownCreator = Class.extend({
		towns: [],
		town: function(grid, bank) {
			return this._create(Town, 0, grid, bank);
		},
		city: function(grid, bank) {
			return this._create(City, 3, grid, bank);
		},
		getClosest: function(town) {
			
		},
		_create: function(cls, size, grid, bank) {
			var tiles = this._start(grid, size);
			var town = new cls(tiles).setup(grid, bank);
			this.towns.push(town);
			return town;
		},
		_start: function(grid, size) {
			var g = [];
			var attempts = 0;

			while (g.length === 0 && attempts++ < 1000) {
				var x = Math.between(0, grid.length - 1);
				var y = Math.between(0, grid[0].length - 1);
				g = [];
				//see if there's another city or town within 11 tiles
				if (!this._scanGrid(grid, x, y, 11, function(tile) {
						return (tile.name === 'city' || tile.name === 'town');
					})) {

					//scoop at an n-sized chunk of land only. 
					this._scanGrid(grid, x, y, size, function(tile, a, b) {
						if (tile.info.climate.alt > 0) {
							g.push([a, b])
						} else {
							return true;
						}
					});
				}
			}

			return g;
		},

		_scanGrid: function(grid, centerx, centery, cells, func) {
			var x, y, sx, sy, ex, ey;

			sx = Math.max(0, centerx - cells);
			sy = Math.max(0, centery - cells);
			ex = Math.min(grid.length - 1, centerx + cells);
			ey = Math.min(grid[0].length - 1, centery + cells);
			for (x = sx; x <= ex; x++) {
				for (y = sy; y <= ey; y++) {
					if (func(grid[x][y], x, y) === true) return true;
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