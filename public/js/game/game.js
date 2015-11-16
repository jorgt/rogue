define([
	'helpers/log',
	'game/landtypes/world',
	'game/entities/player',
	'engine/screenmanager',
	'game/background',
], function(log, world, player, ScreenManager, background) {
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

		this.offset = {
			h: 0,
			w: 0
		}

		this.screen = ScreenManager('game', 600, 600, 1);
		this.screen.position(0, 0);
		this.screen.hide();
	}

	Game.prototype.start = function() {
		//debugger;
		this.player.setLocation(this.world.background.start[0], this.world.background.start[1]);
		this.player.update(this.world.background);
		this.screen.draw(this.world, this.player);
	}

	Game.prototype.draw = function() {
		//console.time("draw");
		this.screen.draw(this.world, this.player);
		//console.timeEnd("draw");
	}

	Game.prototype.update = function() {
		//var p = this.player.getLocation();
		this.player.update(this.world.background);
		this.offset = this.screen.offset(this.player, this.world.background);
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