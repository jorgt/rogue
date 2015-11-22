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
			if (grid.type === 'dungeon') this.radius = 5;
			if (grid.type === 'world') this.radius = 10;
			
			this.light.changeRadius(this.radius);
			this.light.update(this.getLocation(), grid, grid.type !== 'dungeon');
		},
		_changeLight: function(grid) {
			return new Light(grid, this.getLocation(), this.radius);
		},
		getVisible: function(ctx) {
			return this.light.current;
		}
	});

	return function() {
		if (!player) {
			player = new Player();
		}
		return player;
	};
});