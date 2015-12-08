define([
	"helpers/log",
	"graphics/worldbuilder",
	"game/landtypes/world",
	"game/landtypes/land",
	"game/landtypes/dungeon",
], function(
	log,
	worldbuilder,
	world,
	land,
	dungeon) {

	'use strict';

	var _planes = {};
	var _funcs = {
		world: world,
		dungeon: dungeon,
		land: land
	};

	var Lands = {
		getPlane: function(id) {
			return _planes[id];
		},
		getPlanes: function() {
			return _planes;
		},
		getGrid: function(id) {
			return Lands.getPlane(id).grid;
		},
		createPlane: function(opt) {
			opt = opt || {};
			if (!_funcs[opt.type]) {
				throw new Error("There is no land type: " + opt.type);
			}

			var o = _funcs[opt.type](opt.options);
			o._guid = guid();
			o.type = opt.type;
			_planes[o.name] = o;
			return worldbuilder(o);
		}
	};

	return Lands;
});