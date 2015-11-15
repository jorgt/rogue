define([], function() {
	'use strict';

	var hh = 600;
	var ww = 600;
	var pix = 15;
	var w = window.innerWidth;
	var h = window.innerHeight;

	if (!document.getElementById('game')) {
		var div = document.createElement('div');
		div.style.width = w + 'px';
		div.style.height = h + 'px';
		div.id ='main';
		var game = document.createElement('div');
		game.id = 'game';

		div.appendChild(game);
		document.body.appendChild(div);
	}

	function Screen() {

		var canvas = document.getElementById('game-screen');

		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.id = 'game-screen';
			canvas.height = hh;
			canvas.width = ww;
			canvas.style.cssText = "position:absolute;left:" + ((w - ww) / 2) + "px;top:" + ((h - hh) / 2) + "px;"
			document.getElementById('game').appendChild(canvas)
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

		Screen.background(background, x, y);
		Screen.entity(player, x, y);
	}

	Screen.background = function(b, offX, offY) {
		var ctx = Screen().getContext("2d");

		//dont loop over bg, loop over screensize
		var poffX = offX * pix;
		var poffY = offX * pix;
		for (var x = 0; x < ww / pix; x++) {
			for (var y = 0; y < hh / pix; y++) {
				var px = (x + offX) * pix;
				var py = (y + offY) * pix;
				ctx.drawImage(b.image, px, py, pix, pix, x * pix, y * pix, pix, pix);
			}
		}
	}

	Screen.entity = function(ent, x, y) {
		var ctx = Screen().getContext("2d");
		var p = ent.getLocation();

		ctx.fillStyle = "rgba(255,255,255,1)";
		ctx.fillText(ent.sign, (p.w - x) * pix + 3, (p.h - y) * pix + 12);
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

	Screen.element = function() {
		return document.getElementById('game-screen');
	}

	return Screen;
});