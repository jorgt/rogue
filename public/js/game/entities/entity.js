define([], function() {
	'use strict';

	var Entity = Class.extend({
		init: function(options) {
			options = options || {};
			this.position = {
				h: options.y || 0,
				w: options.x || 0
			}
			this.sign = ' ';
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
				if (grid.canWalk(nx, ny) === true) {
					this.position.w += x;
					this.position.h += y;
				}
			}
		}
	});

	return Entity;
});