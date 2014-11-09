define([
	"helpers/log",
	"settings",
	"game/worlds/climate2",
	"libs/simplex",
	"game/tilebank",
	"game/worlds/grids"
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
		persistence: 0.3,
		level: 0.0075
	});

	var sPre = new Simplex({
		octaves: 20,
		persistence: 0.2,
		level: 0.0045
	});

	var sTem = new Simplex({
		octaves: 20,
		persistence: 0.4,
		level: 0.0065
	});

	return function world(opt) {
		var _size = opt.size || uneven(random(60, 70));
		var _width = _size;
		var _height = _size;
		var _grid = [];
		var _start = null;
		var _end = null;
		var gAlt = _chunk(sAlt, ranges.altitude, _height, _width, 0, 0);
		var gPre = _chunk(sPre, ranges.precipitation, _height, _width, 0, 0);
		var gTem = _chunk(sTem, ranges.temperature, _height, _width, 0, 0);

		var aa = 0, ap = 0, at = 0;

		for (var x = 0; x < _height; x++) {
			_grid[x] = [];
			for (var y = 0; y < _width; y++) {
				var c = climate(~~(gTem[x][y] * 1.2), ~~ (gPre[x][y]), ~~ (gAlt[x][y] * 1.5));
				_grid[x][y] = opt.assets.object(bank.get(c.replace(/\s/g, '')), x, y);
			}
		}

		_getStartAndEndTiles();

		return {
			grid: _grid,
			start: _start,
			end: _end,
			height: _height,
			width: _width
		};

		function _chunk(noise, range, h, w, startx, starty) {
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
			//var sx = startx * h;
			//var sy = starty * w;
			for (var x = 0; x < grid.length; x++) {
				world[x] = [];
				for (var y = 0; y < grid[x].length; y++) {
					world[x][y] = Math.floor(_range(range, grid[x][y]));
				}
			}
			return world;
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
				_start = (bank.get(start.tile).walkable === true) ? [sx, sy] : null;
				_end = (bank.get(end.tile).walkable === true) ? [ex, ey] : null;
			}
		}
	}

});