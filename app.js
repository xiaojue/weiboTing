var express = require('express');
var app = express();

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/htmls');
app.set('view engine', 'html');

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({
	secret: 'weibo ting secret'
}));
app.use(express.methodOverride());
app.use(express['static'](__dirname + '/public'));

var weibo = require('weibo');

var appkey = '2008689977';
var secret = '5f33f4d365d458416c224e29d280eebf';
var oauth_callback_url = 'http://weiboting.me/oauth/callback';

weibo.init('weibo', appkey, secret, oauth_callback_url);

app.set('weibo',weibo);

app.use(weibo.oauth({
	loginPath: '/login',
	logoutPath: '/logout',
    homeUrl:'http://weiboting.me',
	callbackPath: '/oauth/callback',
	blogtypeFiled: 'type',
	afterLogin: function(req, res, callback) {
		console.log(req.session.oauthUser && req.session.oauthUser.screen_name, 'login success');
		process.nextTick(callback);
	},
	beforeLogout: function(req, res, callback) {
		console.log(req.session.oauthUser && req.session.oauthUser.screen_name, 'loging out');
		process.nextTick(callback);
	}
}));

require('./routes')(app);

app.listen(6060);

console.log('app server on 6060');

