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
		var _classes = {};

		this.add = function(name, sign, speed, walkable, diggable, blocking, color, background) {
			_bank[name] = {
				name: name,
				sign: sign,
				blocking: blocking,
				speed: speed,
				walkable: walkable,
				diggable: diggable,
				color: color || [255, 255, 255],
				background: background || color || [0, 0, 0]
			};
		};

		this.get = function(name) {
			return new Tile(_bank[name]);
		};

		var Tile = Class.extend({
			init: function(opt) {
				this.name = opt.name;
				this.sign = opt.sign;
				this.blocking = opt.blocking;
				this.speed = opt.speed;
				this.cost = 100 - opt.speed;
				this.walkable = opt.walkable;
				this.diggable = opt.diggable;
				this.visited = false;
				this.visible = false;
				this.color = opt.color;
				this.background = opt.background
				this.info = {};
			},
			draw: function(ctx, posx, posy, size, opac) {
				var opacb = ((this.info.tot + this.info.alt / 5) / 1.8) * opac;
				if(this.name === 'ice') opacb += 0.3;
				var cf = this.color.map(function(a) {
					return ~~(a * opac);
				});
				var cb = (this.background || this.color).map(function(a) {
					return ~~(a * opacb);
				});

				if (cf) {
					ctx.fillStyle = "rgba(" + cb[0] + ", " + cb[1] + ", " + cb[2] + ", 1)";
					ctx.fillRect(posx * size, posy * size, size, size);
					ctx.fillStyle = "rgba(" + cf[0] + ", " + cf[1] + ", " + cf[2] + ", 1)";
					ctx.fillText(this.sign, posx * size + 3, posy * size + 12);
				}

			}
		});
	}

});