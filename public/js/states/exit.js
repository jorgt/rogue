define(["helpers/log", "engine/states"], function(
	log,
	states) {

	states.add({
		name: 'exit',
		init: function() {
			this.quit();
		}
	});
});