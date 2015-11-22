define(['settings'], function(settings) {
	'use strict';

	//pixelratio, see util.js && https://github.com/jondavidjohn/hidpi-canvas-polyfill
	var size = settings.screen.block;

	function canvas(background) {

		var promise = new Promise(function(resolve) {
			var ret = {};
			ret.background = background;
			ret.width = background.grid.length;
			ret.height = background.grid[0].length;

			var light = draw(ret, true);

			ret.image = new Image();
			ret.dark = new Image();

			ret.image.onload = function() {
				var dark = draw(ret, false);
				ret.dark.src = dark.toDataURL('image/png');
			}.bind(this);

			ret.dark.onload = function() {
				resolve(ret);
				document.body.appendChild(ret.image);
			}.bind(this);

			ret.image.src = light.toDataURL('image/png');

		});

		return promise;
	}

	function draw(w, opac) {
		var canvas, sizeWidth, sizeHeight, ctx, x, y;

		canvas = document.createElement('canvas');
		canvas.width = w.background.grid.length * size;
		canvas.height = w.background.grid[0].length * size;

		ctx = canvas.getContext("2d");
		sizeWidth = ctx.canvas.clientWidth;
		sizeHeight = ctx.canvas.clientHeight;
		ctx.font = "bold " + size + "px monospace";
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);

		for (x = 0; x < w.background.grid.length; x++) {
			for (y = 0; y < w.background.grid[x].length; y++) {
				_drawTile(ctx, w.background.grid, x, y, size, opac);
			}
		}

		return canvas;
	}

	function _drawTile(ctx, grid, posx, posy, size, light) {
		var cb, cf, color, background, dcolor, dbackground, sign;
		var tile = grid[posx][posy];

		var opac = (light === true) ? 1 : 0.2;

		var opacb = ((tile.info.tot + tile.info.alt / 5) / 1.8) * opac;
		var fcol, bcol;

		sign = tile.subtile.sign || tile.sign

		if (typeof sign === 'function') {
			sign = sign(grid, posx, posy);
		}

		color = tile.subtile.color || tile.color;
		background = tile.subtile.background || tile.background;
		dcolor = tile.subtile.dcolor || tile.dcolor;
		dbackground = tile.subtile.dbackground || tile.dbackground;

		if (tile.name === 'ice' && light === true) opacb += 0.3;
		if (tile.name === 'ice' && light === false) opacb += 0.05;

		//lightmap
		if (light === true) {
			cf = color;
			cb = background || color.map(function(a) {
				return ~~(a * opacb);
			});
		} else {
			cf = dcolor || color.map(function(a) {
				return ~~(a * opac);
			});
			cb = dbackground || color.map(function(a) {
				return ~~(a * opacb);
			});
		}

		bcol = "rgba(" + cb[0] + ", " + cb[1] + ", " + cb[2] + ", 1)";
		fcol = "rgba(" + cf[0] + ", " + cf[1] + ", " + cf[2] + ", 1)";

		ctx.fillStyle = bcol;
		ctx.fillRect(posx * size, posy * size, size, size);
		ctx.fillStyle = fcol;
		ctx.fillText(sign, posx * size + 3, posy * size + 12);
	}

	//LEGACY. Some functions for analysis
	draw.alt = function(ctx, w) {
		var x, y, h = draw.normalize(w, 'alt'),
			sizeWidth = ctx.canvas.clientWidth,
			sizeHeight = ctx.canvas.clientHeight;

		ctx.fillStile = 'black';
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);
		for (x = 0; x < w.length; x++) {
			for (y = 0; y < w[x].length; y++) {
				if (w[x][y].info.climate.alt > 0) {
					ctx.fillStyle = "rgba(0, " + ~~h[x][y] + ", 0, 1)";
				} else {
					ctx.fillStyle = "rgba(0, 0, " + ~~h[x][y] + ", 1)";
				}
				ctx.fillRect(x * size, y * size, size, size);
			}
		}
	};

	draw.prec = function(ctx, w) {
		var x, y, h = draw.normalize(w, 'prec'),
			sizeWidth = ctx.canvas.clientWidth,
			sizeHeight = ctx.canvas.clientHeight;

		ctx.fillStile = 'black';
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);
		for (x = 0; x < w.length; x++) {
			for (y = 0; y < w[x].length; y++) {
				ctx.fillStyle = "rgba(0, 0, " + ~~h[x][y] + ", 1)";
				ctx.fillRect(x * size, y * size, size, size);
			}
		}
	};

	draw.temp = function(ctx, w) {
		var x, y, h = draw.normalize(w, 'temp'),
			sizeWidth = ctx.canvas.clientWidth,
			sizeHeight = ctx.canvas.clientHeight;

		ctx.fillStile = 'black';
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);
		for (x = 0; x < w.length; x++) {
			for (y = 0; y < w[x].length; y++) {
				ctx.fillStyle = "rgba(" + ~~h[x][y] + ", 0, " + (200 - ~~h[x][y]) + ", 1)";
				ctx.fillRect(x * size, y * size, size, size);
			}
		}
	};

	draw.normalize = function(grid, attr) {
		var x, y, max = Number.MIN_VALUE,
			min = Number.MAX_VALUE,
			normalized = [];

		for (x = 0; x < grid.length; x++) {
			for (y = 0; y < grid[x].length; y++) {
				var g = grid[x][y].info.climate[attr];

				max = (g > max) ? g : max;
				min = (g > min) ? g : min;
			}
		}

		for (x = 0; x < grid.length; x++) {
			normalized[x] = [];
			for (y = 0; y < grid[0].length; y++) {
				normalized[x][y] = 255 * ((grid[x][y].info.climate[attr] - min) / (max - min));
			}
		}
		return normalized;
	};

	return canvas;
});