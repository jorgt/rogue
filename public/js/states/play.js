define([
		"helpers/log",
		"engine/states",
		"game/game",
		"game/screen",
		"game/assets"
	],
	function(
		log,
		states,
		Game,
		Screen,
		Assets) {

		var game = null;
		var playing = Screen.get('playing').hide();
		var loading = Screen.get('loading').hide();
		var assets = new Assets('loading', 15);

		states.add({
			name: 'play',
			init: function() {
				loading.add(assets.text('Loading game...', 10, 15));
			},
			start: function() {
				loading.show();
				//doing this in a 1 ms timeout ensures that the 
				//loading screen is properly displayed: dom updates
				//pause while js is crunching otherwise. 
				window.setTimeout(function() {
					game = new Game(playing);

					this.keys.press('esc', function() {
						states.switch('exit');
					});

					this.keys.press('left', function() {
						game.fire('movement', 'left');
					});
					this.keys.press('right', function() {
						game.fire('movement', 'right');
					});
					this.keys.press('up', function() {
						game.fire('movement', 'up');
					});
					this.keys.press('down', function() {
						game.fire('movement', 'down');
					});

					loading.hide();
					playing.show()

					game.start();
				}.bind(this), 1)

			},
			stop: function() {
				playing.hide();
			},
			update: function() {
				if (game !== null) {
					game.update();
				}
			}
		});
	});