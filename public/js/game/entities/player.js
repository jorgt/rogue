define(['game/entities/entity'], function(Entity) {
	'use strict';

	var player;


	var Player = Entity.extend({
		init: function() {
			this._super.apply(this, arguments);
			this.sign = '@';
		}
	})

	return function() {
		if(!player) {
			player = new Player();
		}
		return player;
	}
});