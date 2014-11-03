var restify = require('restify');
var Logger = require('bunyan');


log = new Logger.createLogger({
	name: 'Rogue',
	level: process.env.LOG_LEVEL || 'info',
	stream: process.stdout,
	serializers: Logger.stdSerializers
});


var server = restify.createServer({
	name: 'Rogue',
	version: '0.0.1',
	log: log
});

server.use(restify.CORS({
	origins: ['http://localhost/']
}));
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(function authenticate(req, res, next) {
  // call redis or something here
  next();
});


server.pre(function(request, response, next) {
	request.log.info({
		req: request
	}, 'REQUEST');
	return next();
});

server.get('/echo/:name', function(req, res, next) {
	res.send(req.params);
	return next();
});

server.get(/\.*/, restify.serveStatic({
	directory: './public'
}));

server.listen(1337, function() {
	console.log('%s running on %s', server.name, server.url);
});