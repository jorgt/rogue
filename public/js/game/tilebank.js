define(["helpers/log"], function(
	log) {

	'use strict';

	var _bank = new TileBank();

	/*
		actors
	*/
	_bank.add('player', '@', 1, true, true, true);
	_bank.add('monster', '@', 1, true, true, true, [255, 0, 0]);

	/*
		climate tiles
	*/
	_bank.add('shallowsea', '~', 20, false, true, false, [41, 72, 210]);
	_bank.add('sea', '≈', 10, false, true, false, [20, 46, 166]);
	_bank.add('deepsea', '≈', 1, false, true, false, [0, 25, 128]);
	_bank.add('ice', arr(['·', ' ']), 20, true, true, false, [255, 255, 255], [200, 200, 255], [100, 100, 100], [70, 70, 100]);
	_bank.add('polar', arr(['·', ' ']), 20, true, true, false, [238, 238, 238]);
	_bank.add('tundra', arr(['·', ' ']), 50, true, true, false, [204, 219, 195]);
	_bank.add('taiga', '*', 50, true, true, false, [195, 218, 219]);
	_bank.add('savannah', arr(['·', ' ']), 50, true, true, false, [211, 222, 0]);
	_bank.add('shrubland', arr(['·', ' ']), 40, true, true, false, [142, 230, 0]);
	_bank.add('forest', tree, 60, true, true, false, [51, 181, 0]);
	_bank.add('swamp', arr(['·', ' ']), 30, true, true, false, [0, 90, 30]);
	_bank.add('desert', arr(['·', ' ']), 40, true, true, false, [255, 191, 0]);
	_bank.add('plains', '*', 70, true, true, false, [212, 255, 0]);
	_bank.add('seasonalforest', tree, 70, true, true, false, [0, 163, 0]);
	_bank.add('rainforest', tree, 30, true, true, false, [0, 105, 0]);
	_bank.add('mountain', 'Δ', 10, true, true, false, [51, 51, 51]);
	_bank.add('snowymountain', 'Δ', 5, true, true, false, [170, 170, 170]);

	/*
		world objects
	 */
	_bank.add('city', "C", 90, null, null, null, [255, 255, 255], [0, 0, 0, 0.4], [0, 0, 0, 0.4], [0, 0, 0, 0.4]);
	_bank.add('highway', 'x', 95, true, true, false, [200, 200, 200], [0, 0, 0, 0.4], [60, 60, 60], [0, 0, 0, 0.1]);
	_bank.add('path', 'x', 90, true, true, false, [200, 200, 200], [0, 0, 0, 0.4], [60, 60, 60], [0, 0, 0, 0.1]);
	_bank.add('ferry', '*', 40, true, true, false, [200, 200, 200], [0, 0, 0, 0.2], null, [0, 0, 0, 0.2]);
	_bank.add('river', '*', 40, true, true, false, [0, 0, 255], [0, 0, 255, 0.1], [0, 0, 100], [0, 0, 0, 0.1]);

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

	function tree() {
		var signs = ['¶', '♣'];
		return signs[Math.between(0, signs.length - 1)];
	}

	function dots() {

		var signs = ['¶', '♣'];
		return signs[Math.between(0, signs.length - 1)];
	}

	function arr(a) {
		return function() {
			return a[Math.between(0, a.length - 1)];
		}
	}

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

		this.get = function(name, x, y) {
			if (!_bank[name]) {
				throw new Error("Tile type " + name + " is not defined");
			}
			return new Tile(_bank[name], x, y);
		};

		var Tile = Class.extend({
			init: function(opt, x, y) {
				this.guid = guid();
				this.name = opt.name;
				this.x = x;
				this.y = y;
				if (typeof opt.sign === 'function') {
					this.sign = opt.sign();
				} else {
					this.sign = opt.sign;
				}
				this.blocking = opt.blocking;
				this.speed = opt.speed;
				this.cost = 100 - opt.speed;
				this.walkable = opt.walkable;
				this.diggable = opt.diggable;
				this.visited = false;
				this.visible = false;
				this.selected = false;
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
			sub: function(tile, stats) {
				stats = stats || [];
				this.subtile = tile;
				this.subtile.info = tile.info;
				this.subtile.x = tile.x;
				this.subtile.y = tile.y;
				for (var s = 0; s < stats.length; s++) {
					this[stats[s]] = tile[stats[s]] || this[stats[s]];
				}
			},
			change: function(tile) {
				this.name = tile.name || this.name;
				this.sign = tile.sign || this.sign;
				this.blocking = tile.blocking || this.blocking;
				this.speed = tile.speed || this.speed;
				this.cost = tile.cost || this.cost;
				this.color = tile.color || this.color;
				this.background = tile.background || this.background;
				this.dcolor = tile.dcolor || this.dcolor;
				this.dbackground = tile.dbackground || this.dbackground;
			}
		});
	}

});