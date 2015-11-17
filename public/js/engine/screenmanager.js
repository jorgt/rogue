define(['settings', 'helpers/log'], function(settings, log) {
	'use strict';

	var screens = {},
		h = window.innerHeight,
		w = window.innerWidth,
		mainW = settings.screen.width,
		mainH = settings.screen.height,
		pix = settings.screen.block;

	//implement the main divs if not existing upon first 
	//calling the Screen Manager
	if (!document.getElementById('game')) {
		//do the rest of the shizzle
		var div = document.createElement('div');
		div.style.width = mainW + 'px';
		div.style.height = mainH + 'px';
		div.style.cssText = "border:1px solid #111;height:" + mainH + "px;width:" + mainW + "px;display:block;position:absolute;left:" + ((w - mainW) / 2) + "px;top:" + ((h - mainH) / 2) + "px;";
		div.id = 'main';
		var game = document.createElement('div');
		game.id = 'game';
		game.style.cssText = "position:absolute;height:" + mainH + "px;width:" + mainW + "px;display:block";
		div.appendChild(game);
		document.body.appendChild(div);
	}

	function Factory(name, height, width, index) {
		if (!screens[name]) {
			screens[name] = new Screen(name, height, width, index);
		}

		return screens[name];
	}

	var Screen = Class.extend({
		init: function(name, height, width, index) {
			index = index || 0;
			var canvas = document.createElement('canvas');
			canvas.id = 'game-screen-' + name;
			canvas.height = height;
			canvas.width = width;
			canvas.style.cssText = "display:none;position:absolute;z-index:" + index + ";";
			document.getElementById('game').appendChild(canvas);

			var context = canvas.getContext("2d");
			context.font = "bold " + pix + "px monospace";
			context.rect(0, 0, width, height);
			context.fillStyle = "black";
			context.fill();

			this.canvas = canvas;
			this.context = context;
			this.height = height;
			this.width = width;
			this.heightBlocks = height / pix;
			this.widthBlocks = width / pix;
			this.name = name;
			this.color = "rgba(0,0,0,1)"
		},
		position: function(left, top) {
			this.canvas.style.left = left + 'px';
			this.canvas.style.left = top + 'px';
		},
		show: function() {
			log.low('[SCREEN]', 'showing screen', this.name);
			this.canvas.style.display = "block";
		},
		hide: function() {
			log.low('[SCREEN]', 'hiding screen', this.name);
			this.canvas.style.display = "none";
		},
		clear: function() {
			this.context.rect(0, 0, this.width, this.height);
			this.context.fillStyle = this.color;
			this.context.fill();
		},
		draw: function(background, player, entities) {
			var offset = this.offset(player, background);
			this.clear();

			this._background(background, offset.w, offset.h);
			this._entity(player, offset.w, offset.h);
		},
		setBackgroundColor: function(color) {
			this.color = color;
		},
		offset: function(player, background) {
			var p = player.getLocation();
			var w = Math.min(background.width - this.width / pix, Math.max(0, p.w - (this.width / pix / 2)));
			var h = Math.min(background.height - this.height / pix, Math.max(0, p.h - (this.height / pix / 2)));
			return {
				h: h,
				w: w
			};
		},
		write: function(text, x, y, color) {
			var oldfont = this.context.font;
			this.context.font = "15px minecraftmedium"
			x = x || 0;
			y = y || 0;
			this.context.fillStyle = color || "rgba(255,255,255,1)";
			var array = text.split('');

			for (var t = 0; t < array.length; t++) {
				this.context.fillText(array[t], (x + t * pix), y);
			}
			this.context.font = oldfont;
		},
		_entity: function(ent, offX, offY) {
			var p = ent.getLocation();

			this.context.fillStyle = "rgba(255,255,255,1)";
			this.context.fillText(ent.sign, (p.w - offX) * pix + 3, (p.h - offY) * pix + 12);
		},
		_background: function(b, offX, offY) {
			for (var x = 0; x < this.width / pix; x++) {
				for (var y = 0; y < this.height / pix; y++) {
					var xx = x + offX;
					var yy = y + offY;
					var px = xx * pix;
					var py = yy * pix;
					var tile = b.background.getTile(xx, yy);

					if (tile.visible === true) {
						this.context.drawImage(b.image, px, py, pix, pix, x * pix, y * pix, pix, pix);
					} else if (tile.visited === true) {
						this.context.drawImage(b.dark, px, py, pix, pix, x * pix, y * pix, pix, pix);
					}
				}
			}
		}
	});

	return Factory;
});