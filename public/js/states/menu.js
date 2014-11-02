define(["helpers/log", "engine/states", "game/assets", "game/screen"], function(
	log,
	states,
	Assets,
	Screen) {

	var menu = Screen.get('menu').hide();
	var assets = new Assets('menu')

	states.add({
		name: 'menu',
		init: function() {
			this.keys.press('enter', function() {
				states.switch('play');
			});

			menu.add(assets.text('Press [ENTER] to start', 10, 15));
		},
		start: function() {
			menu.show()
		},
		stop: function() {
			menu.hide();
		}
	});
});