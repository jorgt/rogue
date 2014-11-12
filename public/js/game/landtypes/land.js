define([
	"helpers/log",
	"libs/simplex",
	"game/tilebank",
	"helpers/grids"
], function(
	log,
	Simplex,
	bank,
	Grids) {

	'use strict';


	var noise = new Simplex({
		octaves: 20,
		persistence: 0.4,
		level: 0.0075
	});

	return function land(opt) {
		var _size = opt.size || uneven(random(60, 70));
		var _width = _size;
		var _height = _size;
		var _grid = [];
		var _start = null;
		var _end = null;

		var generator = Grids({
			type: Grids.tileable,
			h: _height,
			w: _width,
			noise: noise.noise,
			scale: noise.level,
			repeats: 0
		});

		var _grid = _forest(generator.grid(), opt.assets);

		return {
			grid: _grid,
			start: [0,0],
			end: _end,
			height: _height,
			width: _width
		};
	}

	function _forest(grid, assets) {
		var world = [];
		for (var x = 0; x < grid.length; x++) {
			world[x] = [];
			for (var y = 0; y < grid[x].length; y++) {
				world[x][y] = assets.object(bank.get('tree'), x, y);
			}
		}
		return world;
	}



});