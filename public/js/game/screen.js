define([], function() {
	'use strict';
	var hh = 600;
	var ww = 600;

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
			context.font = "bold 15px monospace";
			context.rect(0, 0, canvas.width, canvas.height);
			context.fillStyle = "black";
			context.fill();
		}
		return canvas;
	}

	Screen.background = function(b, offx, offy) {
		var ctx = Screen().getContext("2d");
		for (var x = 0; x < b.width; x++) {
			for (var y = 0; y < b.height; y++) {
				var px = (x - offx) * 15;
				var py = (y - offy) * 15;
				if (px >= 0 && px <= hh && py >= 0 && py <= ww)
					ctx.drawImage(b.image, px, py, 15, 15, px, py, 15, 15);
			}
		}
	}

	Screen.entity = function(ent, x, y) {
		var ctx = Screen().getContext("2d");
		ctx.fillStyle = "rgba(255,255,255,1)";
		ctx.fillText(ent.sign, ent.position.w * 15 + 3, ent.position.h * 15 + 12);
	}

	Screen.backpix = function(b, offx, offy) {
		var src = Screen().getContext("2d").getImageData();
		var pix = b.context.getImageData();
		for (var x = 0; x < b.width; x++) {
			for (var y = 0; y < b.height; y++) {
				var px = x * 15 - offx;
				var py = y * 15 - offy;
				if (px >= 0 && px <= hh && py >= 0 && py <= ww)
					ctx.drawImage(b.image, px, py, 15, 15, px, py, 15, 15);
			}
		}
	}

	return Screen;
});