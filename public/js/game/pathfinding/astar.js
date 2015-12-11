define([
	"helpers/log",
	"helpers/binaryheap"
], function(
	log,
	BinaryHeap) {

	'use strict';

	var astar = {
		init: function(grid, costfunction) {
			costfunction = costfunction || function(tile) {
				return tile.cost;
			}

			var g = [];

			for (var x = 0, xl = grid.length; x < xl; x++) {
				g[x] = [];
				for (var y = 0, yl = grid[x].length; y < yl; y++) {
					var node = {};
					node.x = x;
					node.y = y;
					node.f = 0;
					node.g = 0;
					node.h = 0;
					node.speed = costfunction(grid[x][y]);
					node.blocking = !grid[x][y].diggable;
					node.visited = false;
					node.closed = false;
					node.parent = null;
					g[x][y] = node;
				}
			}
			return g;
		},
		heap: function() {
			return new BinaryHeap(function(node) {
				return node.f;
			});
		},
		search: function(originalgrid, start, end, diagonal, heuristic, costfunction) {
			var grid = astar.init(originalgrid, costfunction);
			heuristic = heuristic || astar.tiebreaking;
			diagonal = !!diagonal;

			start = grid[start[0]][start[1]];
			end = grid[end[0]][end[1]];

			var openHeap = astar.heap();

			openHeap.push(start);

			while (openHeap.size() > 0) {

				// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
				var currentNode = openHeap.pop();
				// End case -- result has been found, return the traced path.
				if (currentNode === end) {
					var curr = currentNode;
					var ret = [];
					while (curr.parent) {
						ret.push(curr);
						curr = curr.parent;
					}
					return ret.reverse();
				}

				// Normal case -- move currentNode from open to closed, process each of its neighbors.
				currentNode.closed = true;

				// Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
				var neighbors = astar.neighbors(grid, currentNode, diagonal);

				for (var i = 0, il = neighbors.length; i < il; i++) {
					var neighbor = neighbors[i];
					if (neighbor.closed || neighbor.blocking) {
						// Not a valid node to process, skip to next neighbor.
						continue;
					}

					// The g score is the shortest distance from start to current node.
					// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
					var gScore = currentNode.g + neighbor.speed;
					var beenVisited = neighbor.visited;

					if (!beenVisited || gScore < neighbor.g) {

						// Found an optimal (so far) path to this node.  Take score for node to see how good it is.
						neighbor.visited = true;
						neighbor.parent = currentNode;
						neighbor.h = neighbor.h || heuristic(neighbor, start, end, neighbor.speed);
						neighbor.g = gScore;
						neighbor.f = neighbor.g + neighbor.h;
						neighbor.tile = originalgrid[neighbor.x][neighbor.y];

						if (!beenVisited) {
							// Pushing to heap will put it in proper place based on the 'f' value.
							openHeap.push(neighbor);
						} else {
							// Already seen the node, but since it has been rescored we need to reorder it in the heap
							openHeap.rescoreElement(neighbor);
						}
					}
				}
			}

			// No result was found - empty array signifies failure to find path.
			return [];
		},
		manhattan: function(pos0, pos1) {
			// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

			var d1 = Math.abs(pos1.x - pos0.x);
			var d2 = Math.abs(pos1.y - pos0.y);
			return d1 + d2;
		},
		tiebreaking: function(current, start, goal, speed) {
			speed = speed || 1;
			var dx = Math.abs(current.x - goal.x);
			var dy = Math.abs(current.y - goal.y);
			var heuristic = speed * (dx + dy);
			//tie breaker!
			var dx1 = current.x - goal.x;
			var dy1 = current.y - goal.y;
			var dx2 = start.x - goal.x;
			var dy2 = start.y - goal.y;
			var cross = Math.abs(dx1 * dy2 - dx2 * dy1);

			//return heuristic plus tie breaker
			heuristic += cross * 0.001;
			return heuristic;
		},
		neighbors: function(grid, node, diagonals) {
			var ret = [];
			var x = node.x;
			var y = node.y;
			var orthogonal = [
				[0, -1], //south
				[-1, 0], //west
				[0, 1], //north
				[1, 0], //east
			];
			var diagonal = [
				[-1, -1], //southwest
				[-1, 1], //northwest
				[1, -1], //southeast
				[1, 1], //northeast
			];

			for (var d = 0; d < orthogonal.length; d++) {
				if (grid[x + orthogonal[d][0]] && grid[x + orthogonal[d][0]][y + orthogonal[d][1]]) {
					ret.push(grid[x + orthogonal[d][0]][y + orthogonal[d][1]]);
				}
			}

			if (diagonals) {
				for (var d = 0; d < diagonal.length; d++) {
					if (grid[x + diagonal[d][0]] && grid[x + diagonal[d][0]][y + diagonal[d][1]]) {
						ret.push(grid[x + diagonal[d][0]][y + diagonal[d][1]]);
					}
				}
			}

			return ret;
		}
	};

	return astar;
});