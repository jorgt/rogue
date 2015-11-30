define(['settings', 'game/screenmanager', 'helpers/log'], function(settings, screenManager, log) {
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
				//document.body.appendChild(background.light);
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


		log.med('[BACKGROUND]', 'start drawing the image');

		for (x = 0; x < w.grid.length; x++) {
			for (y = 0; y < w.grid[x].length; y++) {
				screenManager.tileToImage(ctx, w.grid[x][y], x, y, size, opac);
			}
		}

		return canvas;
	}

	return canvas;
});