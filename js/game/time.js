define(['settings', 'helpers/log'], function(settings, log) {
	'use strict';

	var time;

	function Time() {

		log.low('[TIME]', 'creating a new time object');

		var
			secondsPerMovement = 85,
			last = {},
			timers = {},
			current = 0

		this.update = function(movement, incremental) {
			if (incremental === true) {
				current += movement * secondsPerMovement;
			} else {
				current = movement * secondsPerMovement;
			}

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
			var minutes = Math.floor(current / 60);
			var hours = Math.floor(minutes / 60);
			var minutes = minutes % 60;
			var days = Math.floor(hours / 24);
			var hours = hours % 24;

			var ret = {
				m: minutes,
				h: hours,
				d: days
			};

			if (id) {
				last[id] = ret;
			}

			return ret;
		};

		this.last = function(id) {
			return last[id];
		};

		this.toSeconds = function(t) {
			if (typeof t === 'object') {
				t.m = t.m || 0;
				t.h = t.h || 0;
				t.d = t.d || 0;
				return t.m * 60 + t.h * 60 * 60 + t.d * 60 * 60 * 24;
			} else if (typeof t === 'number') {
				return t;
			}
			throw new Error('Feed this a time object in s,h,d or just a number of seconds');
		};

		this.timer = function(id, target, callback) {
			if (!timers[id]) {
				var t = this.toSeconds(target);
				var s = this.toSeconds(clone(this.get()));
				timers[id] = new Timer(this, s, t, callback);
			}

			return timers[id];
		};

		this.interval = function(id, target, interval, callback) {
			if (!timers[id]) {
				var i = this.toSeconds(interval);
				var s = this.toSeconds(clone(this.get()));
				timers[id] = new Interval(this, s, target, i, callback);
			}

			return timers[id];
		};

		this.realtime = function(duration, callback) {
			var id = ~~(Math.random() * 100000000)
			timers[id] = new RealTime(duration, callback)
		}
	}

	//in target number of in game time, do execute function
	function Timer(time, start, target, callback) {
		this.update = function() {
			var current = time.toSeconds(clone(time.get()));

			if (current < start + target) {
				return false;
			} else {
				callback();
				return true;
			}
		}
	}

	//for the next [target number of in game time], execute callback every [interval
	//number of in game time]s
	function Interval(time, start, target, interval, callback) {
		var times = 0;
		this.update = function() {

			var current = time.toSeconds(time.get());

			//if its within the interval
			if (times < target) {
				var passed = current - start;
				if (passed > interval * times) {
					var x = Math.floor((passed - interval * times) / interval);
					x = (times + x > target) ? target - times : x;
					var y = times + x;
					if (x > 0) {
						while (times < y) {
							times += 1;
							callback(times);
						}
					}
				}
				return false;
			} else {
				return true;
			}
		}
	}

	function RealTime(duration, callback) {
		var start = new Date();
		var loop = 0;
		var last;

		this.update = function() {
			loop++;
			var current = new Date();
			var passed = current - start;
			var increment = current - last;

			callback((passed / duration > 1) ? 1 : passed / duration, (increment / duration) || 0, loop);
			last = current;

			return (passed >= duration) ? true : false;
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