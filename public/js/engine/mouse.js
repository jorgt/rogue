define(["helpers/log", "settings"], function(
	log,
	settings) {

	'use strict';

	return Mouse;

	function Mouse() {
		var _guid = guid();
		log.low('[MOUSE:' + _guid + ']', 'getting a new mouse object');
		var _elem = null;
		var _callbacks = {
			mouseup: [],
			mousedown: [],
			mousemove: [],
			mouseover: [],
			mouseout: []
		};

		this.up = function(func) {
			_register('mouseup', func);
		};

		this.down = function(func) {
			_register('mousedown', func);
		};


		this.move = function(func) {
			_register('mousemove', func);
		};

		this.setup = function(elem) {
			_elem = (typeof elem === 'string') ? document.getElementById(elem) : elem;
		
			_addEvent('mousemove', function(e) {
				for (var x = 0; x < _callbacks.mousemove.length; x++) {
					_gridHelper(e, _callbacks.mousemove[x]);
				}
			}.bind(this));

			_addEvent('mouseup', function(e) {
				for (var x = 0; x < _callbacks.mouseup.length; x++) {
					_gridHelper(e, _callbacks.mouseup[x]);
				}
			}.bind(this));

			_addEvent('mousedown', function(e) {
				for (var x = 0; x < _callbacks.mousedown.length; x++) {
					_gridHelper(e, _callbacks.mousedown[x]);
				}
			}.bind(this));
		};

		function _gridHelper(e, func) {
			var ret = {
				on: e.srcElement,
				tile: {
					height: ~~(parseInt(e.layerY) / settings.square),
					width: ~~(parseInt(e.layerX) / settings.square)
				}
			}
			func.call(this, ret);
		}

		function _register(type, func) {
			_callbacks[type].push(func);
		}


		// add event cross browser
		function _addEvent(e, fn) {
			// avoid memory overhead of new anonymous functions for every event handler that's installed
			// by using local functions
			function listenHandler(e) {
				var ret = fn.apply(this, arguments);
				if (ret === false) {
					e.stopPropagation();
					e.preventDefault();
				}
				return (ret);
			}

			function attachHandler() {
				// set the this pointer same as addEventListener when fn is called
				// and make sure the event is passed to the fn also so that works the same too
				var ret = fn.call(_elem, window.event);
				if (ret === false) {
					window.event.returnValue = false;
					window.event.cancelBubble = true;
				}
				return (ret);
			}

			if (_elem.addEventListener) {
				_elem.addEventListener(e, listenHandler, false);
			} else {
				_elem.attachEvent("on" + e, attachHandler);
			}
		}
	}

});