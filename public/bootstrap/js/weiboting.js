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

	contentWrap.html('正在努力加载中...');

	function get_line(url, page, cb) {
		if (!isLoading) {
			isLoading = true;
			contentWrap.html('正在努力加载中...');
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
			html += '<li><span node-type="text"><span class="text-info">' + item.user.name + '</span> 说: ' + fixText(item.text) + '</span><button node-type="add_one" class="btn btn-mini">加入播放</button></li>';
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

	$('[node-type=cn]').addClass('active');

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
		this.options = {
			lang: 'zh-CN',
			volume: 44,
			rate: 0.5,
			pitch: 0.8
		};
		this.speech = new SpeechSynthesisUtterance();
		this.events = new events();
	}

	weiboTspeech.prototype = {
		constructor: weiboTspeech,
		play: function() {
			if (!speechSynthesis.speaking && this.speeks.length) {
				var msg = this.speeks.shift();
				this.speech.text = msg;
				speechSynthesis.speak(this.speech);
				this.events.trigger('play');
			}
		},
		add: function(msg) {
			this.speeks.push(msg);
			this.events.trigger('add');
			return this;
		},
		init: function() {
			this.set(this.options);
			this.bindEvents(this.speech);
			return this;
		},
		bindEvents: function(speech) {
			var self = this;
			speech.onstart = function() {
				self.events.trigger('start', self);
			};
			speech.onend = function() {
				self.play();
				self.events.trigger('end', self);
			};
			speech.onerror = function(e) {
				self.events.trigger('error', self);
			};
			speech.onpause = function() {
				self.events.trigger('pause', self);
			};
			speech.onresume = function() {
				self.events.trigger('resume', self);
			};
			return this;
		},
		set: function(options) {
			extend(this.speech,options);
			return this;
		},
		clear: function() {
			this.cancel();
			this.speaks = [];
		}
	};

	var myspeaker = new weiboTspeech();
	myspeaker.init();

	if (myspeaker.supportSpeech) {
		$('[node-type=start]').click(function() {
			if (myspeaker.speeks.length) {
				myspeaker.play();
			} else {
				alert('请向播放列表添加微博');
			}
		});
		$('[node-type=add_all]').click(function() {
			contentWrap.find('[node-type=text]').each(function(index,item) {
				var text = $(item).text();
				myspeaker.add(text);
			});
		});

		contentWrap.on('click','[node-type=add_one]',function(e){
var text = $(e.target).parent().find('[node-type=text]').text();
	alert(text);
            		myspeaker.add(text);
        	});

		$('[node-type=cn]').click(function(){
			myspeaker.set({lang:'zh-CN'});
		});
		$('[node-type=hk]').click(function(){
			myspeaker.set({lang:'zh-HK'});
		});
		$('[node-type=tw]').click(function(){
			myspeaker.set({lang:'zh-TW'});
		});

		function showNum() {
			$('[node-type=count]').text(myspeaker.speeks.length);
		}

		myspeaker.events.on('add', showNum);
		myspeaker.events.on('end', showNum);
	}

})();

