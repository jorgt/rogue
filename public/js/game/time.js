define(['settings', 'helpers/log'], function(settings, log) {
	'use strict';

	var time;

	function Time() {

		log.low('[TIME]', 'creating a new time object');

		var
			secondsPerMovement = 85,
			last = {},
			timers = {},
			current = 0,
			minutes = 0,
			hours = 0,
			days = 0,
			months = 0,
			years = 0;

		this.update = function(movement, incremental) {
			if (incremental === true) {
				current += movement * secondsPerMovement;
			} else {
				current = movement * secondsPerMovement;
			}

			//console.log(movement, current, secondsPerMovement)

			minutes = Math.floor(current / 60);
			hours = Math.floor(minutes / 60);
			minutes = minutes % 60;
			days = Math.floor(hours / 24);
			hours = hours % 24;

			for (var x in timers) {
				if (timers.hasOwnProperty(x)) {
					var destroy = timers[x].update();
					if (destroy === true) {
						timers[x] = null;
						delete timers[x];
					}
				}
			}

		};
		this.get = function(id, retrieve) {
			var ret = {
				m: minutes,
				h: hours,
				d: days
			};

			if (id) {
				last[id] = ret;
			}

			return ret;
		}
		this.last = function(id) {
			return last[id];
		}
		this.toSeconds = function(t) {
			t.m = t.m || 0;
			t.h = t.h || 0;
			t.d = t.d || 0;
			return t.m * 60 + t.h * 60 * 60 + t.d * 60 * 60 * 24;
		}
		this.timer = function(id, t, c) {
			if (!timers[id]) {
				t.m = t.m || 0;
				t.d = t.d || 0;
				t.y = t.y || 0;
				var self = this;

				var s = clone(this.get());
				timers[id] = new Timer(this, s, t, c);

				function Timer(time, start, target, callback) {
					var _g = Math.random() * 100000;
					var s = time.toSeconds(start);
					var t = time.toSeconds(target);
					this.update = function() {
						var c = time.toSeconds(time.get());

						if (c < s + t) {
							return false;
						} else {
							var x = Math.ceil((c - s - t) / t) + 1;
							while (x--) {
								callback();
							}
							return true;
						}
					}
				}
			}

			return timers[id];
		}
	}

	function clone(obj) {
		if (obj == null || typeof(obj) != 'object')
			return obj;
		var temp = new obj.constructor();
		for (var key in obj)
			temp[key] = clone(obj[key]);
		return temp;
	}

	return function() {
		if (!time) time = new Time();

		return time;
	}
});