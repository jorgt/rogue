define([], function() {
	'use strict';

	var Entity = Class.extend({
		init: function(options) {
			options = options || {};
			this.position = {
				h: options.y || 0,
				w: options.x || 0
			};
			this.sign = ' ';
			this.color = 'rgba(255,255,255,1)';
			this.moves = 0;
			this.cost = 0;
			this.stats = {
				health: 0, //how dead you are. 0 is dead.
				melee: 0, //skills in melee. unlocks skills/moves
				magic: 0, //skills in magic. unlocks skills/moves.
				speed: 0, //how quick your action points replenish
				ap: 0, //how many action points you have
				xp: 0, //experience points
			};
			this.status = {
				hunger: 0, //how hungry you are
				thirst: 0, //how thirsty you are
				cold: 0, //hypothermia!
				drowning: 0 //if you're drowing
			}
			this.skills = {
				melee: {

				},
				magic: {

				}
			}
		},
		setLocation: function(x, y) {
			this.position.w = x;
			this.position.h = y;
		},
		getLocation: function() {
			return this.position;
		},
		move: function(grid, x, y) {
			var nx = this.position.w + x;
			var ny = this.position.h + y;
			if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height) {
				var tile = grid.getTile(nx, ny);
				if (tile.speed > 0) {
					this.position.w += x;
					this.position.h += y;
					this.moves++;
					this.cost += tile.cost;
				}
			}
		},
		draw: function(ctx, offx, offw) {
			//draw
		}
	});

	return Entity;
});