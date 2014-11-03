var dungeon = require('./rogue/dungeon');

module.exports = function(server) {
	/*
		routes
	*/

	server.post('/rogue/dungeon', function(req, res, next) {
		res.send(req.params);
		return next();
	});
}