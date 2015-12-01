define(['settings', 'game/screenmanager', 'helpers/log'], function(settings, screenManager, log) {
	'use strict';

	//pixelratio, see util.js && https://github.com/jondavidjohn/hidpi-canvas-polyfill


	function canvas(background) {

		var promise = new Promise(function(resolve) {
			var drawFunc = (settings.screen.type === 'iso') ? drawIso : draw;

			var light = drawFunc(background, true);

			background.light = drawFunc(background, true);
			background.dark = drawFunc(background, false);

			resolve(background);

		});

		return promise;
	}

	function draw(w, light) {
		var size, canvas, sizeWidth, sizeHeight, ctx, x, y;

		size = settings.screen.block;

		canvas = document.createElement('canvas');
		canvas.width = w.grid.length * size;
		canvas.height = w.grid[0].length * size;

		ctx = canvas.getContext("2d");
		sizeWidth = ctx.canvas.clientWidth;
		sizeHeight = ctx.canvas.clientHeight;
		ctx.font = "bold " + size + "px monospace";
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);


		log.med('[BACKGROUND]', 'start drawing the image');

		for (x = 0; x < w.grid.length; x++) {
			for (y = 0; y < w.grid[x].length; y++) {
				var tile = w.grid[x][y];
				var opac = (light === true) ? 1 : 0.3;
				var opacb = ((tile.info.tot + tile.info.alt / 5) / 1.8) * opac;

				//lightmap
				if (light === true) {
					tile.background = tile.background || tile.color.map(function(a) {
						return ~~(a * opacb);
					});
				} else {
					tile.dcolor = tile.dcolor || tile.color.map(function(a) {
						return ~~(a * opac);
					});
					tile.dbackground = tile.dbackground || tile.color.map(function(a) {
						return ~~(a * opacb);
					});
				}

				screenManager.tileToImage(ctx, tile, size, size, light);
			}
		}

		return canvas;
	}

	function drawIso(w, opac) {
		var sizeh, sizew, canvas, sizeWidth, sizeHeight, ctx, x, y;

		sizeh = settings.screen.iso.height;
		sizew = settings.screen.iso.width;

		canvas = document.createElement('canvas');
		canvas.width = w.grid.length * sizew;
		canvas.height = w.grid[0].length * sizeh;

		ctx = canvas.getContext("2d");
		sizeWidth = ctx.canvas.clientWidth;
		sizeHeight = ctx.canvas.clientHeight;
		ctx.font = "bold " + 15 + "px monospace";
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, sizeWidth, sizeHeight);


		log.med('[BACKGROUND]', 'start drawing the image');

		for (x = 0; x < w.grid.length; x++) {
			for (y = 0; y < w.grid[x].length; y++) {
				screenManager.tileToImage(ctx, w.grid[x][y], sizew, sizeh, opac);
			}
		}

		return canvas;
	}

	return canvas;
});