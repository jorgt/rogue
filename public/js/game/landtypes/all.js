define([
	"helpers/log",
	"game/landtypes/world",
	"game/landtypes/land",
	"game/landtypes/dungeon",
], function(
	log,
	world,
	land,
	dungeon) {

	'use strict';

	var _active;
	var _planes = {};
	var _funcs = {
		world: world,
		dungeon: dungeon,
		land: land
	}

	var Lands = {
		getPlane: function(id) {
			return _planes[id]
		},
		getPlanes: function() {
			return _planes;
		},
		getGrid: function(id) {
			return Lands.getPlane(id).grid
		},
		createPlane: function(opt) {
			opt = opt || {};
			try {
				var o = _funcs[opt.type](opt.options);
				o._guid = guid();
				o.type = opt.type;
				_planes[o.name] = o;
				return o;
			} catch(e) {
				throw new Error("There is no land type: "+ opt.type);
			}
		}
	};

	return Lands;
})