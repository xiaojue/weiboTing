var index = require('./routes/index');
var error = require('./routes/error');
module.exports = function(app) {

	app.get('/', index.index);
	app.get('/index', index.index);

	app.get('*', error.notFound);

	app.use(function(err, req, res, next) {
		console.error(err);
		next(err);
	});
	app.use(function(err, req, res, next) {
		if (req.xhr) {
			res.send(500, err);
		} else {
			next(err);
		}
	});
	app.use(function(err, req, res, next) {
		res.send(500, err);
	});
};

