define(['states/play', 'states/menu', 'states/exit', 'states/help'], function(
	play,
	menu,
	exit,
	help) {

	'use strict';

	return [menu, play, exit, help];
});