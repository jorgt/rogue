define([
		"helpers/log",
		"engine/states",
		"game/game",
		"game/screen",
		"game/assets",
		"helpers/events"
	],
	function(
		log,
		states,
		Game,
		Screen,
		Assets,
		Events) {

		var game = null;
		var playing = Screen.get('playing').hide();
		var loading = Screen.get('loading').hide();
		var assets = new Assets('loading');

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

					this.keys.press('esc', function(e) {
						states.switch('exit');
					});

					this.keys.press('left', function(e) {
						raiseMovementEvent(e[0])
					});
					this.keys.press('right', function(e) {
						raiseMovementEvent(e[0])
					});
					this.keys.press('up', function(e) {
						raiseMovementEvent(e[0])
					});
					this.keys.press('down', function(e) {
						raiseMovementEvent(e[0])
					});

					function raiseMovementEvent(dir) {
						Events.raise('game.movement', {
							direction: dir
						});
					}

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