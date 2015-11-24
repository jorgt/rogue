define([
	'settings',
	'helpers/log',
	'game/landtypes/world',
	'game/landtypes/landmanager',
	'game/entities/player',
	'game/screenmanager',
	'game/background',
	'game/time',
	'game/tilebank',
], function(settings, log, world, Lands, player, screenManager, background, time, tilebank) {
	'use strict';

	var game, promise, started = false;

	var Game = Class.extend({
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
			}

			this._selectedTile();
		},
		update: function() {
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

			if (!(this._mouseLocation.x === x && this._mouseLocation.y === y) && tile.visited === true) {
				this._mouseLocation = {
					x: x,
					y: y,
					px: loc.pixWidth,
					py: loc.pixHeight
				};
				log.low('[PLAY]', 'mouse location: ', x, y);
			} else if (this._mouseLocation.x === x && this._mouseLocation.y === y) {
				log.low('[PLAY]', 'reset mouse location');
				this._mouseLocation = {
					x: -1,
					y: -1,
					px: -1,
					py: -1
				};
			}
		},
		_selectedTile: function() {
			var x, y, s = settings.screen.block;

			if (this._mouseLocation.x > 0 && this._mouseLocation.y > 0) {
				//this snaps the line to the grid
				x = this._mouseLocation.px - this._mouseLocation.px % s;
				y = this._mouseLocation.py - this._mouseLocation.py % s;
				this.screen.box('rgba(255,0,0,1)', x, y, s, s);
				this.screen.rectangle('rgba(255,0,0,0.5)', x, y, s, s);
			}
		},
		_mouseLocation: {
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