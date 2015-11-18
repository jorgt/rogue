define([
	'states/loading',
	'states/play',
	'states/menu',
	'states/map',
	'states/exit',
	'states/help'
], function(loading, play, menu, map, exit, help) {
	'use strict';

	return [loading, menu, play, map, help, exit];
});