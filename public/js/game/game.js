define([
	'helpers/log',
	'game/landtypes/world',
	'game/entities/player',
	'game/screen',
	'game/background',
], function(log, world, player, scr, background) {
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
		}
	}

	Game.prototype.start = function() {
		this.player.setLocation(this.world.background.start[0], this.world.background.start[1]);
		//scr.draw(this.world, this.player);
		//this.player.update(this.world.background);
		//scr.draw(this.world, this.player);
	}

	Game.prototype.draw = function() {
		//console.time("draw");
		scr.draw(this.world, this.player);
		//console.timeEnd("draw");
	}

	Game.prototype.update = function() {
		//console.time("update");
		this.player.update(this.world.background);
		//console.timeEnd("update");
	}

	Game.prototype.move = function(x, y) {
		this.player.move(this.world.background, x, y);
	}

	Game.prototype.getTile = function(x, y) {
		return this.world.background.getTile(x, y);
	}

	return function() {
		if (!game) game = new Game();
		return game;
	}
});