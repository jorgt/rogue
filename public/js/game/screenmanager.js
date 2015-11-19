define(['settings', 'helpers/log'], function(settings, log) {
	'use strict';

	var screens = {},
		h = window.innerHeight,
		w = window.innerWidth,
		mainW = settings.screen.width,
		mainH = settings.screen.height,
		pix = settings.screen.block,// * window.pixelRatio || 1,
		bl = settings.screen.block,
		ratio = 1,//window.pixelRatio || 1,
		font = settings.screen.font;

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
			context.font = "bold " + settings.screen.block + "px monospace";
			context.rect(0, 0, width, height);
			context.fillStyle = "black";
			context.fill();
			//context.scale(window.devicePixelRatio, window.devicePixelRatio);

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
		background: function(color) {
			this.context.fillStyle = color || this.color;
			this.context.fillRect(0, 0, this.width, this.height);
		},
		clear: function() {
			this.context.save();

			// Use the identity matrix while clearing the canvas
			this.context.setTransform(1, 0, 0, 1, 0, 0);
			this.context.clearRect(0, 0, this.width, this.height);

			// Restore the transform
			this.context.restore();
		},
		map: function(b, player) {
			this.clear();
			var edges = 50;
			var p = ~~Math.min((this.height - edges) / b.height, (this.width - edges) / b.width) - 1;
			var eh = (this.height - b.height * p) / 2;
			var ew = (this.width - b.width * p) / 2;
			var pos = player.getLocation();
			var color;

			for (var x = 0; x < b.width; x++) {
				for (var y = 0; y < b.height; y++) {
					var px = ew + x * p;
					var py = eh + y * p;

					if (x === pos.w && y === pos.h) {
						color = 'red';
					} else {
						var tile = b.getTile(x, y);
						var o1 = (!tile.name.match(/sea/)) ? (tile.info.tot - 0.5) * 1.5 + 0.25 : 1 - ((0.5 - tile.info.tot) * 1.5 + 0.25);
						var o2 = (o1 * 0.3 + 0.1);

						if (tile.visible === true) {
							color = (!tile.name.match(/sea/)) ? 'rgba(0,170,0,' + o1 + ')' : 'rgba(0,0,170,' + o1 + ')';
						} else if (tile.visited === true) {
							color = (!tile.name.match(/sea/)) ? 'rgba(170,170,170,' + o2 + ')' : 'rgba(60,60,60,' + o2 + ')';
						}
					}


					if (!color) {
						color = 'black';
					}
					this.context.fillStyle = color;
					this.context.fillRect(px, py, p, p);
					color = null;
				}
			}
		},
		draw: function(background, player, entities) {
			var offset = this.offset(player, background);
			this.clear();

			this._background(background, offset.w, offset.h);
			this._entity(player, offset.w, offset.h);
		},
		center: function(input) {
			var x = (this.width / 2) - String(input || '').length / 2;
			var y = (this.height / 2);
			return {
				x: x,
				y: y
			};
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
			this.context.font = settings.screen.block + "px " + font
			x = x || 0;
			y = y || 0;
			this.context.fillStyle = color || "rgba(255,255,255,1)";
			var array = text.split('');

			for (var t = 0; t < array.length; t++) {
				this.context.fillText(array[t], (x + t * settings.screen.block), y);
			}
			this.context.font = oldfont;
		},
		_entity: function(ent, offX, offY, color) {
			var p = ent.getLocation();
			var nx = (p.w - offX) * bl + 3;
			var ny = (p.h - offY) * bl + 12;
			this.context.fillStyle = color || "rgba(255,255,255,1)";
			this.context.fillText(ent.sign, nx, ny);
		},
		_background: function(b, offX, offY) {
			for (var x = 0; x < this.width / pix; x++) {
				for (var y = 0; y < this.height / pix; y++) {
					var xx = x + offX;
					var yy = y + offY;
					var px = xx * bl;
					var py = yy * bl;
					var tile = b.background.getTile(xx, yy);

					if (tile.visible === true) {
						this.context.drawImage(b.image, px, py, bl, bl, x * bl, y * bl, bl, bl);
					} else if (tile.visited === true) {
						this.context.drawImage(b.dark, px, py, bl, bl, x * bl, y * bl, bl, bl);
					}
				}
			}
			//console.timeEnd("background")
		}
	});

	return Factory;
});