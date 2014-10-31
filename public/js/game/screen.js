define(["helpers/log", "settings"], function(
	log, settings) {

	'use strict';
	/*
		module variables
	*/
	var _canvasses = {};
	var _active = null;
	var _screen = document.createElement('div');
	var _width = 0;
	var _height = 0;

	_screen.id = 'game-wrapper';
	_screen.className = 'center'
	_screen.style.fontSize = settings.font + 'px';
	document.body.appendChild(_screen);
	document.body.style.className = 'game';

	var Screen = {
		get: function(name) {
			var canvas = _canvasses[_name(name)];
			if (typeof canvas === 'undefined') {
				var canvas = new Canvas(_name(name));
				_canvasses[_name(name)] = canvas;
			}

			return canvas;
		},
		hide: function(elem) {
			if (typeof elem === 'string') {
				elem = _canvasses[_name(name)];
			} else if(elem instanceof Canvas) {
				elem = elem;
			}

			_screen.removeChild(elem.get())
		},

		show: function(elem) {
			if (typeof elem === 'string') {
				elem = _canvasses[_name(name)];
			} else if(elem instanceof Canvas) {
				elem = elem;
			}
			_screen.appendChild(elem.get())
			_active = elem;
			//log.high('[SCREEN]:', 'activating canvas:', elem.get().id)
		},

		setSize: function(h, w) {
			_width = _docWidth();
			_height = _docHeight();
			_screen.style.width = this.width + 'px';
			_screen.style.height = this.height + 'px';
		}
	}


	function Canvas(name) {

		var _canvas = document.createElement('pre');
		_canvas.id = name;
		_canvas.dataset.top = 0;
		_canvas.dataset.left = 0;
		_canvas.className = 'game-screen';

		this.add = function(obj) {
			_canvas.appendChild(obj);
		};

		this.remove = function(obj) {
			_canvas.removeChild(obj);
		};

		
		this.setSize = function(h, w) {
			_canvas.style.width = h + 'px';
			_canvas.style.height = w + 'px';
		};
		
		this.scroll = function(x, y) {
			_canvas.dataset.top = parseInt(_canvas.dataset.top) + x;
			_canvas.dataset.left = parseInt(_canvas.dataset.left) + y;
			_canvas.style.top = _canvas.dataset.top +'px';
			_canvas.style.left = _canvas.dataset.left +'px';
		};

		this.get = function() {
			return _canvas;
		};

		this.dimensions = function() {
			return _dimensions();
		};

		this.center = function() {
			return {
				height: _canvas.offsetHeight / 2 / settings.square,
				width: _canvas.offsetWidth / 2 / settings.square
			};
		};
	}

	function _name(name) {
		return 'screen-' + name;
	}

	function _docHeight() {
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
	}

	function _docWidth() {
		return Math.max(
			document.body.scrollWidth, document.documentElement.scrollWidth,
			document.body.offsetWidth, document.documentElement.offsetWidth,
			document.body.clientWidth, document.documentElement.clientWidth
		);
	}

	function _dimensions() {
		return {
			window: {
				width: _docWidth(),
				height: _docHeight()
			},
			canvas: {
				width: _active.get().offsetWidth,
				height: _active.get().offsetHeight,
				top: parseInt(_active.get().dataset.top),
				left: parseInt(_active.get().dataset.left)
			},
			screen: {
				width: _screen.offsetWidth,
				height: _screen.offsetHeight 
			}
		}
	}

	Screen.setSize();
	return Screen;
});