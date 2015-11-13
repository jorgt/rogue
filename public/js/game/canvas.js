define([], function() {
	'use strict';

	var size = 15;

	function canvas(background) {

		var promise = new Promise(function(resolve, reject) {
			var ret = {};
			ret.grid = background;
			ret.canvas = document.createElement('canvas');
			ret.width = background.grid.length;
			ret.height = background.grid[0].length;
			ret.canvas.width = background.grid.length * size;
			ret.canvas.height = background.grid[0].length * size;
			ret.context = ret.canvas.getContext("2d");
			ret.context.font = "bold " + size + "px monospace";
			ret.context.rect(0, 0, ret.canvas.width, ret.canvas.height);
			ret.context.fillStyle = "black";
			ret.context.fill();

			draw(ret.context, background.grid);

			ret.image = new Image();
			ret.image.onload = function() {
				resolve(ret);
			}
			ret.image.src = ret.canvas.toDataURL('image/png');
		});

		return promise;
	}

	var drawer = {
		deepsea: function(tile) {
			var r, g, b;
			r = g = _color(0, tile.info.climate.alt, 9000);
			b = _color(255, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		sea: function(tile) {
			var r, g, b;
			r = g = _color(50, tile.info.climate.alt, 9000);
			b = _color(255, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		shallowsea: function(tile) {
			var r, g, b;
			r = g = _color(100, tile.info.climate.alt, 9000);
			b = _color(255, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		ice: function(tile) {
			var r, g, b;
			r = g = b = _color(255, tile.info.climate.alt, 15000);
			return [r, g, b];
		},
		polar: function(tile) {
			var r, g, b;

			r = g = _color(200, tile.info.climate.alt, 9000);
			b = _color(255, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		tundra: function(tile) {
			var r, g, b;

			r = _color(50, tile.info.climate.alt, 9000);
			g = _color(100, tile.info.climate.alt, 9000);
			b = _color(150, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		taiga: function(tile) {
			var r, g, b;
			r = g = _color(200, tile.info.climate.alt, 9000);
			g = _color(200, tile.info.climate.alt, 9000);
			b = _color(50, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		savannah: function(tile) {
			var r, g, b;
			r = _color(200, tile.info.climate.alt, 9000);
			g = _color(200, tile.info.climate.alt, 9000);
			b = _color(100, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		shrubland: function(tile) {
			var r, g, b;

			r = _color(50, tile.info.climate.alt, 9000);
			g = _color(255, tile.info.climate.alt, 9000);
			b = _color(50, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		swamp: function(tile) {
			var r, g, b;

			r = _color(20, tile.info.climate.alt, 9000);
			g = _color(255, tile.info.climate.alt, 9000);
			b = _color(150, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		desert: function(tile) {
			var r, g, b;

			r = _color(250, tile.info.climate.alt, 9000);
			g = _color(220, tile.info.climate.alt, 9000);
			b = 0;
			return [r, g, b];
		},
		plains: function(tile) {
			var r, g, b;

			r = _color(250, tile.info.climate.alt, 9000);
			g = _color(220, tile.info.climate.alt, 9000);
			b = _color(100, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		forest: function(tile) {
			var r, g, b;

			b = r = 20; //_color(20, tile.info.climate.alt, 9000);
			g = _color(255, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		seasonalforest: function(tile) {
			var r, g, b;

			r = b = 75; //_color(50, tile.info.climate.alt, 9000);
			g = _color(255, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		rainforest: function(tile) {
			var r, g, b;

			r = b = 110; //_color(100, tile.info.climate.alt, 9000);
			g = _color(255, tile.info.climate.alt, 9000);
			return [r, g, b];
		},
		mountain: function(tile) {
			var r, g, b;

			r = g = b = _color(100, tile.info.climate.alt, 15000);
			return [r, g, b];
		},
		snowymountain: function(tile) {
			var r, g, b;
			r = g = b = _color(255, tile.info.climate.alt, 15000);
			return [r, g, b];
		},
	}

	function draw(ctx, w) {
		var sizeWidth = ctx.canvas.clientWidth;
		var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillStile = 'black';
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);
		for (var x in w) {
			for (var y in w[x]) {

				draw.tile(ctx, x, y, w[x][y]);
			}
		}
	}
	
	draw.tile = function(ctx, x, y, tile) {
		var color = drawer[tile.name](tile);
		var opac = (tile.walkable === true) ? 0.5 : 0.3;

		if (color) {
			ctx.fillStyle = "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 1)";
			ctx.fillText(tile.sign, x * 15 + 3, y * 15 + 12);
			ctx.fillStyle = "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + opac + ")";
			ctx.fillRect(x * 15, y * 15, 15, 15);
		}
	}

	draw.alt = function(ctx, w) {
		var h = draw.normalize(w, 'alt');
		var sizeWidth = ctx.canvas.clientWidth;
		var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillStile = 'black';
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);
		for (var x in w) {
			for (var y in w[x]) {
				if (w[x][y].info.climate.alt > 0) ctx.fillStyle = "rgba(0, " + ~~h[x][y] + ", 0, 1)";
				else ctx.fillStyle = "rgba(0, 0, " + ~~h[x][y] + ", 1)";

				ctx.fillRect(x * 15, y * 15, 15, 15);
			}
		}
	}

	draw.prec = function(ctx, w) {
		var h = draw.normalize(w, 'prec');
		var sizeWidth = ctx.canvas.clientWidth;
		var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillStile = 'black';
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);
		for (var x in w) {
			for (var y in w[x]) {
				ctx.fillStyle = "rgba(0, 0, " + ~~h[x][y] + ", 1)";
				ctx.fillRect(x * 15, y * 15, 15, 15);
			}
		}
	}

	draw.temp = function(ctx, w) {
		var h = draw.normalize(w, 'temp');
		var sizeWidth = ctx.canvas.clientWidth;
		var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillStile = 'black';
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);
		for (var x in w) {
			for (var y in w[x]) {
				ctx.fillStyle = "rgba(" + ~~h[x][y] + ", 0, " + (200 - ~~h[x][y]) + ", 1)";
				ctx.fillRect(x * 15, y * 15, 15, 15);
			}
		}
	}
	draw.normalize = function(grid, attr) {
		var max = 0;
		var min = 10000000;
		var normalized = [];
		for (var x = 0; x < grid.length; x++) {
			for (var y = 0; y < grid[x].length; y++) {
				var g = grid[x][y].info.climate[attr];
				if (g > max) max = g;
				if (g < min) min = g;
			}
		}

		for (var x = 0; x < grid.length; x++) {
			normalized[x] = [];
			for (var y = 0; y < grid[0].length; y++) {
				normalized[x][y] = 255 * ((grid[x][y].info.climate[attr] - min) / (max - min));
			}
		}
		return normalized;
	}

	function _color(min, factor, divider) {
		return Math.abs(~~Math.min(min, (1 - (Math.abs(factor) / divider)) * min));
	}

	return canvas;
});