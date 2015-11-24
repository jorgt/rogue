define(['settings'], function(settings) {
	'use strict';

	//pixelratio, see util.js && https://github.com/jondavidjohn/hidpi-canvas-polyfill
	var size = settings.screen.block;

	function canvas(background) {

		var promise = new Promise(function(resolve) {

			var light = draw(background, true);

			background.light = new Image();
			background.dark = new Image();

			background.light.onload = function() {
				var dark = draw(background, false);
				background.dark.src = dark.toDataURL('image/png');
			}.bind(this);

			background.dark.onload = function() {
				resolve(background);
				//document.body.appendChild(ret.image);
			}.bind(this);

			background.light.src = light.toDataURL('image/png');

		});

		return promise;
	}

	function draw(w, opac) {
		var canvas, sizeWidth, sizeHeight, ctx, x, y;

		canvas = document.createElement('canvas');
		canvas.width = w.grid.length * size;
		canvas.height = w.grid[0].length * size;

		ctx = canvas.getContext("2d");
		sizeWidth = ctx.canvas.clientWidth;
		sizeHeight = ctx.canvas.clientHeight;
		ctx.font = "bold " + size + "px monospace";
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);

		for (x = 0; x < w.grid.length; x++) {
			for (y = 0; y < w.grid[x].length; y++) {
				_drawTile(ctx, w.grid[x][y], x, y, size, opac);
			}
		}

		return canvas;
	}

	function _drawTile(ctx, grid, posx, posy, size, light) {

	}

	function _drawTile(ctx, tile, posx, posy, size, light) {
		var cb, cf, color, background, dcolor, dbackground, sign, fcol, bcol;
		var opac = (light === true) ? 1 : 0.2;
		var opacb = ((tile.info.tot + tile.info.alt / 5) / 1.8) * opac;

		sign = tile.sign
		color = tile.color;
		background = tile.background;
		dcolor = tile.dcolor;
		dbackground = tile.dbackground;

		if (tile.name === 'ice' && light === true) opacb += 0.3;
		if (tile.name === 'ice' && light === false) opacb += 0.05;

		//console.log(tile, color);
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

		tile.color = cf;
		tile.background = background;

		bcol = "rgba(" + cb[0] + ", " + cb[1] + ", " + cb[2] + ", " + (cb[3] || 1) + ")";
		fcol = "rgba(" + cf[0] + ", " + cf[1] + ", " + cf[2] + ", " + (cf[3] || 1) + ")";

		ctx.fillStyle = bcol;
		ctx.fillRect(posx * size, posy * size, size, size);
		ctx.fillStyle = fcol;
		ctx.fillText(sign, posx * size + 3, posy * size + 13);
		if (tile.subtile.guid) {
			_drawTile(ctx, tile.subtile, posx, posy, size, light);
		}
	}

	return canvas;
});