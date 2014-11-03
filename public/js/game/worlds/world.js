define(["helpers/log", "helpers/settings", "game/worlds/climate"], function(
	log, settings, Climate) {


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
			min: -50,
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

	function World() {
		var gAlt = _chunk(sAlt, ranges.altitude, chunk, 0, 0);
		var gPre = _chunk(sPre, ranges.precipitation, chunk, 0, 0);
		var gTem = _chunk(sTem, ranges.temperature, chunk);

		var world = [];
		for (var x = 0; x < 50; x++) {
			world[x] = [];
			for (var y = 0; y < 50; y++) {
				world[x][y] = Climate.getClimateInfo(Climate.get(gTem[x][y], gPre[x][y], gAlt[x][y]))
			}
		}

		function _chunk(noise, range, size, startx, starty) {
			var grid = [];
			var sx = startx * size;
			var sy = starty * size;
			for (var x = 0; x < size; x++) {
				grid[x] = [];
				for (var y = 0; y < size; y++) {
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