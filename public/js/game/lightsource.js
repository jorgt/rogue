define(["helpers/log", "game/tilebank"], function(
	log,
	bank) {

	'use strict';

	function LightSource(m, position, radius) {
		//debugger;
		var map = m;
		this.tiles = [];
		this.position = position;
		this.radius = radius;

		// multipliers for transforming coordinates into other octants.
		this.mult = [
			[1, 0, 0, -1, -1, 0, 0, 1],
			[0, 1, -1, 0, 0, -1, 1, 0],
			[0, 1, 1, 0, 0, -1, -1, 0],
			[1, 0, 0, 1, -1, 0, 0, -1]
		];

		this.setMap = function(map) {
			_map = map;
		}

		// calculates an octant. Called by the this.calculate when calculating lighting
		this.calculateOctant = function(cx, cy, row, start, end, radius, xx, xy, yx, yy, id) {
			map.dungeon().get(cx, cy).visible(true);
			map.dungeon().get(cx, cy).visited(true);
			map.dungeon().get(cx, cy).draw();
			this.tiles.push(map.dungeon().get(cx, cy));

			var new_start = 0;

			if (start < end) return;

			var radius_squared = radius * radius;

			for (var i = row; i < radius + 1; i++) {
				var dx = -i - 1;
				var dy = -i;

				var blocked = false;

				while (dx <= 0) {

					dx += 1;

					var X = cx + dx * xx + dy * xy;
					var Y = cy + dx * yx + dy * yy;

					if (X < map.dungeon().size().x && X >= 0 && Y < map.dungeon().size().y && Y >= 0) {

						var l_slope = (dx - 0.5) / (dy + 0.5);
						var r_slope = (dx + 0.5) / (dy - 0.5);

						if (start < r_slope) {
							continue;
						} else if (end > l_slope) {
							break;
						} else {
							if (dx * dx + dy * dy < radius_squared) {
								map.dungeon().get(X, Y).visible(true);
								map.dungeon().get(X, Y).visited(true);
								map.dungeon().get(X, Y).draw();
								this.tiles.push(map.dungeon().get(X, Y));
							}

							if (blocked) {
								if (bank.get(map.dungeon().get(X, Y).tile).blocking) {
									new_start = r_slope;
									continue;
								} else {
									blocked = false;
									start = new_start;
								}
							} else {
								if (bank.get(map.dungeon().get(X, Y).tile).blocking && i < radius) {
									blocked = true;
									this.calculateOctant(cx, cy, i + 1, start, l_slope, radius, xx, xy, yx, yy, id + 1);

									new_start = r_slope;
								}
							}
						}
					}
				}

				if (blocked) break;
			}
		}

		// sets flag lit to false on all tiles within radius of position specified
		this.clear = function() {
			for (var i = 0; i < this.tiles.length; i++) {
				this.tiles[i].visible(false);
				this.tiles[i].draw();
			}

			this.tiles = [];
		}

		// sets flag lit to true on all tiles within radius of position specified
		this.calculate = function() {
			this.clear();

			for (var i = 0; i < 8; i++) {
				this.calculateOctant(this.position[0], this.position[1], 1, 1.0, 0.0, this.radius,
					this.mult[0][i], this.mult[1][i], this.mult[2][i], this.mult[3][i], 0);
			}

			map.dungeon().get(this.position).visible(true);
			map.dungeon().get(this.position).visited(true);
			map.dungeon().get(this.position).draw();
			this.tiles.push(map.dungeon().get(this.position));
		}

		// update the position of the light source
		this.update = function(position) {
			this.position = position;
			this.clear();
			this.calculate();
		}
	}

	return LightSource;

});