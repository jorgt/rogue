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
			if(x instanceof Array) {
				y = x[1];
				x = x[0];
			} else if (typeof x === 'object') {
				y = x.y || x.w;
				x = x.x || x.h;
			} 

			return this.grid[x][y];
		}
	});

	return Base;
});