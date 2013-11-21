(function() {

	//为了开发简单快速，目前所有代码业务都写在这一个文件里~
	//
	function bind() {
		var hash = window.location.hash.slice(1);
		$('[node-type=nav_li]').removeClass('active');
		if (hash == 'home' || hash === '') {
			home_line();
		} else if (hash == 'public') {
			public_line();
		}
	}

	var contentWrap = $('[node-type=time_line]');

	function get_line(url, page, cb) {
		$.ajax({
			url: url,
			data: {
				count: 20,
                feature:1,
				page: page
			},
			dataType: 'json',
			success: function(json) {
				cb(json);
			}
		});
	}

	function appendContent(items) {
		var html = '<ol class="feeds">';
		items.forEach(function(item) {
			html += '<li><span class="text-info">' + item.user.name + '</span> 说: '+ item.text + '</li>';
		});
		html += '</ol>';
		contentWrap.html(html);
	}

	function home_line() {
		$('[node-type=home_line]').parent().addClass('active');
		get_line('/home_list', 1, function(json) {
            appendContent(json.items);
		});
	}

	function public_line() {
		$('[node-type=public_line]').parent().addClass('active');
		get_line('/public_list', 1, function(json) {
            appendContent(json.items);
        });
	}

	bind();

	$(window).bind('hashchange', bind);
})();

