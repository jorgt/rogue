define(["helpers/log", "engine/states", "game/assets", "game/screen", "settings"], function(
	log,
	states,
	Assets,
	Screen,
	settings) {

	'use strict';

	var menu = Screen.get('menu').hide();
	var assets = new Assets('menu')

	states.add({
		name: 'menu',
		init: function() {
			this.keys.press('enter', function() {
				states.switch('play');
			});
			var txt = 'Press [ENTER] to start';
			var h = ~~ (menu.dataset.height / settings.square / 2) - 0.5;
			var w = ~~ ((menu.dataset.width / settings.square / 2)) - 4;
			menu.add(assets.text(txt, h, w));
		},
		start: function() {
			menu.show();

		},
		stop: function() {
			menu.hide();
		}
	});
});