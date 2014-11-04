define([
	"helpers/log",
	"settings",
	"game/worlds/climate",
	"libs/simplex",
	"game/tilebank"
], function(
	log,
	settings,
	Climate,
	Simplex,
	bank) {

	'use strict';

	var ranges = {
		altitude: {
			min: -5000,
			max: 6000
		},
		precipitation: {
			min: 50,
			max: 16000
		},
		temperature: {
			min: 0,
			max: 50
		}
	}
	var chunk = 50;

	var sAlt = new Simplex({
		octaves: 6,
		persistence: 0.4,
		level: 0.04
	});

	var sPre = new Simplex({
		octaves: 6,
		persistence: 0.4,
		level: 0.05
	});

	var sTem = new Simplex({
		octaves: 6,
		persistence: 0.4,
		level: 0.06
	});

	return function world(opt) {
		var _height = opt.height || uneven(random(35, 50));
		var _width = opt.width || uneven(random(60, 80));
		var _grid = [];
		var _start = null;
		var _end = null;
		var gAlt = _chunk(sAlt, ranges.altitude, _height, _width, 0, 0);
		var gPre = _chunk(sPre, ranges.precipitation, _height, _width, 0, 0);
		var gTem = _chunk(sTem, ranges.temperature, _height, _width, 0, 0);

		for (var x = 0; x < _height; x++) {
			_grid[x] = [];
			for (var y = 0; y < _width; y++) {
				var c = Climate.getClimateInfo(Climate.get(gTem[x][y], gPre[x][y], gAlt[x][y]));
				_grid[x][y] = opt.assets.object(bank.get(c.replace(/\s/g, '')), x, y);
			}
		}

		_getStartAndEndTiles();

		return {
			grid: _grid,
			start: [10, 10],
			end: [20, 20],
			height: _height,
			width: _width
		};

		function _chunk(noise, range, w, h, startx, starty) {
			var grid = [];
			var sx = startx * h;
			var sy = starty * w;
			for (var x = 0; x < w; x++) {
				grid[x] = [];
				for (var y = 0; y < h; y++) {
					grid[x][y] = Math.floor(_range(range, noise.noise((sx + x) * noise.level, (sy + y) * noise.level)));
				}
			}
			return grid;
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