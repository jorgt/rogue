define([
	"engine/keys",
	"engine/mouse",
	"helpers/log",
	"graphics/screenmanager",
	"settings"
], function(Keys, Mouse, log, screenManager, settings) {

	'use strict';

	function State(obj) {
		var _guid = guid();
		var _paused;
		var _running;
		var _object = obj;

		this.keys = new Keys(false);
		this.mouse = new Mouse();
		this.screen = screenManager(obj.name, settings.screen.height, settings.screen.width);

		this.update = function(time) {
			this.keys.update();
			if (_object.update) {
				_object.update.call(this, time);
			}
		};

		this.draw = function(time) {
			if (_object.draw) {
				_object.draw.call(this, time);
			}
		};

		this.init = function() {
			log.low('[STATE:' + _guid + ']', 'initializing state:', _object.name);
			this.screen.hide();
			_running = true;
			_paused = false;
			if (_object.init) {
				_object.init.call(this);
			}
		};

		this.start = function() {
			log.med('[STATE:' + _guid + ']', 'starting state:', _object.name);
			this.screen.show();
			if (_object.start) {
				_object.start.call(this);
			}
		};

		this.stop = function() {
			log.low('[STATE:' + _guid + ']', 'stopping state:', _object.name);
			this.screen.hide();
			this.keys.pause();
			if (_object.stop) {
				_object.stop.call(this);
			}
		};

		this.quit = function() {
			_running = false;
		};

		this.pause = function() {
			_paused = !_paused;
		};

		this.isRunning = function() {
			return _running;
		};

		this.isPaused = function() {
			return _paused;
		};

		this.name = obj.name;

		for(var name in obj) {
			if(obj.hasOwnProperty(name)){
				this[name] = this[name] || obj[name];
			}
		}
	}

	function States() {
		var _guid = guid();
		var _states = {};

		this.active = null;

		this.add = function(state) {
			log.med('[STATES:' + _guid + ']', 'adding state:', state.name);
			_states[state.name] = new State(state);
			_states[state.name].init();
			if (this.active === null) {
				this.active = _states[state.name];
			}
		};

		this.switch = function(name) {
			log.high('[STATES:' + _guid + ']', 'switching to state:', name);
			if (_states[name]) {
				this.active.stop();
				_states[name].keys.activate();
				this.active = _states[name];
				this.active.start();
			} else {
				log.throw('[STATES:' + _guid + ']: No such state: ' + name);
			}
		};
	}

	return new States();
});