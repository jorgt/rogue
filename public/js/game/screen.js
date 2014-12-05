define(["helpers/log","helpers/events", "settings"], function(
	log, Events, settings) {

	'use strict';

	var _parent = null;

	function _screenDecorator(parent, name, h, w) {
		var elem = document.createElement('div');
		if (parent.id) {
			elem.id = parent.id + '-'
		}
		elem.id += name;
		elem.parent = parent;
		elem.style.position = 'absolute';
		elem.dataset.top = 0;
		elem.dataset.left = 0;
		elem.classList.add('game-screen');
		elem.classList.add('center');
		var z = parseInt(parent.style.zIndex) || 0;
		elem.style.zIndex = z + 1;
		elem.subs = [];

		if (typeof w !== 'number') {
			w = parent.dataset.width
			elem.dataset.widthtype = 'dynamic';
		} else {
			elem.dataset.widthtype = 'fixed';
		}
		if (typeof h !== 'number') {
			h = parent.dataset.height
			elem.dataset.heighttype = 'dynamic';
		} else {
			elem.dataset.heighttype = 'fixed';
		}

		elem.position = function(opt) {
			var movew = this.dataset.width / (this.parent.subs.length - 1)
			for (var x = 0; x < this.parent.subs.length; x++) {
				if (this.parent.subs[x] === this) {
					if (opt === 'left') {
						this.dataset.left = (this.parent.dataset.width - this.dataset.width);
					} else if (opt === 'right') {
						this.dataset.left = 0;
					}
					this.dataset.position = opt;
				} else {
					this.parent.subs[x].dataset.width -= movew;
					if (opt === 'right') {
						this.parent.subs[x].dataset.left = movew;
					}
				}
				this.parent.subs[x].parse();
			}
			return this;
		}

		elem.size = function(h, w) {
			this.dataset.width = w;
			this.dataset.height = h;

			var sw = 0;
			var sh = 0;
			for (var x = 0; x < this.subs.length; x++) {
				if (this.subs[x].dataset.widthtype === 'dynamic') {
					sw = w;
				} else {
					sw = parseInt(this.subs[x].dataset.width);
				}
				if (this.subs[x].dataset.heighttype === 'dynamic') {
					sh = h;
				} else {
					sh = parseInt(this.subs[x].dataset.height);
				}
				this.subs[x].size(sh, sw);
				if (this.subs[x].dataset.position) {
					this.subs[x].position(this.subs[x].dataset.position);
				}
				this.subs[x].parse();
			}
			return this;
		};

		elem.parse = function() {
			this.style.height = this.dataset.height + 'px';
			this.style.width = this.dataset.width + 'px';
			this.style.top = this.dataset.top + 'px';
			this.style.left = this.dataset.left + 'px';
		};

		elem.get = function(name, h, w) {
			var sub = this.independent(name, h, w);
			this.subs.push(sub);
			return sub;
		};

		elem.independent = function(name, h, w) {
			if (typeof name === 'undefined') {
				throw new Error('name is mandatory');
			}
			var child = _screenDecorator(this, name, h, w);
			return child;
		}

		elem.remove = function(e) {
			if (typeof e === 'string') {
				e = document.getElementById(this.id + '-' + e);
			}
			this.removeChild(e);
		};

		elem.add = function(elem) {
			this.appendChild(elem);
			return this;
		};

		elem.show = function() {
			this.parent.appendChild(this);
			return this;
		}

		elem.hide = function() {
			try {
				this.parent.removeChild(this);
			} catch(e) {}
			return this;
		}

		elem.scroll = function(x, y) {
			this.dataset.top = parseInt(this.dataset.top) + x;
			this.dataset.left = parseInt(this.dataset.left) + y;
			this.parse();
		};

		elem.dimensions = function() {
			return {
				window: viewport(),
				canvas: {
					width: this.offsetWidth,
					height: this.offsetHeight,
					top: parseInt(this.dataset.top),
					left: parseInt(this.dataset.left)
				},
				parent: {
					width: this.parent.offsetWidth,
					height: this.parent.offsetHeight,
					top: parseInt(this.parent.dataset.top),
					left: parseInt(this.parent.dataset.left)
				},
				screen: {
					width: this.parent.offsetWidth,
					height: this.parent.offsetHeight
				},
				top: {
					width: _parent.offsetWidth,
					height: _parent.offsetHeight
				}
			}
		};

		elem.center = function() {
			return {
				height: this.offsetHeight / 2,
				width: this.offsetWidth / 2
			};
		};

		elem.size(h, w);
		elem.parent.appendChild(elem);
		elem.parse();
		if (_parent === null) {
			_parent = elem;
			_parent.id = 'game'
			_parent.size(41*15, 41*15+300);
			_parent.parse();
			//_parent.classList.remove('game-screen');
		}
		return elem;
	}

	window.onresize = function(e) {
		var port = viewport();
		_parent.parse();
		Events.raise('game.screen.resize', {dimensions:_parent.dimensions()})
	}

	return _screenDecorator(document.body, 'game', viewport().height, viewport().width)

	function viewport() {
		var e = window,
			a = 'inner';
		if (!('innerWidth' in window)) {
			a = 'client';
			e = document.documentElement || document.body;
		}
		return {
			width: e[a + 'Width'],
			height: e[a + 'Height']
		}
	}
});