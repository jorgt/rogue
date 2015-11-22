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
	_bank.add('shallowsea', '~', 1, false, false, false, [41, 72, 210]);
	_bank.add('sea', '≈', 1, false, false, false, [20, 46, 166]);
	_bank.add('deepsea', '≈', 1, false, false, false, [0, 25, 128]);
	_bank.add('ice', '·', 10, true, false, false, [255, 255, 255]);
	_bank.add('polar', '·', 10, true, false, false, [238, 238, 238]);
	_bank.add('tundra', '·', 50, true, false, false, [204, 219, 195]);
	_bank.add('taiga', '*', 50, true, false, false, [195, 218, 219]);
	_bank.add('savannah', '·', 50, true, false, false, [211, 222, 0]);
	_bank.add('shrubland', '·', 40, true, false, false, [142, 230, 0]);
	_bank.add('forest', '♣', 50, true, false, false, [51, 181, 0]);
	_bank.add('swamp', '·', 20, true, false, false, [0, 90, 30]);
	_bank.add('desert', '·', 40, true, false, false, [255, 191, 0]);
	_bank.add('plains', '*', 70, true, false, false, [212, 255, 0]);
	_bank.add('seasonalforest', '♣', 70, true, false, false, [0, 163, 0]);
	_bank.add('rainforest', '♣', 40, true, false, false, [0, 105, 0]);
	_bank.add('mountain', 'Δ', 10, true, false, false, [51, 51, 51]);
	_bank.add('snowymountain', 'Δ', 5, true, false, false, [170, 170, 170]);

	_bank.add('city', function(grid, x, y) {
			return 'C';
		}, 0, null, null, null, [255, 255, 255], [0, 0, 0])
		/*
			dungeons and caves
		*/
	_bank.add('floor', '·', 80, true, false, false, [170, 170, 170], [75, 60, 0], [33, 33, 33], [0, 0, 0]);
	_bank.add('door', '·', 50, true, true, false, [170, 170, 170], [75, 60, 0], [33, 33, 33], [0, 0, 0]);
	_bank.add('road', '·', 20, true, true, false, [170, 170, 170], [75, 60, 0], [33, 33, 33], [0, 0, 0]);
	_bank.add('rock', ' ', 0, false, true, true, [0, 0, 0], [0, 0, 0]);
	_bank.add('wall', '#', 0, false, false, true, [170, 170, 170], [75, 60, 0], [33, 33, 33], [0, 0, 0]);

	/*
		objects
	*/
	return _bank;

	function TileBank() {
		var _guid = guid();
		log.low('[TILEBANK:' + _guid + ']:', 'Creating a tile repository');
		var _bank = {};
		var _classes = {};

		this.add = function(name, sign, speed, walkable, diggable, blocking, color, background, dcolor, dbackground) {

			_bank[name] = {
				name: name,
				sign: sign,
				blocking: blocking,
				speed: speed,
				walkable: walkable,
				diggable: diggable,
				object: null,
				color: color || [255, 255, 255],
				background: background,
				dcolor: dcolor,
				dbackground: dbackground
			};
		};

		this.object = function(name, sign, speed, walkable, diggable, blocking, color, background, dcolor, dbackground) {

			_bank[name] = {
				name: name,
				sign: sign,
				blocking: blocking,
				speed: speed,
				walkable: walkable,
				diggable: diggable,
				color: color,
				background: background,
				dcolor: dcolor,
				dbackground: dbackground
			};
		};

		this.get = function(name) {
			if (!_bank[name]) {
				throw new Error("Tile type " + name + " is not defined");
			}
			return new Tile(_bank[name]);
		};

		var Tile = Class.extend({
			init: function(opt) {
				this.guid = guid();
				this.name = opt.name;
				this.sign = opt.sign;
				this.blocking = opt.blocking;
				this.speed = opt.speed;
				this.cost = 100 - opt.speed;
				this.walkable = opt.walkable;
				this.diggable = opt.diggable;
				this.visited = false;
				this.visible = false;
				this.child = null;
				this.color = opt.color;
				this.background = opt.background;
				this.dcolor = opt.dcolor;
				this.dbackground = opt.dbackground;
				this.subtile = {};

				this.info = {
					climate: {
						alt: 0,
						prec: 0,
						temp: 0
					},
					alt: 1,
					tot: 1
				};
			},
			subtile: function(tile) {
				this.subtile = tile;
			}
		});
	}

});