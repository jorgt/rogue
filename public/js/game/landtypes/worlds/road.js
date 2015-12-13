define([
	"helpers/log",
	"settings",
	"game/pathfinding/astar",
	"helpers/maths"
], function(log, settings, AStar) {
	'use strict';

	var creator;

	var Road = Class.extend({
		init: function(world, bank, start, end, timer) {

			this.type = 'path';
			this.tiles = AStar.search(world.grid, start, end);
			this.start = start;
			this.end = end;
			this.world = world;
			this.bank = bank;

			log.med('[ROAD]', 'Starting road of length', this.tiles.length);
			if (timer) {

				timer.interval(~~(Math.random() * 100000), this.tiles.length, {
					m: 30,
					h: 1
				}, function(times) {
					var x = this.tiles[times - 1].x;
					var y = this.tiles[times - 1].y;
					this._addRoadTile(x, y, 'path');
			
					this._resignTiles(this.tiles.slice(0, times - 1));
					if (this.tiles.length === times) log.med('[ROAD]', 'Road of length', this.tiles.length, 'done');
				}.bind(this));
			} else {
				for (var r = 0; r < this.tiles.length; r++) {
					this._addRoadTile(this.tiles[r].x, this.tiles[r].y, this.type)
				}
				this._resignTiles();
				log.low('[ROAD]', 'Road of length', this.tiles.length, 'done');
			}

		},
		_resignTiles: function(arr) {
			var map = ['─', '│', '┼', '┤', '├', '┴', '┬', '┌', '┐', '└', '┘']
			var regex = /path/;

			this._reSignFromArray(arr || this.tiles, regex, map, function(n, g) {
				if (g.name.match(/city|town|ferry/)) return g.sign;
			});

			if (arr) {
				for (var x = 0; x < arr.length; x++) {
					this.world.changeTile(this.world.grid[arr[x].x][arr[x].y]);
				}
			}
		},
		_addRoadTile: function(x, y, type) {
			var t = this.world.grid[x][y];

			var tile = (t.name.match(/sea$/)) ? 'ferry' : type;

			if (!t.name.match(/city|town|path|ferry/)) {
				this.world.grid[x][y].sub(this.bank.get(tile, x, y), ['name', 'sign', 'cost']);
			}
			this._resignTiles()
		},

		_neighbours: function(x, y) {
			var ret = [];
			var dir = [
				[0, -1], //south
				[-1, 0], //west
				[0, 1], //north
				[1, 0], //east
			];

			for (var d = 0; d < dir.length; d++) {
				if (this.world.grid[x + dir[d][0]] && this.world.grid[x + dir[d][0]][y + dir[d][1]]) {
					ret.push(this.world.grid[x + dir[d][0]][y + dir[d][1]]);
				} else {
					ret.push({
						name: 'unknown'
					});
				}
			}

			return ret;
		},
		_reSignFromArray: function(array, h, chars, func) {
			var x, y, a, r;

			for (a = 0; a < array.length; a++) {
				x = array[a].x
				y = array[a].y;
				var n = this._neighbours(x, y);
				var s = '·';

				if (n[0].name.match(h) && n[1].name.match(h) && n[2].name.match(h) && n[3].name.match(h)) {
					s = chars[2]
				} else if (n[0].name.match(h) && n[1].name.match(h) && n[2].name.match(h)) {
					s = chars[3];
				} else if (n[1].name.match(h) && n[2].name.match(h) && n[3].name.match(h)) {
					s = chars[6];
				} else if (n[2].name.match(h) && n[3].name.match(h) && n[0].name.match(h)) {
					s = chars[4]
				} else if (n[3].name.match(h) && n[0].name.match(h) && n[1].name.match(h)) {
					s = chars[5];
				} else if (n[0].name.match(h) && n[2].name.match(h)) {
					s = chars[1];
				} else if (n[1].name.match(h) && n[3].name.match(h)) {
					s = chars[0];
				} else if (n[0].name.match(h) && n[1].name.match(h)) {
					s = chars[10];
				} else if (n[1].name.match(h) && n[2].name.match(h)) {
					s = chars[8];
				} else if (n[2].name.match(h) && n[3].name.match(h)) {
					s = chars[7];
				} else if (n[3].name.match(h) && n[0].name.match(h)) {
					s = chars[9];
				} else if (!!n[1].name.match(h) || !!n[3].name.match(h)) {
					s = chars[0];
				} else if (!!n[0].name.match(h) || !!n[2].name.match(h)) {
					s = chars[1];
				}

				r = (func) ? func(n, this.world.grid[x][y]) : null;
				s = (r) ? r : s;

				this.world.grid[x][y].sign = s || this.world.grid[x][y].sign;
				if (this.world.grid[x][y].subtile.sign) this.world.grid[x][y].subtile.sign = s;
			}
		},
	});

	var Highway = Road.extend({
		_addRoadTile: function(x, y, type) {
			var tile = (this.world.grid[x][y].name.match(/sea$/)) ? 'ferry' : type;

			if (!this.world.grid[x][y].name.match(/city|town|highway|ferry/)) {
				this.world.grid[x][y].sub(this._bank.get(tile, x, y), ['name', 'sign', 'cost']);
			}
		},
		_resignTiles: function(arr) {
			var map = ['═', '║', '╬', '╣', '╠', '╩', '╦', '╔', '╗', '╚', '╝'];
			var regex = /ferry|highway|path/;

			this._reSignFromArray(arr || this.tiles, regex, map, function(n, g) {
				if (g.name.match(/ferry|city/)) return g.sign;
			});
		}
	})

	var RoadCreator = Class.extend({
		roads: {},
		road: function(grid, bank, start, end, timer) {
			var one = start.toString() + '.' + end.toString();
			var two = end.toString() + '.' + start.toString();
			if (this.roads[one] || this.roads[two]) {
				return this.roads[one] || this.roads[two];
			}
			var road = new Road(grid, bank, start, end, timer);
			this.roads[one] = road;
			this.roads[two] = road;
			return road;
		},
		highway: function(grid, bank, start, end, timer) {
			var one = start.toString() + '.' + end.toString();
			var two = end.toString() + '.' + start.toString();
			if (!roads[one] || !roads[two]) {
				return false;
			}
		},
		numberOfRoads: function() {
			return Object.keys(this.roads).length / 2;
		},
		upgradeRandomRoadToHighway: function() {

		},
		_upgradeRoadToHighway: function(town) {

		}
	});


	return function() {
		if (!creator) creator = new RoadCreator();

		return creator;
	}
});