define(['settings'], function(settings) {
	'use strict';

	//pixelratio, see util.js && https://github.com/jondavidjohn/hidpi-canvas-polyfill
	var size = settings.screen.block * window.pixelRatio || 1;

	function canvas(background) {

		var promise = new Promise(function(resolve) {
			var ret = {};
			ret.background = background;
			ret.width = background.grid.length;
			ret.height = background.grid[0].length;

			var light = draw(ret, 1);


			ret.image = new Image();
			ret.dark = new Image();

			ret.image.onload = function() {
				var dark = draw(ret, 0.2);
				ret.dark.src = dark.toDataURL('image/png');

			}.bind(this);

			ret.dark.onload = function() {
				resolve(ret);
				//document.body.appendChild(ret.image)
			}.bind(this);

			ret.image.src = light.toDataURL('image/png');

		});

		return promise;
	}

	function draw(w, opac) {
		var canvas, sizeWidth, sizeHeight, ctx;

		canvas = document.createElement('canvas');

		canvas.width = w.background.grid.length * size;
		canvas.height = w.background.grid[0].length * size;
		ctx = canvas.getContext("2d");
		sizeWidth = ctx.canvas.clientWidth;
		sizeHeight = ctx.canvas.clientHeight;
		ctx.font = "bold " + size + "px monospace";
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);;

		for (var x in w.background.grid) {
			for (var y in w.background.grid[x]) {
				w.background.grid[x][y].draw(ctx, x, y, size, opac);
			}
		}

		return canvas;
	}

	draw.alt = function(ctx, w) {
		var h = draw.normalize(w, 'alt');
		var sizeWidth = ctx.canvas.clientWidth;
		var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillStile = 'black';
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);
		for (var x in w) {
			for (var y in w[x]) {
				if (w[x][y].info.climate.alt > 0) {
					ctx.fillStyle = "rgba(0, " + ~~h[x][y] + ", 0, 1)";
				} else {
					ctx.fillStyle = "rgba(0, 0, " + ~~h[x][y] + ", 1)";
				}
				ctx.fillRect(x * size, y * size, size, size);
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
				ctx.fillRect(x * size, y * size, size, size);
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
				ctx.fillRect(x * size, y * size, size, size);
			}
		}
	}

	draw.normalize = function(grid, attr) {
		var max = 0;
		var min = 10000000;
		var normalized = [];
		var x, y;
		for (x = 0; x < grid.length; x++) {
			for (y = 0; y < grid[x].length; y++) {
				var g = grid[x][y].info.climate[attr];
				if (g > max) max = g;
				if (g < min) min = g;
			}
		}

		for (x = 0; x < grid.length; x++) {
			normalized[x] = [];
			for (y = 0; y < grid[0].length; y++) {
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