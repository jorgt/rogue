define(["helpers/log", "engine/states", "game/assets", "game/screen"], function(
	log,
	states,
	Assets,
	Screen) {

	var menu = Screen.get('menu');
	var assets = new Assets('menu', 15)

	states.add({
		name: 'menu',
		init: function() {
			this.keys.press('enter', function() {
				states.switch('play');
			});

			menu.add(assets.text('Press [ENTER] to start', 10, 15));
		},
		start: function() {
			Screen.show(menu);
		},
		stop: function() {
			Screen.hide(menu);
		}
	});
});