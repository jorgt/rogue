define([
	'settings',
	'helpers/log',
	'game/landtypes/world',
	'game/landtypes/landmanager',
	'game/entities/player',
	'graphics/screenmanager',
	'graphics/worldbuilder',
	'game/time',
	'game/tilebank',
], function(settings, log, world, Lands, player, screenManager, worldbuilder, time, tilebank) {
	'use strict';

	var game, promise, started = false;

	var Game = Class.extend({
		updateQueue: [],
		init: function() {
			log.urgent('[GAME]', 'starting to put the game together');

			Lands.createPlane({
				type: 'world',
				options: {
					height: 75,
					width: 100,
					bank: tilebank
				}
			}).then(function(world) {
				this.world = world;
				this.player = player(this.world);
				this.offset = {
					h: 0,
					w: 0
				};

				//screen is square, so height twice!
				this.screen = screenManager('game', settings.screen.height, settings.screen.height, 0);
				this.screen.position(0, 0);
				this.screen.canvas.style.borderRight = "1px solid #111";
				this.screen.hide();

				this.time = time();

				this.paused = false;
				this.start();
			}.bind(this));
		},
		start: function() {
			// at the start, the player location needs to be set, and the grid needs to reflect to
			// player position. after that, draw the screen!
			this.player.setLocation(this.world.start[0], this.world.start[1]);
			this.player.update(this.world);
			this.offset = this.screen.offset(this.player, this.world);
			this.draw();
		},
		addMouse: function(mouse) {
			mouse.setup('game-screen-game');

			//we need the x and y offset in the game, not just the screen
			mouse.up(function(e) {
				this._mouse(e.tile);
			}.bind(this));
		},
		addKeyboard: function(keyboard) {
			keyboard.press('left', function(e) {
				this.move(-1, 0);
			}.bind(this));

			keyboard.press('right', function(e) {
				this.move(1, 0);
			}.bind(this));

			keyboard.press('up', function(e) {
				this.move(0, -1);
			}.bind(this));

			keyboard.press('down', function(e) {
				this.move(0, 1);
			}.bind(this));

			keyboard.press('p', function(e) {
				this.pause();
			}.bind(this));
		},
		draw: function() {
			this.screen.draw(this.world, this.player);

			//uncomment this to have a day/night feel
			//var h = Math.abs(12 - this.time.getTime().h) / 24;
			//this.screen.background("rgba(0,0,0,"+h+")");

			if (this.paused === true) {
				var center = this.screen.center();
				this.screen.background("rgba(0,0,0,0.8)");
				this.screen.write('Paused', center.x, center.y, 'rgba(255,0,0,1)');
			} else {
				//this._selectedTile();
			}
		},
		drawSidebar: function(src) {
			var sidex = this.screen.width + 10;
			var sidey = 30;
			var secondcol = 20;
			var no = 1;
			var mx = this._mouseLocation.x;
			var my = this._mouseLocation.y;
			var t = this.time.getTime();
			var tile;

			src.write('Player', sidex, sidey + 20 * no++);

			src.write('health:', sidex + settings.screen.block, sidey + 20 * no);
			src.write(String(this.player.stats.health), sidex + settings.screen.block * secondcol, sidey + 20 * no++);

			src.write('hunger:', sidex + settings.screen.block, sidey + 20 * no);
			src.write(String(this.player.status.hunger), sidex + settings.screen.block * secondcol, sidey + 20 * no++);

			no++;

			src.write('Time', sidex, sidey + 20 * no++);
			src.write(t.d + ' days,', sidex + settings.screen.block, sidey + 20 * no++);
			src.write(t.h + ' hours,', sidex + settings.screen.block, sidey + 20 * no++);
			src.write(t.m + ' minutes', sidex + settings.screen.block, sidey + 20 * no++);

			no++

			if (this._mouseLocation.tile && this._mouseLocation.tile.selected === true) {
				tile = this.getTile(mx, my);
				src.write('Tile at ' + mx + ',' + my + ': ' + tile.name, sidex, sidey + 20 * no++);

				src.write('altitude:', sidex + settings.screen.block, sidey + 20 * no);
				src.write(String(tile.info.climate.alt), sidex + settings.screen.block * secondcol, sidey + 20 * no++);

				src.write('temperature:', sidex + settings.screen.block, sidey + 20 * no);
				src.write(String(tile.info.climate.temp), sidex + settings.screen.block * secondcol, sidey + 20 * no++);

				src.write('precipitation:', sidex + settings.screen.block, sidey + 20 * no);
				src.write(String(tile.info.climate.prec), sidex + settings.screen.block * secondcol, sidey + 20 * no++);
			}
		},
		update: function() {
			var t = this.world.getTile(20, 20);
			t.sign = ['1', '2', '3'][~~(Math.random() * 3)];

			this.world.changeTile(t);
			//the game paused thing is not very relevant after moving the key updates to their own loops.
			if (this.paused === false) {
				//update the grid with the player position, visible/visited grid
				this.player.update(this.world);

				//set the current player offset on the game object. 
				this.offset = this.screen.offset(this.player, this.world);

				//update the time a tiny bit, to have a bit of real-time time
				this.time.update(0.1, true);
			}
		},
		move: function(x, y) {
			//move the player, and update the time with the new cost of movement
			if (this.paused === false) {
				this.player.move(this.world, x, y);
				this.time.update(this.player.cost);
				if (this._mouseLocation.set) {
					this._mouseLocation.px += -1 * x * settings.screen.block;
					this._mouseLocation.py += -1 * y * settings.screen.block;
				}
			}
		},
		getTile: function(x, y) {
			return this.world.getTile(x, y);
		},
		pause: function() {
			this.paused = !this.paused;
		},
		_mouse: function(loc) {
			var x = loc.width + this.offset.w,
				y = loc.height + this.offset.h,
				tile = this.world.getTile(x, y);

			if ((!(this._mouseLocation.x === x && this._mouseLocation.y === y) || this._mouseLocation.set === false) && tile.visited === true) {
				if (this._mouseLocation.tile) this._mouseLocation.tile.selected = false;
				tile.selected = true;
				this._mouseLocation = {
					tile: tile,
					set: true,
					x: x,
					y: y,
					px: loc.pixWidth,
					py: loc.pixHeight
				};
				log.low('[PLAY]', 'mouse location: ', x, y);
			} else if (this._mouseLocation.x === x && this._mouseLocation.y === y) {
				log.low('[PLAY]', 'reset mouse location');
				this._mouseLocation.set = false;
				this._mouseLocation.tile.selected = false;
			}
		},
		_mouseLocation: {
			set: false,
			x: -1,
			y: -1,
			px: -1,
			py: -1
		}
	});

	return function() {
		if (started === false) {
			started = true;
			promise = new Promise(function(resolve) {
				game = new Game();
				resolve(game);
			});
		}
		return promise;
	};
});