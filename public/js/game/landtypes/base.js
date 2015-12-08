define(['graphics/screenmanager', 'settings'], function(screenManager, settings) {
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
			if (x instanceof Array) {
				y = x[1];
				x = x[0];
			} else if (typeof x === 'object') {
				y = x.y || x.w;
				x = x.x || x.h;
			}

			return this.grid[x][y];
		},
		changeTile: function(tile) {
			var size = settings.screen.block;
			screenManager.tileToImage(this.light.getContext('2d'), tile, size, size, true);
			screenManager.tileToImage(this.dark.getContext('2d'), tile, size, size, false);
		}
	});

	return Base;
});