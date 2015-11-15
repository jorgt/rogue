define([], function() {
	'use strict';

	var hh = 600;
	var ww = 600;
	var pix = 15;
	var offX = 0;
	var offY = 0;

	function Screen() {

		var canvas = document.getElementById('game-screen');

		if (!canvas) {
			var div = document.createElement('div');
			var w = window.innerWidth;
			var h = window.innerHeight;
			div.style.width = w + 'px';
			div.style.height = h + 'px';
			canvas = document.createElement('canvas');
			canvas.id = 'game-screen';
			canvas.height = hh;
			canvas.width = ww;
			canvas.style.cssText = "position:absolute;left:" + ((w - ww) / 2) + "px;top:" + ((h - hh) / 2) + "px;"
			div.appendChild(canvas)
			document.body.appendChild(div);
			var context = canvas.getContext("2d");
			context.font = "bold " + pix + "px monospace";
			context.rect(0, 0, canvas.width, canvas.height);
			context.fillStyle = "black";
			context.fill();
		}
		return canvas;
	}

	Screen.draw = function(background, player, entities) {
		var p = player.getLocation();
		var x = Math.min(background.width - ww / pix, Math.max(0, p.w - (ww / pix / 2)));
		var y = Math.min(background.height - hh / pix, Math.max(0, p.h - (hh / pix / 2)));

		console.log(p, x, y, background.width);

		Screen.background(background);
	}

	Screen.background = function(b) {
		var ctx = Screen().getContext("2d");

		for (var x = 0; x < b.width; x++) {
			for (var y = 0; y < b.height; y++) {
				var px = (x + offX) * pix;
				var py = (y + offY) * pix;
				if (px >= 0 && px <= hh && py >= 0 && py <= ww)
					ctx.drawImage(b.image, px, py, pix, pix, px, py, pix, pix);
			}
		}
	}

	Screen.entity = function(ent) {
		var ctx = Screen().getContext("2d");
		var x = 
		ctx.fillStyle = "rgba(255,255,255,1)";
		ctx.fillText(ent.sign, ent.position.w * pix + 3, ent.position.h * pix + 12);
	}

	Screen.backpix = function(b, offx, offy) {
		var src = Screen().getContext("2d").getImageData();
		var pix = b.context.getImageData();
		for (var x = 0; x < b.width; x++) {
			for (var y = 0; y < b.height; y++) {
				var px = x * pix - offx;
				var py = y * pix - offy;
				if (px >= 0 && px <= hh && py >= 0 && py <= ww)
					ctx.drawImage(b.image, px, py, pix, pix, px, py, pix, pix);
			}
		}
	}

	return Screen;
});