define(['settings', 'helpers/log'], function(settings, log) {
	'use strict';

	var screens = {},
		h = window.innerHeight,
		w = window.innerWidth,
		mainW = settings.screen.width,
		mainH = settings.screen.height,
		bl = settings.screen.block,
		ratio = 1, //window.blelRatio || 1,
		font = settings.screen.font;

	//implement the main divs if not existing upon first 
	//calling the Screen Manager
	if (!document.getElementById('game')) {
		//do the rest of the shizzle
		var div = document.createElement('div');
		div.style.width = mainW + 'px';
		div.style.height = mainH + 'px';
		div.style.cssText = "border:1px solid #111;height:" + mainH + "px;width:" + mainW + "px;display:block;position:fixed;left:" + ((w - mainW) / 2) + "px;top:" + ((h - mainH) / 2) + "px;";
		div.id = 'main';

		var game = document.createElement('div');
		game.id = 'game';
		game.style.cssText = "position:absolute;height:" + mainH + "px;width:" + mainW + "px;display:block";
		div.appendChild(game);
		document.body.appendChild(div);

		var canvas = document.createElement('canvas');
		canvas.id = 'game-screen';
		canvas.height = h;
		canvas.width = w;
		canvas.style.cssText = "position:fixed;top:0px;left:0px;z-index:99";
		//document.body.appendChild(canvas);
	}

	function Factory(name, height, width, index) {
		if (!screens[name]) {
			screens[name] = new Screen(name, height, width, index);
		}

		return screens[name];
	}

	var Screen = Class.extend({
		init: function(name, height, width, index) {
			index = index || 10;
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

			this.canvas = canvas;
			this.context = context;
			this.height = height;
			this.width = width;
			this.heightBlocks = height / bl;
			this.widthBlocks = width / bl;
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
		map: function(world, player, all) {
			this.clear();

			var edges = 50;
			var p = Math.min(8, ~~Math.min((this.height - edges) / world.height, (this.width - edges) / world.width) - 1);
			var eh = ~~((this.height - world.height * p) / 2);
			var ew = ~~((this.width - world.width * p) / 2);
			var pos = player.getLocation();
			var color;

			for (var x = 0; x < world.width; x++) {
				for (var y = 0; y < world.height; y++) {
					var px = ew + x * p;
					var py = eh + y * p;

					var tile = world.getTile(x, y);
					//don't bother if invisible
					if (tile.visited === true || all === true) {
						var o1 = (!tile.name.match(/sea$/)) ? (tile.info.tot - 0.5) * 3 + 0.25 : 1 - ((0.5 - tile.info.tot) * 2 + 0.25);
						var o2 = (o1 * 0.3 + 0.1);

						if (world.type === 'world') {
							if (tile.visible === true) {
								color = (!tile.name.match(/sea$/)) ? 'rgba(0,190,0,' + o1 + ')' : 'rgba(0,0,190,' + o1 + ')';
							} else if (tile.visited === true || all === true) {
								color = (!tile.name.match(/sea$/)) ? 'rgba(0,120,0,' + o2 + ')' : 'rgba(0,0,90,' + o2 + ')';
							}
						} else if (world.type === 'dungeon' && tile.name !== 'rock') {
							if (tile.visible === true) {
								color = (tile.name === 'wall') ? 'rgba(160, 160, 160, 1)' : 'rgba(120, 120, 120, 1)';
							} else if (tile.visited === true || all === true) {
								color = (tile.name === 'wall') ? 'rgba(50, 50, 50, 1)' : 'rgba(30, 30, 30, 1)';
							}
						}

						if (tile.name === 'road') {
							this.circle(color, px + p / 2, py + p / 2, p / 3);
						} else {
							this.rectangle(color, px, py, p);
						}

						if (tile.name === 'city') {
							this.circle((tile.visible) ? 'rgba(255,255,255,1)' : 'rgba(190,190,190,1)', px + p / 2, py + p / 2, p / 3);
						}

						if (tile.name === 'river') {
							this.circle((tile.visible) ? 'rgba(100,100,255,1)' : 'rgba(50,50,190,0.5)', px + p / 2, py + p / 2, p / 3);
						}

						if (tile.name.match(/ferry|highway/)) {
							this.circle((tile.visible) ? 'rgba(255,255,255,0.4)' : 'rgba(190,190,190,0.4)', px + p / 2, py + p / 2, p / 3);
						}

						color = null;
					}
				}
			}

			this.circle('red', ew + pos.w * p + p / 2, eh + pos.h * p + p / 2, p / 2)

		},
		draw: function(background, player, entities) {
			var offset = this.offset(player, background);
			this.clear();

			this._background(background, offset.w, offset.h);
			this._entity(player, offset.w, offset.h);
		},
		drawSelectedTile: function(x, y, tile) {
			this.box('white', x - 10, y - 10, 5, 15);
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

			var w = Math.min(background.width - this.width / bl, Math.max(0, p.w - (this.width / bl / 2)));
			var h = Math.min(background.height - this.height / bl, Math.max(0, p.h - (this.height / bl / 2)));
			return {
				h: h,
				w: w
			};
		},
		write: function(text, x, y, color) {
			var oldfont = this.context.font;
			this.context.font = "bold " + settings.screen.block + "px " + font
			x = x || 0;
			y = y || 0;
			this.context.fillStyle = color || "rgba(255,255,255,1)";
			var array = text.split('');

			for (var t = 0; t < array.length; t++) {
				this.context.fillText(array[t], (x + t * settings.screen.block), y);
			}
			this.context.font = oldfont;
		},
		special: function(array, func) {
			for (var x = 0; x < array.length; x++) {
				func(this.context, array[x])
			}
		},
		_entity: function(ent, offX, offY, color) {
			var p = ent.getLocation();
			var nx = (p.w - offX) * bl + 3;
			var ny = (p.h - offY) * bl + 12;
			this.context.fillStyle = color || "rgba(255,255,255,1)";
			this.context.fillText(ent.sign, nx, ny);
		},
		_background: function(world, offX, offY) {
			for (var x = 0; x < this.width / bl; x++) {
				for (var y = 0; y < this.height / bl; y++) {
					var xx = x + offX;
					var yy = y + offY;
					var px = xx * bl;
					var py = yy * bl;

					var tile = world.getTile(xx, yy);

					if (tile.visible === true) {
						this.context.drawImage(world.light, px, py, bl, bl, x * bl, y * bl, bl, bl);
					} else if (tile.visited === true) {
						this.context.drawImage(world.dark, px, py, bl, bl, x * bl, y * bl, bl, bl);
					}
				}
			}
		},
		circle: function(color, x, y, rad) {
			this.context.fillStyle = color;
			this.context.beginPath();
			this.context.arc(x, y, rad, 0, Math.PI * 2, true);
			this.context.closePath();
			this.context.fill();
		},
		rectangle: function(color, x, y, sides) {
			this.context.fillStyle = color;
			this.context.fillRect(x, y, sides, sides);
		},
		character: function(color, x, y, sign) {
			this.context.fillStyle = color;
			this.context.fillText(sign, x, y);
		},
		box: function(color, x, y, height, width) {
			height = height || bl;
			width = width || bl;
			color = color || 'rgba(255,255,255,1)';
			this.context.strokeStyle = color;
			this.context.strokeRect(x, y, height, width);
		}
	});

	//bit hacky I guess but I wanted the tile image generating logic in the screen
	//as well because this is where all the other visuals are
	function tileToImage(ctx, tile, posx, posy, size, light) {
		var cb, cf, color, background, dcolor, dbackground, sign, fcol, bcol;
		var opac = (light === true) ? 1 : 0.2;
		var opacb = ((tile.info.tot + tile.info.alt / 5) / 1.8) * opac;

		sign = tile.sign
		color = tile.color;
		background = tile.background;
		dcolor = tile.dcolor;
		dbackground = tile.dbackground;

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
		//if (light === true) {
		ctx.fillStyle = fcol;
		ctx.fillText(sign, posx * size + 3, posy * size + 13);
		//}
		if (tile.subtile.guid) {
			tileToImage(ctx, tile.subtile, posx, posy, size, light);
		}
	}

	Factory.tileToImage = tileToImage;

	return Factory;
});