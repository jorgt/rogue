define(["helpers/log"], function(
	log) {

	'use strict';

	var _bank = new TileBank();

	_bank.add('player', '@', 1, true, true);
	_bank.add('tree', '^', 0, false, true);
	_bank.add('floor', '.', 1, false, false);
	_bank.add('door', '.', 1, true, false);
	_bank.add('road', '.', 50, true, false);
	_bank.add('rock', ' ', 99, true, true); // speed 0
	_bank.add('wall', '#', 0, false, true);

	return _bank;

	function TileBank() {
		var _guid = guid();
		log.med('[TILEBANK:'+_guid+']:', 'Creating a tile repository');
		var _bank = {};

		this.add = function(name, sign, speed, diggable, blocking) {
			_bank[name] = {
				name: name,
				sign: sign,
				blocking: blocking,
				speed: speed,
				diggable: diggable,
				remove: false
			};
		};

		this.get = function(name) {
			return new Tile(_bank[name]);
		};

		function Tile(opt) {
			this.name = opt.name;
			this.sign = opt.sign;
			this.blocking = opt.blocking;
			this.speed = opt.speed;
			this.walkable = opt.speed > 0;
			this.diggable = opt.diggable;
			this.remove = opt.remove;
			this.visited = false;
			this.visible = false;
		}
	}

});