define([
	'states/loading',
	'states/play',
	'states/menu',
	'states/exit',
	'states/help'
], function(loading, play, menu, exit, help) {
	'use strict';

	return [loading, menu, play, help, exit];
});