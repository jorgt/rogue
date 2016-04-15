define(["helpers/log"], function(
	log) {

	'use strict';

	var _event = new Events();

	function Events() {
		var _guid = guid();
		var _main = document.body;
		var _registered = [];

		var EngineEvent = CustomEvent;

		function _clean(msg) {
			return msg.toLowerCase().replace(/[^a-z\.]/, '');
		}

		this.raise = function(msg, details) {
			var det = details || {};
			msg = _clean(msg);

			if (_registered.indexOf(msg) === -1) {
				log.high('[EVENTS'+_guid+']', 'beware, this event is raised but not consumed:', msg);
			}
			var evt = new EngineEvent(msg, {
				detail: det,
				bubbles: true,
				cancelable: true
			});

			_main.dispatchEvent(evt);
		};

		this.on = function(msg, callback) {
			msg = _clean(msg);
			_registered.push(msg);
			_main.addEventListener(msg, callback, false);
		};
	}

	return _event;

});