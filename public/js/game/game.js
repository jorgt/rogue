define([
	'helpers/log',
	'game/landtypes/world',
	'game/entities/player',
	'engine/screenmanager',
	'game/background',
	'game/time',
], function(log, world, player, ScreenManager, background, time) {
	'use strict';

	var game;

	log.urgent('[GAME]', 'starting to put the game together');

	function Game() {

		var worldPromise = background(world({
			height: 75,
			width: 100
		})).then(function(ret) {
			this.world = ret;
			this.player = player(this.world.background);
		}.bind(this));

		var promises = [worldPromise];

		this.create = function() {
			return Promise.all(promises).then(function() {
				this.start();
			}.bind(this));
		};

		this.offset = {
			h: 0,
			w: 0
		};

		this.screen = ScreenManager('game', 600, 600, 1);
		this.screen.position(0, 0);
		this.screen.hide();

		this.time = time();
	}

	Game.prototype.start = function() {
		// at the start, the player location needs to be set, and the grid needs to reflect to
		// player position. after that, draw the screen!
		this.player.setLocation(this.world.background.start[0], this.world.background.start[1]);
		this.player.update(this.world.background);
		this.draw();
	};

	Game.prototype.draw = function() {
		this.screen.draw(this.world, this.player);
	};

	Game.prototype.update = function() {
		//update the grid with the player position, visible/visited grid
		this.player.update(this.world.background);

		//set the current player offset on the game object. 
		this.offset = this.screen.offset(this.player, this.world.background);

		//update the time a tiny bit, to have a bit of real-time time
		this.time.update(0.1, true);
	};

	Game.prototype.move = function(x, y) {
		//move the player, and update the time with the new cost of movement
		this.player.move(this.world.background, x, y);
		this.time.update(this.player.cost);
	};

	Game.prototype.getTile = function(x, y) {
		return this.world.background.getTile(x, y);
	};

	return function() {
		if (!game) {
			game = new Game();
		}
		return game;
	};
});