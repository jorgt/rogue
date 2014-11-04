define(["helpers/log"], function(
	log) {

	'use strict';

	var Climate = {
		_temp: ['tropical', 'subtropical', 'warm', 'cool', 'boreal', 'subpolar', 'polar'],
		_hum: ['super-humid', 'per-humid', 'humid', 'sub-humid', 'semi-arid', 'arid', 'per-arid', 'super-arid'],
		_alt: ['alvar', 'alpine', 'subalpine', 'montane', 'lower montane', 'premontane', 'shallow sea', 'sea', 'deep sea'],
		_climates: ['ice', 'frozen land', 'dry mountain', 'snowy mountain', 'deep sea', 'sea', 'shallow sea', 'desert', 'rain tundra',
			'wet tundra', 'moist tundra', 'dry tundra', 'rain forest', 'wet forest', 'moist forest', 'dry forest', 'very dry forest',
			'dry scrub', 'desert scrub', 'steppe', 'woodland'
		],
		_getTemp: function(temp) {
			if (temp < 1.5) return 6;
			else if (temp < 3) return 5;
			else if (temp < 6) return 4;
			else if (temp < 12) return 3;
			else if (temp < 18) return 2;
			else if (temp < 24) return 1;
			else return 0;

			return ret;
		},
		_getHumidity: function(precipitation) {
			if (precipitation < 2000) return 7;
			else if (precipitation < 4000) return 6;
			else if (precipitation < 6000) return 5;
			else if (precipitation < 8000) return 4;
			else if (precipitation < 10000) return 3;
			else if (precipitation < 12000) return 2;
			else if (precipitation < 14000) return 1;
			else return 0;

		},
		_getAltitude: function(altitude) {
			var ret;
			if (altitude < -3000) return 8;
			if (altitude < -500) return 7;
			else if (altitude < 0) return 6;
			else if (altitude < 1000) return 5;
			else if (altitude < 2000) return 4;
			else if (altitude < 3000) return 3;
			else if (altitude < 4000) return 2;
			else if (altitude < 5500) return 1;
			else return 0;
		},
		_combine: function(temp, precipitation, altitude) {
			return [
				Climate._getTemp(temp),
				Climate._getHumidity(precipitation),
				Climate._getAltitude(altitude),
			];
		},
		_getCombined: function(c) {
			if (c[0] == 6 && c[2] >= 3) { //polar, not mountainous
				return (c[2] >= 6) ? 0 : 1; //ice or frozen land
			}

			//mountains, dry or snowy
			if (c[2] <= 1) {
				return (c[0] >= 4) ? 2 : 3; //dry mountain, snowy mountain
			}

			if (c[2] == 8) return 4; //deep sea
			if (c[2] == 7) return 5; //sea
			if (c[2] == 6) return 6; //shallow sea

			if (c[1] == 7 && c[0] <= 4) return 7; //deserts

			if (c[0] == 5) { //sub polar, all tundras
				if (c[1] == 0) return 8;
				else if (c[1] == 1) return 9;
				else if (c[1] == 2) return 10;
				else return 11;
			}

			if (c[1] == 4 && c[0] == 0) return 16; //very dry forest

			if (c[1] == 6) { // per arid, boreal and higher are scrubs
				if (c[0] <= 3) return 17;
				if (c[0] >= 4) return 18;
			}

			if (c[1] == 0 && c[0] <= 4) return 12; // rain forests
			if (c[1] == 1 && c[0] <= 4) return 13; // wet forests
			if ((c[1] == 2 && c[0] <= 4) || c[2] <= 3) return 14; // moist forests
			if (c[1] == 3 && c[0] <= 2) return 15; // dry forests
			if (c[1] == 4 || c[1] == 3) return 14; // dry forests



			if (c[1] == 5) { //arid
				if (c[0] <= 3) return 19; // steppe
				if (c[0] >= 4) return 20; // woodland
			}
		},
		get: function(temp, precipitation, altitude) {
			var c = Climate._combine(temp, precipitation, altitude);
			return Climate._getCombined(c)
		},
		convertToText: function(a) {
			return [Climate._temp[a[0]], Climate._hum[a[1]], Climate._alt[a[2]]];
		},
		getClimateInfo: function(climate) {
			return Climate._climates[climate];
		},
		checkConsistency: function() {
			log.low('[CLIMATE]: checking consistency');
			var used = [];
			for (var a = 0; a < Climate._temp.length; a++) {
				for (var b = 0; b < Climate._hum.length; b++) {
					for (var c = 0; c < Climate._alt.length; c++) {
						var info = Climate._getCombined([a, b, c]);
						if (used.indexOf(info) < 0) {
							used.push(info);
						}
						console.log([a, b, c], Climate.convertToText([a, b, c]), info, Climate.getClimateInfo(info));
					}
				}
			}
			used.sort();
			log.low('[CLIMATE]: done checking. Found: ', used);
		}
	};

	return Climate;

});