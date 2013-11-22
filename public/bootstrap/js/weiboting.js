(function() {

	//为了开发简单快速，目前所有代码业务都写在这一个文件里~
	//
	//
	var isLoading;

	function extend(o, p) {
		for (var i in p) {
			o[i] = p[i];
		}
		return o;
	}

	function bind() {
		var hash = window.location.hash.slice(1);
		$('[node-type=nav_li]').removeClass('active');
		if (hash == 'home' || hash === '') {
			home_line();
		} else if (hash == 'public') {
			public_line();
		}
	}

	$('[node-type=nav_li]').click(function() {
		$('[data-toggle=collapse]').trigger('click');
	});

	var contentWrap = $('[node-type=time_line]');

	function get_line(url, page, cb) {
		if (!isLoading) {
			isLoading = true;
			$.ajax({
				url: url,
				data: {
					count: 20,
					feature: 1,
					page: page
				},
				dataType: 'json',
				success: function(json) {
					isLoading = false;
					cb(json);
				}
			});
		}
	}

	var regUrl = /(htt(p|ps):\/\/[A-Za-z\.\d\/\?\&\;\=\-\#_(\u4e00-\u9fa5)]+)/gi;

	function stripscript(s) {
		var pattern = new RegExp("[`~!#$^&*()=|{}':;',\\[\\].<>/?~！#￥……&*（）——|{}【】‘“'。、]");
		var rs = "";
		for (var i = 0; i < s.length; i++) {
			rs = rs + s.substr(i, 1).replace(pattern, ' ');
		}
		return rs;
	}

	function fixText(txt) {
		txt = txt.replace(regUrl, '');
		txt = txt.replace(/\[*.\]/g, '');
		txt = stripscript(txt);
		return txt;
	}

	function appendContent(items) {
		var html = '<ol class="feeds">';
		items.forEach(function(item) {
			html += '<li><span class="text-info">' + item.user.name + '</span> 说: ' + fixText(item.text) + '</li>';
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

	$('[node-type=start]').addClass('active');
	$('[node-type=cn]').addClass('active');

	$('[node-type=con_bar] button').bind('click touchstart', function() {
		$('[node-type=con_bar] button').removeClass('active');
		$(this).addClass('active');
	});
	$('[node-type=lang_bar] button').bind('click touchstart', function() {
		$('[node-type=lang_bar] button').removeClass('active');
		$(this).addClass('active');
	});

	function events() {
		this.map = {};
	}

	extend(events.prototype, {
		trigger: function(name, args) {
			var cbs = this.map[name];
			if (cbs) {
				cbs.forEach(function(fn) {
					fn.apply(this, args);
				});
			}
		},
		on: function(name, cb) {
			if (this.map[name]) {
				this.map[name].push(cb);
			} else {
				this.map[name] = [cb];
			}
		}
	});

	//声音播放类
	//
	function weiboTspeech() {
		this.supportSpeech = (window.speechSynthesis && window.SpeechSynthesisUtterance);
		if (!this.supportSpeech) {
			alert('您当前的环境不支持微博听,请使用ios设备浏览本站');
		}
		this.speeks = [];
		this.events = new events();
	}

	weiboTspeech.prototype = {
		constructor: weiboTspeech,
		play: function() {
			if (!speechSynthesis.speaking && this.speeks.length) {
				var speech = this.speeks.unshift();
				speechSynthesis.speak(speech);
				this.events.trigger('play');
			}
		},
		add: function(msg) {
			var speech = new SpeechSynthesisUtterance(msg);
			speech = extend(speech, this.options);
			speech.text = msg;
			this.speeks.push(speech);
			this.events.trigger('add');
			return this;
		},
		cancel: function() {
			speechSynthesis.cancel();
			return this;
		},
		pause: function() {
			speechSynthesis.pause();
			return this;
		},
		resume: function() {
			speechSynthesis.resume();
			return this;
		},
		init: function() {
			this.options = {
				lang: 'zh-CN',
				volume: 44,
				rate: 0.4,
				pitch: 1
			};
			return this;
		},
		bindEvents: function() {
			var self = this;
			speechSynthesis.start = function() {
				self.events.trigger('start', self);
			};
			speechSynthesis.end = function() {
				self.play();
				self.events.trigger('end', self);
			};
			speechSynthesis.error = function(e) {
				self.events.trigger('error', self);
			};
			speechSynthesis.pause = function() {
				self.events.trigger('pause', self);
			};
			speechSynthesis.resume = function() {
				self.events.trigger('resume', self);
			};
			return this;
		},
		set: function(options) {
			var self = this;
			this.speeks.forEach(function(speek) {
				extend(self.options, options);
				extend(speek, self.options);
			});
			return this;
		},
		clear: function() {
			this.cancel();
			this.speaks = [];
		}
	};

	var myspeaker = new weiboTspeech();

	if (myspeaker.supportSpeech) {
		$('[node-type=start]').click(function() {
			if (myspeaker.speaks.length) {
				myspeaker.play();
			} else {
				alert('请向播放列表添加微博');
			}
		});
		$('[node-type=stop]').click(function() {
			myspeaker.pause();
		});
		$('[node-type=abort]').click(function() {
			myspeaker.cancel();
		});
		$('[node-type=add_all]').click(function() {
			contentWrap.find('li').each(function(item) {
				var text = $(item).text();
				myspeaker.add(item);
			});
		});

		function showNum() {
			$('[node-type=count]').text(myspeaker.speeks.length);
		}

		myspeaker.events.on('add', showNum);
		myspeaker.events.on('end', showNum);
		myspeaker.events.on('cancel', showNum);
	}

})();

