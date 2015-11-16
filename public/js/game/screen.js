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
		div.id = 'main';
		var game = document.createElement('div');
		game.id = 'game';

		div.appendChild(game);
		document.body.appendChild(div);
	}

	function Screen(name) {

		var canvas = document.getElementById('game-screen-' + name);

		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.id = 'game-screen-' + name;
			canvas.height = hh;
			canvas.width = ww;
			canvas.style.cssText = "position:absolute;left:" + ((w - ww) / 2) + "px;top:" + ((h - hh) / 2) + "px;"
			document.getElementById('game').appendChild(canvas)

			var context = canvas.getContext("2d");
			context.font = "bold " + pix + "px monospace";
		}
		return canvas;
	}

	(function() {
		Screen.canvas = Screen();
		Screen.context = Screen.canvas.getContext("2d");
		Screen.width = Screen.canvas.width;
		Screen.height = Screen.canvas.height;
	})();

	Screen.draw = function(background, player, entities) {
		var p = player.getLocation();
		var x = Math.min(background.width - ww / pix, Math.max(0, p.w - (ww / pix / 2)));
		var y = Math.min(background.height - hh / pix, Math.max(0, p.h - (hh / pix / 2)));
		Screen.context.rect(0, 0, Screen.width, Screen.height);
		Screen.context.fillStyle = "black";
		Screen.context.fill();
		Screen.background(background, x, y);
		Screen.entity(player, x, y);
	}

	Screen.background = function(b, offX, offY) {
		var ctx = Screen.context;
		//dont loop over bg, loop over screensize
		var poffX = offX * pix;
		var poffY = offX * pix;
		for (var x = 0; x < ww / pix; x++) {
			for (var y = 0; y < hh / pix; y++) {
				var xx = x + offX;
				var yy = y + offY;
				var px = xx * pix;
				var py = yy * pix;
				var tile = b.background.getTile(xx, yy);
				if (tile.visible === true) {
					ctx.drawImage(b.image, px, py, pix, pix, x * pix, y * pix, pix, pix);
				} else if (tile.visited === true) {
					ctx.drawImage(b.dark, px, py, pix, pix, x * pix, y * pix, pix, pix);
				}
			}
		}
	}

	Screen.entity = function(ent, x, y) {
		var ctx = Screen.context;
		var p = ent.getLocation();

		ctx.fillStyle = "rgba(255,255,255,1)";
		ctx.fillText(ent.sign, (p.w - x) * pix + 3, (p.h - y) * pix + 12);
	}

	Screen.element = function() {
		return document.getElementById('game-screen');
	}

	return Screen;
});