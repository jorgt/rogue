define([
	'helpers/log',
	'game/landtypes/world',
	'game/entities/player',
	'game/screen',
	'game/canvas',
], function(log, world, player, scr, canvas) {
	'use strict';

	var game;

	log.urgent('[GAME]', 'starting to put the game together');

	function Game() {
		this.player = player();

		var worldPromise = canvas(world({
			height: 75,
			width: 100
		})).then(function(ret) {
			this.world = ret;
		}.bind(this));

		var promises = [worldPromise];

		this.create = function() {
			return Promise.all(promises).then(function() {
				this.start();
			}.bind(this));
		}
	}

	Game.prototype.start = function() {
		this.player.setLocation(this.world.grid.start[0], this.world.grid.start[1])
	}

	Game.prototype.draw = function() {
		scr.draw(this.world, this.player);
	}

	Game.prototype.update = function() {

	}

	Game.prototype.move = function(x, y) {
		this.player.move(this.world.grid, x, y);
	}

	return function() {
		if (!game) game = new Game();
		return game;
	}
});