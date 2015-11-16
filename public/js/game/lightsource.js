define(["helpers/log"], function(log) {

	'use strict';

	function LightSource(m, position, radius) {
		var map = m;
		this.tiles = [];
		this.position = position;
		this.radius = radius;
		this.height = false;

		// multipliers for transforming coordinates into other octants.
		this.mult = [
			[1, 0, 0, -1, -1, 0, 0, 1],
			[0, 1, -1, 0, 0, -1, 1, 0],
			[0, 1, 1, 0, 0, -1, -1, 0],
			[1, 0, 0, 1, -1, 0, 0, -1]
		];

		this.setMap = function(m) {
			map = m;
		}

		// calculates an octant. Called by the this.calculate when calculating lighting
		this.calculateOctant = function(cx, cy, row, start, end, radius, xx, xy, yx, yy, id) {
			var tile = map.getTile(cx, cy)
			tile.visible = true;
			tile.visited = true;
			this.tiles.push(tile);

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

					if (X < map.width && X >= 0 && Y < map.height && Y >= 0) {

						var l_slope = (dx - 0.5) / (dy + 0.5);
						var r_slope = (dx + 0.5) / (dy - 0.5);

						if (start < r_slope) {
							continue;
						} else if (end > l_slope) {
							break;
						} else {
							if (dx * dx + dy * dy < radius_squared) {
								map.getTile(X, Y).visible = true;
								map.getTile(X, Y).visited = true;
								this.tiles.push(map.getTile(X, Y));
							}

							if (blocked) {
								if (map.getTile(X, Y).blocking || (this.height && tile.info.climate.alt <= map.getTile(X, Y).info.climate.alt)) {
									new_start = r_slope;
									continue;
								} else {
									blocked = false;
									start = new_start;
								}
							} else {
								if (((this.height && tile.info.climate.alt <= map.getTile(X, Y).info.climate.alt) || map.getTile(X, Y).blocking) && i < radius) {
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
			for (var x in this.tiles) {
				this.tiles[x].visible = false;
			}
			this.tiles = [];
		}

		// sets flag lit to true on all tiles within radius of position specified
		this.calculate = function() {
			this.clear();
			try {
				for (var i = 0; i < 8; i++) {
					this.calculateOctant(this.position.w, this.position.h, 1, 1.0, 0.0, this.radius,
						this.mult[0][i], this.mult[1][i], this.mult[2][i], this.mult[3][i], 0);
				}
			} catch (e) {
				console.log('calculating light failed')
			}
		}

		// update the position of the light source
		this.update = function(position, map, height) {
			if (typeof map !== 'undefined') {
				this.setMap(map);
			}
			this.height = height;
			this.position = position;
			this.clear();
			this.calculate();
		}
	}

	return LightSource;

});