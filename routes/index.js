function extend(o, p) {
	for (var i in o) {
		p[i] = o[i];
	}
	return p;
}

exports.index = function(req, res, next) {
	var user = req.session.oauthUser;
	var ua = req.headers['user-agent'].toLowerCase();
	var isIosMobile;
	if (ua.indexOf('AppleWebKit') > - 1 && (ua.indexOf('ipad') > - 1 || ua.indexOf('iphone') > - 1)) {
		isIosMobile = true;
	}
	if (isIosMobile) {
		res.render('index_mobile', {
            user:user
        });
	} else {
		res.render('index_pc', {
			user: user
		});
	}
};

exports.public_list = function(req, res, next) {
	var user = req.session.oauthUser;
	if (user) {
		var weibo = req.app.get('weibo');
		var params = req.query;
		var cursor = extend({},
		params);
		weibo.public_timeline({
			blogtype: 'weibo',
			access_token: user.access_token
		},
		cursor, function(err, statuses) {
			if (err) next(err);
			else {
				res.json(statuses);
			}
		});
	} else {
		next('请先登陆微博听');
	}
};

exports.home_list = function(req, res, next) {
	var user = req.session.oauthUser;
	if (user) {
		var weibo = req.app.get('weibo');
		var params = req.query;
		var cursor = extend({},
		params);
		weibo.home_timeline({
			blogtype: 'weibo',
			access_token: user.access_token
		},
		cursor, function(err, statuses) {
			if (err) next(err);
			else {
				res.json(statuses);
			}
		});
	} else {
		next('请先登陆微博听');
	}
};

