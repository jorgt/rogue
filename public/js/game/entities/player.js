define([
	'game/entities/entity',
	'game/lightsource'
], function(Entity, Light) {
	'use strict';

	var player;


	var Player = Entity.extend({
		init: function(grid) {
			this._super.apply(this, arguments);
			this.sign = '@';
			this.radius = 10;
			this.light = this._changeLight(grid);
		},
		update: function(grid) {
			var light = this.light.update(this.getLocation(), grid, true);
		},
		_changeLight: function(grid) {
			return new Light(grid, this.getLocation(), this.radius)
		}
	});

	return function() {
		if (!player) {
			player = new Player();
		}
		return player;
	};
});