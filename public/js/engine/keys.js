/*
	Engine.Keys

	Usage
	- for single action no matter how long key is held:

	  	keys.press('key', callback);

	  		or

	  	keys.on('key', callback, false)

	- for continuous execution, so when key is held

		keys.hold('key', callback)

			or

		keys.on('key', callback, true)

	- use keys._realtime to switch the auto-updating function on or
	  off. If it's own, it'll call animation frame itself, else
	  the calling program will have to do keys.update in it's own loop.

	- for values of 'key', see mapping table below.

	- combinations are possible! 'key+key'
	
*/
define(["helpers/log"], function(
	log) {

	'use strict';

	var MAP = {
		65: 'a',
		66: 'b',
		67: 'c',
		68: 'd',
		69: 'e',
		70: 'f',
		71: 'g',
		72: 'h',
		73: 'i',
		74: 'j',
		75: 'k',
		76: 'l',
		77: 'm',
		78: 'n',
		79: 'o',
		80: 'p',
		81: 'q',
		82: 'r',
		83: 's',
		84: 't',
		85: 'u',
		86: 'v',
		87: 'w',
		88: 'x',
		89: 'y',
		90: 'z',
		13: 'enter',
		16: 'shift',
		17: 'ctrl',
		18: 'alt',
		27: 'esc',
		32: 'space',
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	var MAP_INVERSE = {};
	for (var m in MAP) {
		if (MAP.hasOwnProperty(m)) {
			MAP_INVERSE[MAP[m]] = m;
		}
	}

	function Keys(rt) {
		var _guid = guid();
		log.med('[KEYS:' + _guid + ']', 'getting a new key object');
		var _realtime = rt;

		this.keys = new Array(222);
		this.callbacks = {
			press: {},
			hold: {}
		};
		for (var k in MAP) {
			if (MAP.hasOwnProperty(k)) {
				this.keys[k] = {
					press: false,
					hold: false
				};
			}
		}

		this.activate = function() {
			log.med('[KEYS:' + _guid + ']', 'activating key set');
			document.onkeyup = this.__keyup.bind(this);
			document.onkeydown = this.__keydown.bind(this);
			this.__loop();
		};

		this.press = function(key, callback) {
			log.low('[KEYS:' + _guid + ']', 'adding key press:', key);
			this.callbacks.press[clean(key)] = callback;
		};

		this.hold = function(key, callback) {
			log.low('[KEYS:' + _guid + ']', 'adding key hold:', key);
			this.callbacks.hold[clean(key)] = callback;
		};

		this.on = function(key, callback, hold) {
			if (hold === true) {
				this.hold(key, callback);
			} else {
				this.press(key, callback);
			}
		};

		this.set_realtime = function(rt) {
			_realtime = rt;
			log.low('[KEYS:' + _guid + ']', 'setting real time keys to:', rt);
			this.__loop();
		};

		this.update = function() {
			for (var ns in this.callbacks) {
				if (this.callbacks.hasOwnProperty(ns)) {
					for (var c in this.callbacks[ns]) {
						if (this.callbacks[ns].hasOwnProperty(c)) {
							var ok = true;
							var keys = c.split('+');
							for (var key in keys) {
								if (keys.hasOwnProperty(key)) {
									ok = ok && this.keys[MAP_INVERSE[keys[key]]][ns];
									//press is ONCE, so disable after first detection. 
									//only need to do this for registered callbacks, 
									//the others are irrelevant because unused
									if (ns === 'press') {
										this.keys[MAP_INVERSE[keys[key]]][ns] = false;
									}
								}
							}
							if (ok) {
								this.callbacks[ns][c](keys);
							}
						}
					}
				}
			}

			this.__loop();
		};

		this.__loop = function() {
			if (_realtime === true) {
				window.requestAnimFrame(function() {
					this.update();
				}.bind(this));
			}
		};

		this.__keyup = function(event) {
			this.__released(event.keyCode);
			//event.preventDefault()
			//return false;
		};

		this.__keydown = function(event) {
			this.__pressed(event.keyCode);
			//event.preventDefault()
			//return false;
		};

		this.__pressed = function(key) {
			if (typeof this.keys[key] !== 'undefined') {
				this.keys[key].press = true;
				if (this.keys[key].hold === true) {
					this.keys[key].press = false;
				} else {
					this.keys[key].press = true;
				}

				this.keys[key].hold = true;
			}
		};

		this.__released = function(key) {
			if (typeof this.keys[key] !== 'undefined') {
				this.keys[key] = {
					press: false,
					hold: false
				};
			}
		};

		function clean(str) {
			return str.toLowerCase().replace(/\s/g, '');
		}

		this.set_realtime(_realtime);
	}

	return Keys;
});