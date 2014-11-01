define(["helpers/log", "game/tilebank", "settings", "game/lightsource"], function(
	log,
	bank,
	settings,
	LightSource) {

	'use strict';


	function Assets(name) {
		var _name = name || 'game';
		var _size = settings.square;
		var _assets = [];
		var _actors = {
			player: null
		}

		this.text = function(text, x, y) {
			var txt = this.object({
				sign: text,
				name: 'text'
			}, x, y);

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

			obj.dataset.top = _int(_loc(x));
			obj.dataset.left = _int(_loc(y));
			obj.dataset.name = _createName(type.name);

			obj.className = _createName() + ' ' + obj.dataset.name;
			obj.style.width = _size + 'px';
			obj.style.height = _size + 'px';

			_assets[x] = _assets[x] || [];
			_assets[x][y] = obj;
			//_assets[obj.dataset.name].push(obj);

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
				offset = offset || true;
				if (offset) {
					this.dataset[data] = _int(this.dataset[data]) + _int(_loc(value));
				} else {
					this.dataset[data] = _loc(value);
				}
			};

			obj.visible = function(bool) {
				this.dataset.visible = bool;
			};

			obj.visited = function(bool) {
				this.dataset.visited = bool;
			};

			obj.position = function() {
				return [this.get('top') / _size, this.get('left') / _size]
			}

			obj.get = function(data) {
				return _int(this.dataset[data]);
			};

			function _int(n) {
				return parseInt(n);
			}

			obj.draw();
			return obj;
		};

		this.player = function(x, y, map) {
			if (_actors.player === null) {
				var player = this.object(bank.get('player'), x, y, 'player');
				player.dataset.visible = true;
				player.dataset.visited = true;
				player.visited = function() {}
				player.visible = function() {}
				player.view = new LightSource(map, [x, y], 7);
				_actors.player = player;
				return _moveable(player);
			} else {
				return _actors.player;
			}
		};

		this.get = function(x, y) {
			if (x instanceof Array) {
				y = x[1];
				x = x[0];
			}
			return _assets[x][y];
		};

		function _moveable(moveable) {
			moveable.className += ' game-actor';
			moveable.move = function(grid, x, y) {
				if (grid[this.get('top') / _size + x] && grid[this.get('top') / _size + x][this.get('left') / _size + y]) {
					var tile = grid[this.get('top') / _size + x][this.get('left') / _size + y];
					if (tile.walkable === true) {
						this.set('left', y, true);
						this.set('top', x, true);
					}
				}
			};
			return moveable;
		};

		function _loc(n) {
			return parseInt(n) * _size;
		}

		function _flatten(obj) {
			var ret = [];
			for (var o in obj) {
				if (obj.hasOwnProperty(o)) {
					for (var a in obj[o]) {
						if (obj[o].hasOwnProperty(a)) {
							ret.push(obj[o][a]);
						}
					}
				}
			}

			return ret;
		}

		function _createName(type) {
			return (type) ? _name + '-object-' + type : _name + '-object';
		}

	}

	return Assets;
});