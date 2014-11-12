define(["helpers/log", "engine/states", "game/assets", "game/screen", "settings"], function(
	log,
	states,
	Assets,
	Screen,
	settings) {

	var help = Screen.get('help').hide();
	var assets = new Assets('help');

	states.add({
		name: 'help',
		init: function() {
			this.keys.press('esc', function() {
				states.switch('play');
			});
			var txt = 'Press [ESC] to go back';
			help.add(assets.text(txt, 5, 5));
		},
		start: function() {
			help.show();

		},
		stop: function() {
			help.hide();
		}
	});
});