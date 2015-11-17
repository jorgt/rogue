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
	_bank.add('sea', '≈', 1, false, false, false);
	_bank.add('deepsea', '≈', 1, false, false, false);
	_bank.add('shallowsea', '≈', 1, false, false, false);
	_bank.add('ice', '·', 10, true, false, false);
	_bank.add('polar', '·', 10, true, false, false);
	_bank.add('tundra', '·', 50, true, false, false);
	_bank.add('taiga', '*', 50, true, false, false);
	_bank.add('savannah', '·', 50, true, false, false);
	_bank.add('shrubland', '·', 40, true, false, false);
	_bank.add('forest', '♣', 50, true, false, false);
	_bank.add('swamp', '·', 20, true, false, false);
	_bank.add('desert', '·', 40, true, false, false);
	_bank.add('plains', '*', 70, true, false, false);
	_bank.add('seasonalforest', '♣', 70, true, false, false);
	_bank.add('rainforest', '♣', 40, true, false, false);
	_bank.add('mountain', 'Δ', 10, true, false, false);
	_bank.add('snowymountain', 'Δ', 5, true, false, false);

	/*
		dungeons and caves
	*/
	_bank.add('floor', '·', 1, true, false, false);
	_bank.add('door', '·', 1, true, true, false);
	_bank.add('road', '·', 50, true, true, false);
	_bank.add('rock', ' ', 99, false, true, true);
	_bank.add('wall', '#', 0, false, false, true);

	/*
		objects
	*/
	_bank.add('tree', '^', 0, false, false, true);
	_bank.add('grass', '.', 1, true, false, false);

	return _bank;

	function TileBank() {
		var _guid = guid();
		log.low('[TILEBANK:' + _guid + ']:', 'Creating a tile repository');
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
			this.cost = 100 - opt.speed;
			this.walkable = opt.walkable;
			this.diggable = opt.diggable;
			this.visited = false;
			this.visible = false;
			this.info = {};
			this.getInfo = function() {

			};
			this.draw = function() {
				ret = {
					f: "rgba(255,255,255,1)",
					b: "rgba(0,0,0,1)"
				}
			}
		}
	}

});