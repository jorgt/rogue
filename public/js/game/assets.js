define(["helpers/log", "game/tilebank", "settings", "game/lightsource"], function(
	log,
	bank,
	settings,
	LightSource) {

	'use strict';

	function Assets(name) {
		var _name = name || 'game';
		var _actors = {
			player: null
		}

		this.text = function(text, x, y) {
			var txt = _decorateText(this.object({
				sign: text,
				name: 'text'
			}, x, y));

			txt.dataset.visible = true;
			txt.dataset.visited = true;
			txt.draw();
			return txt;
		};

		this.object = function object(type, x, y, id) {
			var obj = document.createElement('pre');
			obj.innerHTML = type.sign;
			if (id) {
				obj.id = id;
			}

			obj.dataset.top = _int(_locToPx(x || 0));
			obj.dataset.left = _int(_locToPx(y || 0));
			obj.dataset.name = _createName(type.name);

			obj.className = _createName() + ' ' + obj.dataset.name;
			obj.style.width = settings.square + 'px';
			obj.style.height = settings.square + 'px';

			obj = _decorateObject(obj, type);
			obj.draw();
			return obj;
		};

		this.player = function(map, x, y) {
			if (_actors.player === null) {
				var player = this.object(bank.get('player'), x, y, 'player');
				_actors.player = player;
				return _decoratePlayer(_decorateMoveable(player), map, x, y);
			} else {
				return _actors.player;
			}
		};

		function _createName(type) {
			return (type) ? _name + '-object-' + type : _name + '-object';
		}

	}

	return Assets;

	function _decorateMoveable(obj) {
		obj.className += ' game-actor';
		obj.move = function(grid, x, y) {
			var newx = 0,
				newy = 0;
			if (x > 0) {
				newx = (_pxToLoc(this.get('top')) === grid.length - 1) ? -1 * (grid.length - 1) : x;
			} else if (x < 0) {
				newx = (_pxToLoc(this.get('top')) === 0) ? (grid.length - 1) : x;
			}

			if (y > 0) {
				newy = (_pxToLoc(this.get('left')) === grid.length - 1) ? -1 * (grid.length - 1) : y;
			} else if (y < 0) {
				newy = (_pxToLoc(this.get('left')) === 0) ? (grid.length - 1) : y;
			}

			var tile = grid[_pxToLoc(this.get('top')) + newx][_pxToLoc(this.get('left')) + newy].tile;
			if (bank.get(tile).walkable === true) {
				this.set('left', newy, true);
				this.set('top', newx, true);
			}
		};
		return obj;
	}

	function _decoratePlayer(obj, map, x, y) {
		obj.dataset.visible = true;
		obj.dataset.visited = true;
		//unlike everything else, player is always visible
		obj.visited = function() {};
		obj.visible = function() {};
		obj.view = new LightSource(map, [x, y], 7);
		return obj;
	}

	function _decorateText(obj) {
		obj.setText = function(val) {
			this.innerHTML = val;
		}
		return obj;
	}

	function _decorateObject(obj, type) {
		obj.tile = type.name;
		obj.info = type.info;
		obj.draw = function() {
			var px = ['top', 'fontSize', 'left'];
			for (var o in px) {
				if (px.hasOwnProperty(o)) {
					obj.style[px[o]] = this.dataset[px[o]] + 'px';
				}
			}
			var cls = ['visible', 'visited'];
			for (var o in cls) {
				if (cls.hasOwnProperty(o)) {
					var bool = this.dataset[cls[o]];
					var addcls = (bool === "true") ? cls[o] : 'not' + cls[o];
					var removecls = (bool === "false") ? cls[o] : 'not' + cls[o];
					this.classList.remove(removecls)
					this.classList.add(addcls)
				}
			}
		};

		obj.set = function(data, value, offset) {

			if (typeof value === 'number') {
				offset = offset || true;
				if (offset) {
					this.dataset[data] = _int(this.dataset[data]) + _int(_locToPx(value));
				} else {
					this.dataset[data] = _locToPx(value);
				}
			} else {
				this.dataset[data] = value
			}
		};

		obj.visible = function(bool) {
			this.dataset.visible = bool;
		};

		obj.visited = function(bool) {
			this.dataset.visited = bool;
		};

		obj.position = function() {
			return [this.get('top') / settings.square, this.get('left') / settings.square]
		}

		obj.get = function(data) {
			var v = _int(this.dataset[data]);
			return (isNaN(v)) ? this.dataset[data] : v;
		};

		obj.set('child', false);
		return obj;
	}

	function _locToPx(n) {
		return parseInt(n) * settings.square;
	}

	function _pxToLoc(n) {
		return parseInt(n) / settings.square;
	}

	function _int(n) {
		return parseInt(n);
	}

});