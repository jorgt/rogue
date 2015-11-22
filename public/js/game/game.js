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

	var game,
		started = false;

	function Game() {

		log.urgent('[GAME]', 'starting to put the game together');

		var worldPromise = Lands.createPlane({
			type: 'world',
			options: {
				height: 75,
				width: 100,
				bank: tilebank
			}
		}).then(function(ret) {
			this.world = ret;
			this.player = player(this.world.background);
		}.bind(this));

		var promises = [worldPromise];

		this.create = function() {
			if (started === false) {
				return Promise.all(promises).then(function() {
					this.start();
					started = true;
				}.bind(this));
			}
		};

		this.offset = {
			h: 0,
			w: 0
		};

		//screen is square, so height twice!
		this.screen = screenManager('game', settings.screen.height, settings.screen.height, 1);
		this.screen.position(0, 0);
		this.screen.canvas.style.borderRight = "1px solid #111";
		this.screen.hide();

		this.time = time();

		this.paused = false;
	}

	Game.prototype.start = function() {
		// at the start, the player location needs to be set, and the grid needs to reflect to
		// player position. after that, draw the screen!
		this.player.setLocation(this.world.background.start[0], this.world.background.start[1]);
		this.player.update(this.world.background);
		this.offset = this.screen.offset(this.player, this.world.background);
		this.draw();
	};

	Game.prototype.draw = function() {
		this.screen.draw(this.world, this.player);

		//uncomment this to have a day/night feel
		//var h = Math.abs(12 - this.time.getTime().h) / 24;
		//this.screen.background("rgba(0,0,0,"+h+")");

		if (this.paused === true) {
			var center = this.screen.center();
			this.screen.background("rgba(0,0,0,0.8)");
			this.screen.write('Paused', center.x, center.y, 'rgba(255,0,0,1)');
		}
	};

	Game.prototype.update = function() {
		//the game paused thing is not very relevant after moving the key updates to their own loops.
		if (this.paused === false) {
			//update the grid with the player position, visible/visited grid
			this.player.update(this.world.background);

			//set the current player offset on the game object. 
			this.offset = this.screen.offset(this.player, this.world.background);

			//update the time a tiny bit, to have a bit of real-time time
			this.time.update(0.1, true);
		}
	};

	Game.prototype.move = function(x, y) {
		//move the player, and update the time with the new cost of movement
		if (this.paused === false) {
			this.player.move(this.world.background, x, y);
			this.time.update(this.player.cost);
		}
	};

	Game.prototype.getTile = function(x, y) {
		return this.world.background.getTile(x, y);
	};

	Game.prototype.pause = function() {
		this.paused = !this.paused;
	};

	return function() {
		if (!game) {
			game = new Game();
		}
		return game;
	};
});