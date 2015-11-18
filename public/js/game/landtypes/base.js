define([], function() {
	'use strict';

	var Base = Class.extend({
		init: function(g, s, e, h, w) {
			this.grid = g;
			this.start = s;
			this.end = e;
			this.height = h;
			this.width = w;
		},
		getTile: function(x, y) {
			if (typeof x === 'object') {
				y = x.y || x.w;
				x = x.x || x.h;
			}

			return this.grid[x][y];
		}
	});

	return Base;
});