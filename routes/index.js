exports.index = function(req, res, next) {
	var user = req.session.oauthUser;
    res.render('index',{
        user:user
    });
};

