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


	var height = 1000;

	var temp = 20;
	var altitude = 5100;
	var latitude = 7 //the X value in my 2d array. 
	var precipitation = 2300;

	var ranges = {
		altitude: {
			min: -10000,
			max: 6000
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

	return function world(assets) {
		var _height = uneven(random(35, 50));
		var _width = uneven(random(60, 80));
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
				_grid[x][y] = assets.object(bank.get(c.replace(/\s/g, '')), x, y);
			}
		}


		return {
			grid: _grid,
			start: [10,10],
			end: [20,20],
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


	}

});