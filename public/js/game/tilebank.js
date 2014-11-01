define(["helpers/log"], function(
	log) {

	'use strict';

	var _bank = new TileBank();

	_bank.add('player', '@', 1, true, true, true);
	_bank.add('tree', '^', 0, false, false, true);
	_bank.add('floor', '.', 1, true, false, false);
	_bank.add('door', '.', 1, true, true, false);
	_bank.add('road', '.', 50, true, true, false);
	_bank.add('rock', ' ', 99, false, true, true); // speed 0
	_bank.add('wall', '#', 0, false, false, true);

	return _bank;

	function TileBank() {
		var _guid = guid();
		log.med('[TILEBANK:'+_guid+']:', 'Creating a tile repository');
		var _bank = {};

		this.add = function(name, sign, speed, walkable, diggable, blocking) {
			_bank[name] = {
				name: name,
				sign: sign,
				blocking: blocking,
				speed: speed,
				walkable: walkable,
				diggable: diggable,
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
			this.walkable = opt.walkable;
			this.diggable = opt.diggable;
			this.remove = opt.remove;
		}
	}

});