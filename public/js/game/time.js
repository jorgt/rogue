define(['settings', 'helpers/log'], function(settings, log) {
	'use strict';

	var time;

	function Time() {

		log.low('[TIME]', 'creating a new time object');

		var
			secondsPerMovement = 85,
			current = 0,
			minutes = 0,
			hours = 0,
			days = 0,
			months = 0,
			years = 0;

		this.update = function(movement, incremental) {
			if(incremental === true) {
				current += movement * secondsPerMovement;
			} else {
				current = movement * secondsPerMovement;
			}

			minutes = Math.floor(current / 60);
			hours = Math.floor(minutes / 60);
			minutes = minutes % 60;
			days = Math.floor(hours / 24);
			hours = hours % 24;

		};
		this.getTime = function() {
			return [minutes, hours, days];
		}
	}

	return function() {
		if (!time) time = new Time();

		return time;
	}
});