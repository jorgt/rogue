define([
	"helpers/log",
	"game/landtypes/worlds/climateArray"
], function(
	log,
	climates) {

	'use strict';

	return function climate(t, p, a) {
		return climates[_get(t, p, a)];
	}

	function _get(t, p, a) {
		if (t instanceof Array) {
			a = t[2];
			p = t[1];
			t = t[0];
		}
		// water
		if (a < -2500) return 0; //deep sea
		if (a < -500 && t < -5) return 3; //ice
		if (a < -500) return 1; //sea
		if (a < 0 && t < 0) return 3; //ice
		if (a < 0) return 2; //shallow sea

		//mountains
		if (a > 5000 && p > 4000 && t < 10) return 16; //snowy mountain
		if (a > 5000 && p > 0) return 15; //mountain

		// colder climates. trees struggle under 7c ,taiga's and tundra's. 
		// taiga's are wetter and support coniferious forests
		if (t < 7 && t >= 2 && p > 5000) return 6; //taiga
		if (t < -5) return 4; //polar
		if (t < 0) return 5; //tundra

		//hot climates
		if (t > 20 && p > 12000) return 14; // rain forest
		if (t > 20 && p > 8000) return 13; // seasonal forest
		if (t > 20 && p > 4000) return 12; // plains
		if (t > 20 && p > 0) return 11; // desert

		//moderate climates
		if (p > 9000) return 9; //forest
		if (p > 4500) return 8; //sprubland
		if (p > 0) return 7; //savannap

		//rest. this doesn't pappen, it'll be savannah instead.
		return 10 //swamp
	}
});