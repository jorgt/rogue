define([
	'game/states/loading',
	'game/states/play',
	'game/states/menu',
	'game/states/map',
	'game/states/exit',
	'game/states/help'
], function(loading, play, menu, map, exit, help) {
	'use strict';

	return [loading, menu, play, map, help, exit];
});