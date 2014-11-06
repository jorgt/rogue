define(["helpers/log"], function(
	log) {

	'use strict';

	var _climates = [
		'deep sea', //0
		'sea', //1
		'shallow sea', //2 
		'ice', //3
		'polar', //4
		'tundra', //5
		'taiga', //6
		'savannah', //7
		'shrubland', //8
		'forest', //9
		'swamp', //10
		'desert', //11
		'plains', //12
		'seasonal forest', //13
		'rain forest', //14
		'mountain', //15
		'snowy mountain' //16
	];

	return function climate(t, h, a) {
		return _climates[_get(t, h, a)];
	}

	function _get(t, h, a) {
		if (t instanceof Array) {
			a = t[2];
			h = t[1];
			t = t[0];
		}
		// water
		if (a < -1800) return 0; //deep sea
		if (a < -100 && t < -10) return 3; //ice
		if (a < -100) return 1; //sea
		if (a < 0 && t < -5) return 3; //ice
		if (a < 0 && t < 0) return 2; //shallow sea
		//mountains
		if(a > 5000 && h > 9000) return 16; //snowy mountain
		if(a > 5000 && h > 0) return 15; //mountain

		// colder climates. trees struggle under 7c ,taiga's and tundra's. 
		// taiga's are wetter and support coniferious forests
		if (t < 7 && t >= 2 && h > 5000) return 6; //taiga
		if (t < -5) return 4; //polar
		if (t < 0) return 5; //tundra

		//hot climates
		if (t > 20 && h > 12000) return 14; // rain forest
		if (t > 20 && h > 8000) return 13; // seasonal forest
		if (t > 20 && h > 4000) return 12; // plains
		if (t > 20 && h > 0) return 11; // desert

		//moderate climates
		if (h > 9000) return 9; //forest
		if (h > 4500) return 8; //shrubland
		if (h > 0) return 7; //savannah
		
		//rest. this doesn't happen, it'll be savannah instead.
		return 10 //swamp
	}
});