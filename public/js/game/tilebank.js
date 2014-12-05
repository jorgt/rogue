define(["helpers/log"], function(
	log) {

	'use strict';

	var _bank = new TileBank();

	/*
		actors
	*/
	_bank.add('player', '@', 1, true, true, true);

	/*
		worlds
	*/
	_bank.add('sea', '~', 1, false, false, false);
	_bank.add('deepsea', '~', 1, false, false, false);
	_bank.add('shallowsea', '~', 1, false, false, false);
	_bank.add('ice', '~', 1, true, false, false);
	_bank.add('polar', '.', 1, true, false, false);
	_bank.add('tundra', '.', 1, true, false, false);
	_bank.add('taiga', '*', 1, true, false, false);
	_bank.add('savannah', '.', 1, true, false, false);
	_bank.add('shrubland', '.', 1, true, false, false);
	_bank.add('forest', '*', 1, true, false, false);
	_bank.add('swamp', '.', 1, true, false, false);
	_bank.add('desert', '.', 1, true, false, false);
	_bank.add('plains', '.', 1, true, false, false);
	_bank.add('seasonalforest', '*', 1, true, false, false);
	_bank.add('rainforest', '*', 1, true, false, false);
	_bank.add('mountain', '^', 1, true, false, false);
	_bank.add('snowymountain', '^', 1, true, false, false);

	/*
		dungeons and caves
	*/
	_bank.add('floor', '.', 1, true, false, false);
	_bank.add('door', '.', 1, true, true, false);
	_bank.add('road', '.', 50, true, true, false);
	_bank.add('rock', ' ', 99, false, true, true);
	_bank.add('wall', '#', 0, false, false, true);

	/*
		objects
	*/
	_bank.add('tree', '^', 0, false, false, true);

	return _bank;

	function TileBank() {
		var _guid = guid();
		log.med('[TILEBANK:' + _guid + ']:', 'Creating a tile repository');
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
			this.info = {};
			this.getInfo = function() {

			};
		}
	}

});