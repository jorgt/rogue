define([
	"helpers/log",
	"settings",
	"helpers/maths"
], function(log, settings) {

	var factory;

	var Town = Class.extend({
		type: null,
		init: function() {
			this.type = 'town';
			this.size = 1;
		},
		setup: function(grid) {

		}
	});

	function Factory() {
		this.towns = {};

		this.town = function(grid) {
			var tiles = _start(grid, 1);

			return new Town(tiles) {
				
			}
		}

		this.city = function(grid) {
			var tiles = _start(grid, 3);
		}

		function _start(grid, size) {
			var g = [];
			var attempts = 0;

			while (g.length === 0 && attempts++ < 1000) {
				var x = Math.between(0, grid.length - 1);
				var y = Math.between(0, grid[0].length - 1);
				g = [];
				//see if there's another city or town within 11 tiles
				if (!_scanGrid(grid, x, y, 11, function(tile) {
						return (tile.name === 'city' || tile.name === 'town');
					})) {

					//scoop at an n-sized chunk of land only. 
					_scanGrid(grid, x, y, 0, function(tile, a, b) {
						if (tile.info.climate.alt > 0) {
							g.push([a, b])
						} else {
							return true;
						}
					});
				}
			}

			return g;
		}

		function _scanGrid(grid, centerx, centery, cells, func) {
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

	}

	return function() {
		if (!factory) factory = new Factory();

		return factory;
	}
});