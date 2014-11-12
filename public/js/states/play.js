define([
		"helpers/log",
		"engine/states",
		"game/game",
		"game/screen",
		"game/assets",
		"helpers/events",
		"settings"
	],
	function(
		log,
		states,
		Game,
		Screen,
		Assets,
		Events,
		settings) {

		var game = null;
		var playing = Screen.get('playing').hide();
		var loading = Screen.get('loading').hide();
		var assets = new Assets('loading');

		states.add({
			name: 'play',
			init: function() {
				var txt = 'Loading game...';
				var h = ~~ (loading.dataset.height / settings.square / 2) - 0.5;
				var w = ~~ ((loading.dataset.width / settings.square / 2)) - 4;
				loading.add(assets.text(txt, h, w));
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

					this.keys.press('h', function(e) {
						states.switch('help');
					})

					this.keys.press('left', function(e) {
						raiseMovementEvent(e[0]);
					});
					this.keys.press('right', function(e) {
						raiseMovementEvent(e[0]);
					});
					this.keys.press('up', function(e) {
						raiseMovementEvent(e[0]);
					});
					this.keys.press('down', function(e) {
						raiseMovementEvent(e[0]);
					});
					this.keys.press('pagedown', function(e) {
						Events.raise('game.delve', {
							direction: 'down'
						});
					})
					this.keys.press('pageup', function(e) {
						Events.raise('game.delve', {
							direction: 'up'
						});
					})

					function raiseMovementEvent(dir) {
						Events.raise('game.movement', {
							direction: dir
						});
					}

					loading.hide();
					playing.show()

					game.start();

					this.mouse.setup(playing);
					this.mouse.up(function(e) {
						Events.raise('game.click', {
							location: e.tile
						});
					})
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