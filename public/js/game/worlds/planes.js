define([
	"helpers/log",
	"game/worlds/world",
	//"game/worlds/land",
	"game/worlds/dungeon",
	], function(
	log,
	world,
	//Land,
	dungeon) {

	'use strict';

	var _active;
	var _planes = {};

	function Plane(o) {
		var _func;
		switch (o.type) {
			case 'world':
				_func = _world;
				break;
			case 'land':
				_func = _land
				break;
			case 'dungeon':
				_func = _dungeon;
				break;
		}

		var plane = _func(o.options);

		this.getGrid = function() {
			return plane.grid;
		};

		this.enter = function() {
			return {
				start: plane.start,
				end: plane.end
			}
		}

		this.size = function() {
			return {
				x: plane.height,
				y: plane.width
			}
		}

		this.get = function(x, y) {
			if (x instanceof Array) {
				y = x[1];
				x = x[0];
			}
			return plane.grid[x][y];
		}
	}

	function _world(o) {
		return world(o)
	}

	function _land(o) {

	}

	function _dungeon(o) {
		return dungeon(o)
	}

	function _guid() {
		return~~ (Math.random() * 1000000);
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
			var o = new Plane(opt);
			o.name = _guid();
			o.type = opt.type;
			_planes[o.name] = o;
			return o;
		},
		attachPlane: function(o, x, y, plane) {
			if (plane instanceof Plane === false) {
				plane = Lands.createPlane(plane);
			}
			o.grid[x][y] = plane.name
		}
	};

	return Lands;
})