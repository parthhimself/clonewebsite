//'use strict';

if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(search, this_len) {
		return this.substring(this.length - search.length, this.length) === search;
	};
}

/////////////////////////////////////////////////////////////////////////////////

window.pdf24 = window.pdf24 || {};

pdf24.isDevel = location.host == 'tools.pdf24.devel';

/////////////////////////////////////////////////////////////////////////////////

pdf24.actions = [];

pdf24.addAction = function(tag, callback, thisArg) {
	pdf24.actions.push({
		tag : tag,
		callback : callback,
		thisArg : thisArg
	});
};

pdf24.doAction = function(tag) {
	var actionArgs = [].slice.apply(arguments);
	actionArgs.shift();
	
	var actions = pdf24.actions.slice();
	for(var i = 0; i < actions.length; i++) {
		var action = actions[i];
		if(action.tag == tag) {
			action.callback.apply(action.thisArg, actionArgs);
		}
	}
};

/////////////////////////////////////////////////////////////////////////////////

pdf24.reportError = function(code, data, success) {
	var reportData = {
		source: location.href,
		navigator: {
			appCodeName : navigator.appCodeName || '',
			appName : navigator.appName || '',
			appVersion : navigator.appVersion || '',
			language : navigator.language || '',
			platform : navigator.platform || '',
			userAgent : navigator.userAgent || ''
		},
		error: data
	};
	
	pdf24.doPost0({
		action: 'reportError',
		code: code,
		data: JSON.stringify(reportData)
	}, success);
};

pdf24.errorHandler = function(msg, url, line, col, error) {
	msg = msg || '';
	url = url || '';
	line = line || '';
	col = col || '';
	error = error || {};
		
	// check for special script error
	var scriptError = msg.toLowerCase().indexOf('script error') >= 0;
	
	// do not report too much errors
	var currTime = pdf24.currentTimeMs();
	var lastErrorReportTime = pdf24.lastErrorReportTime || 0;
	var isTimeLock = currTime - lastErrorReportTime < 5000;
	if(isTimeLock) {
		return false;
	}
	
	// check for already reported
	var errId = msg + ':' + url + ':' + line + ':' + col;
	pdf24.errorsReported = pdf24.errorsReported || {};
	var isErrorReported = pdf24.errorsReported[errId] ? true : false;
	if(isErrorReported) {
		return false;
	}
	
	// ok, send report
	pdf24.errorsReported[errId] = true;
	pdf24.lastErrorReportTime = currTime;
	
	pdf24.reportError('scriptError', {
		msg : msg,
		url : url,
		line : line,
		col : col,
		stack : error.stack || ''
	});
	
	return false;
};

//window.onerror = pdf24.errorHandler;

pdf24.reportXhrError = function(code, xhr, reqData, success) {
	xhr = xhr || {};
	pdf24.reportError(code, {
		status: xhr.status || '',
		statusText: xhr.statusText || '',
		responseText: xhr.responseText || '',
		reqData: reqData
	}, success);
};

/////////////////////////////////////////////////////////////////////////////////

pdf24.doGet0 = function(data, success, error) {
	$.ajax({
		url : '/client.php',
		type : 'GET',
		data : data,
		success : success,
		error : error
	});
};

pdf24.doPost0 = function(data, success, error) {
	$.ajax({
		url : '/client.php',
		type : 'POST',
		data : data,
		success : success,
		error : error
	});
};

pdf24.doPostJson0 = function(action, data, success, error) {
	$.ajax({
		url: '/client.php?action=' + action,
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: success,
		error: error
	});
};

pdf24.doGet = function(data, success, error) {
	pdf24.doGet0(data, success, function(xhr) {
		pdf24.reportXhrError('getError', xhr, data);
		if(error) {
			error.apply(this, arguments);
		}
	});
};

pdf24.doPost = function(data, success, error) {
	pdf24.doPost0(data, success, function(xhr) {
		pdf24.reportXhrError('postError', xhr, data);
		if(error) {
			error.apply(this, arguments);
		}
	});
};

pdf24.doPostJson = function(action, data, success, error) {
	pdf24.doPostJson0(action, data, success, function(xhr) {
		pdf24.reportXhrError('postError', xhr, [action, data]);
		if(error) {
			error.apply(this, arguments);
		}
	});
};

/////////////////////////////////////////////////////////////////////////////////

pdf24.isMobile = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

pdf24.isPlainObject = function(e) {
    return "object" == typeof e && null !== e && e.constructor == Object
};

pdf24.once = function(func) {
	return function() {
		func && func.apply(this, arguments);
		func = null;
	}
};

pdf24.getQueryParam = function(name, def) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var url =  window.location.href;
	var regex = new RegExp("([\\?&#]|#!)"+name+"=([^&#]*)");
	var results = regex.exec(url);
	if(results) {
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
	return def;
}

pdf24.currentTimeMs = function() {
	return (new Date()).getTime();
};

pdf24.requireScript = function(conf) {	
	if(conf.loadCheck()) {
		conf.callback();
		return;
	}
	
	var scripts = conf.scripts || [conf.script];
	for(var i=0; i<scripts.length; i++) {
		var script = scripts[i];
		var scriptId = script.id || script.src.replace('/','-');
		if(document.getElementById(scriptId)) {
			continue;
		}
		var element = $('<script>');
		element.attr('type', 'text/javascript');
		element.attr('id', scriptId);
		var attribs = script.attribs || {};
		for (var k in attribs) {
			if(attribs.hasOwnProperty(k)) {
				element.attr(k, attribs[k]);
			}
		}
		element.appendTo('body');
		element.attr('src', script.src);
	}
	
	var interval = setInterval(function() {
		if(conf.loadCheck()) {
			clearInterval(interval);
			conf.callback();
		}
	});
};

pdf24.requireCss = function(conf) {
	var files = conf.files || [conf.file];
	for(var i=0; i<files.length; i++) {
		var file = files[i];
		var fileId = file.id || file.src.replace('/','-');
		if(document.getElementById(fileId)) {
			continue;
		}
		var element = $('<link>');
		element.attr('rel', 'stylesheet');
		element.attr('type', 'text/css');
		element.attr('id', fileId);
		element.attr('href', file.src);
		var attribs = file.attribs || {};
		for (var k in attribs) {
			if(attribs.hasOwnProperty(k)) {
				element.attr(k, attribs[k]);
			}
		}
		element.appendTo('body');
	}
};

pdf24.localStorage = {
	removeItem : function(name) {
		try {
			window.localStorage.removeItem(name);
			return true;
		} catch(e) {
			console.log(e);
		}
		return false;
	},
	setItemString : function(name, item) {
		try {
			if(item == undefined || item == null) {
				item = null;
			}
			if(item && typeof item != 'string' && item.toString && typeof item.toString == 'function') {
				item = item.toString();
			}
			window.localStorage.setItem(name, item);
			return true;
		} catch(e) {
			console.log(e);
		}
		return false;
	},
	setItemObject : function(name, item) {
		try {
			if(item == undefined || item == null) {
				item = null;
			}
			item = JSON.stringify(item);
			return this.setItemString(name, item);
		} catch(e) {
			console.log(e);
		}
		return false;
	},
	getItemString : function(name, def) {
		try {
			var item = window.localStorage.getItem(name);
			if(item != null) {
				return item;
			}
		} catch(e) {
			console.log(e);
		}
		return def;
	},
	getItemObject : function(name, def) {
		try {
			var item = this.getItemString(name, null);
			if(item) {
				return JSON.parse(item);
			}
		} catch(e) {
			console.log(e);
		}
		return def;
	}
};

pdf24.trackEvent = function(category, action, label) {
	if(typeof ga != 'undefined') {
		ga('send', 'event', {
			'eventCategory' : category || '',
			'eventAction' : action || '',
			'eventLabel' : label || ''
		});
	}
};

pdf24.trackPageEvent = function(category, action, label) {
	if(document && document.body && document.body.id) {
		category += '@' + document.body.id;
	}
	pdf24.trackEvent(category, action, label);
};

pdf24.trackPageView = function(page) {
	if(typeof ga != 'undefined') {
		ga('send', 'pageview', page);
	}
};

pdf24.openPopupCentered = function(url, name, w, h) {
	var left = (screen.width - w) /2;
	var top = (screen.height - h) / 4;
	return window.open (url, name, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
};

pdf24.openSharePopup = function(which, url) {
	var baseUrls = {
		'googlePlus' : 'https://plus.google.com/share?url=',
		'facebook' : 'https://www.facebook.com/sharer/sharer.php?u=',
		'twitter' : 'https://twitter.com/intent/tweet?url='
	};
	if(typeof url == 'undefined' || !url) {
		url = location.href;
	}
	var url = baseUrls[which] + encodeURIComponent(url);
	pdf24.openPopupCentered(url, '', 600, 400);
	pdf24.trackPageEvent('Share', 'ShareBtnClick', which);
};

pdf24.openExtLink = function(link) {
	window.open(link, '_blank');
};

pdf24.scrollIntoView = function(selector) {
    var elem_position = $(selector).offset().top;
    var y = elem_position - $(window).height() / 4;
    window.scrollTo(0,y);
};

pdf24.dblClickProtect = function(key, timeout) {
	timeout = timeout || 1000;
	pdf24.dblClickProtection = pdf24.dblClickProtection || {};
	var last = pdf24.dblClickProtection[key] || null;
	var currTime = new Date().getTime();
	if(last && currTime - last < timeout) {
		return false;
	}
	pdf24.dblClickProtection[key] = currTime;
	return true;
};

pdf24.createQueue = function() {
	var queue = {
		data: [],
		add: function(v) {
			this.data.push(v);
		},
		remove: function(v) {
			var newData = [];
			for(var i=0; i<this.data.size; i++) {
				if(this.data[i] != v) {
					newData.push(data.files[i]);
				}
			}
			this.data = newData;
		},
		isEmpty: function() {
			return this.data.length == 0;
		}
	};
	return queue;
};

pdf24.findAncestor = function(el, cls) {
	while ((el = el.parentNode) && !$(el).hasClass(cls));
	return el;
};

pdf24.makeFullWidth = function(selector) {
	$(selector).each(function(e) {
		var e = $(this);
		var lm = e.data('lastHorzMargin') || 0;
		var ol = Math.min(0, -e.offset().left + lm);
		e.css({
			'position' : 'relative',
			'margin-left' : ol + 'px',
			'margin-right' : ol + 'px'
		});
		e.data('lastHorzMargin', ol);
	});
};

$(function() {
	pdf24.makeFullWidth('.fullWidth');
	$(window).resize(function() {
		pdf24.makeFullWidth('.fullWidth');
	});
});

/////////////////////////////////////////////////////////////////////////////////

$(function() {
	var images = $('img.lazyLoad, img.lazyLoadHidden');
	images.each(function() {
		var e = $(this);
		var src = e.attr('src');
		if(!src) {
			e.attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
		}
	});
});

pdf24.lazyLoadImages = function(selector) {
	var images = $(selector);
	images.each(function() {
		var e = $(this);
		var dataSrc = e.data('src');
		if(dataSrc) {
			e.on('load', function() {
				e.removeClass('lazyLoadHidden hidden');
				e.addClass('lazyLoad');
			});
			e.attr('src', dataSrc);
		}
	});
};

$(window).on('load', function() {
	var images = $('img.lazyLoad, img.lazyLoadHidden');
	var imagesInCollapsedSection = $('.sectionsCollapsed .section').find('img.lazyLoad, img.lazyLoadHidden');
	var imagesToLoad = images.not(imagesInCollapsedSection);
	pdf24.lazyLoadImages(imagesToLoad);
});

pdf24.addAction('sectionExpand', function(section) {
	var images = section.find('img.lazyLoad, img.lazyLoadHidden');
	pdf24.lazyLoadImages(images);
});

/////////////////////////////////////////////////////////////////////////////////

pdf24.showInfoWin = function(which, closeCallback) {
	pdf24.doGet({action:'getInfo', which:which}, function(result) {
		if(!result.success) {
			var_alert(result);
		} else {
			var content = result.data;
			LayerWindow.show({data:content, onClose:closeCallback, bottomLayerMode:'iframe'});
		}
	});
};

pdf24.smallLoader = function(data) {
	if (typeof data == 'string') {
		data = {
			id : data
		};
	}
	data.img = '/static/img/loadingSmall.gif';
	return LoadingState.set(data);
};

pdf24.boxFitText = function(selector) {
	var isOverflowed = function(e) {
		return e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1;
	}
	for(var i = 0; i < 25; i++) {
		var oneOverflowed = false;
		$(selector).each(function() {
			if(isOverflowed(this)) {
				oneOverflowed = true;
				var fs = $(this).css('font-size').replace('px','');
				$(this).css('font-size', parseInt(fs) - 1);
			}
		});
		if(!oneOverflowed) {
			break;
		}
	}
};

pdf24.toolSelectBoxFit = function() {
	pdf24.boxFitText('.toolSelect .label');
};

$(pdf24.toolSelectBoxFit);

pdf24.requirePageIcons = function() {
	pdf24.requireCss({
		file: {
			id: 'pageIconsCss',
			src: '/static/css/pageIcons.css?v=2'
		}
	});
};

$(function() {
	var pageId = document.body.id;
	if(pageId == 'home') {
		pdf24.requirePageIcons();
	}
	else if(window.IntersectionObserver) {
		var observer = new IntersectionObserver(function(entries) {
			if(entries && entries.length > 0 && entries[0].isIntersecting) {
				pdf24.requirePageIcons();
			}
		});
		observer.observe(document.querySelector('.toolSelect'));
	}
	else {
		pdf24.requirePageIcons();
	}	
});

$(function() {
	$('.showOnDocReady').removeClass('showOnDocReady');
	$('.enableOnDocReady').removeClass('enableOnDocReady');
});

/////////////////////////////////////////////////////////////////////////////////

pdf24.initAndShowWorkerZone = function(url) {
	$('#workerZone iframe').attr('src', url);
	$('#workerZone').show();
	pdf24.scrollIntoView('#workerZone');
};

pdf24.cloneInitShowWorkerZone = function(url, conf) {
	conf = conf || {};
	var wzone = $('#workerZone').clone();
	wzone.removeClass('template hidden');
	wzone.attr('id', 'workerZone-' + $('.workerZone').length);
	wzone.addClass('workerZone');
	wzone.find('iframe').attr('src', url);
	wzone.find('.info').html(conf.zoneInfo || '');
	if($('#workerZones').length == 1) {
		$('#workerZones').prepend(wzone).removeClass('hidden').show();
	} else {
		$('#workerZone').after(wzone);
	}
	if(conf.fadeIn) {
		wzone.css('opacity','0').animate({opacity:1}, 750);
	}
	if(conf.zoneId) {
		wzone.data('zoneId', conf.zoneId);
	}
	wzone.show();
	pdf24.scrollIntoView(wzone);
	if(conf.pulseIfMultiple && $('.workerZone').length > 1) {
		pdf24.pulseWorkerZone(wzone);
	}
	return wzone;
};

pdf24.findWorkerZoneById = function(zoneId) {
	var workerZone = false;
	$('.workerZone').each(function() {
		if(zoneId == $(this).data('zoneId')) {
			workerZone = this;
			return false; // break each
		}
	});
	return workerZone;
}

pdf24.pulseWorkerZone = function(wzone) {	
	pdf24.scrollIntoView(wzone);
	wzone = $(wzone);
	if(wzone.data('pulsing')) {
		return;
	}
	wzone.data('pulsing', true);
	var borderColor = wzone.css('border-color');
	var boxShadow = wzone.css('box-shadow');
	var counter = 0;
	var interval = setInterval(function() {
		counter += 1;
		if(counter % 2) {
			wzone.css('border-color', borderColor);
			wzone.css('box-shadow', boxShadow);
			if(counter >= 6) {
				clearInterval(interval);
				wzone.data('pulsing', false);
			}
		} else {
			wzone.css('border-color', 'red');
			wzone.css('box-shadow', '0 0 5px red');
		}
	}, 250);
};

$(window).on("message onmessage", function(e) {
	var event = e.originalEvent;
	$('#workerZone, .workerZone').each(function() {
		var workerZone = $(this);
		var iframe = workerZone.find('iframe');
		if(iframe.length > 0 && iframe[0].contentWindow == event.source) {
			var requiredHeight = event.data.contentHeight;
			var frameHeight = iframe.height();
			if(frameHeight < requiredHeight || frameHeight > requiredHeight * 1.1) {
				iframe.css('height', (requiredHeight * 1.05) + 'px');
				//pdf24.scrollIntoView(workerZone);
			}
			return false;
		}
	});
});

/////////////////////////////////////////////////////////////////////////////////

pdf24.isSameServerFile = function(file1, file2) {
	if(!file1 || !file2) {
		return false;
	}
	return file1.file == file2.file && file1.size == file2.size;
};

pdf24.getWorkerServerUrl = function(arg) {
	if(arg.startsWith('http://') || arg.startsWith('https://')) {
		return arg;
	}
	
	if(arg == 'devel') {
		return 'http://doc2pdf.pdf24.devel';
	}
	
	if(arg.indexOf('.') > 0) {
		return 'https://' + arg;
	}
	return 'https://'+ arg +'.pdf24.org';
};

pdf24.createWorkerServerClient = function(conf) {
	if(conf.hostName) {
		conf.url = pdf24.getWorkerServerUrl(conf.hostName);
	}
	if(conf.host) {
		conf.url = pdf24.getWorkerServerUrl(conf.host);
	}
	
	var ws = {};
	ws.doGet0 = function(data, success, error) {
		$.ajax({
			url : conf.url + '/client.php',
			type : 'GET',
			data : data,
			success : success,
			error : error
		});
	};
	ws.doPost0 = function(data, success, error) {
		$.ajax({
			url : conf.url + '/client.php',
			type : 'POST',
			data : JSON.stringify(data),
			contentType : 'application/json; charset=utf-8',
			success : success,
			error : error
		});
	};
	ws.doGet = function(data, success, error) {
		ws.doGet0(data, success, function(xhr) {
			pdf24.reportXhrError('wsGetError', xhr, data);
			if(error) {
				error.apply(this, arguments);
			}
		});
	};
	ws.doPost = function(data, success, error) {
		ws.doPost0(data, success, function(xhr) {
			pdf24.reportXhrError('wsPostError', xhr, data);
			if(error) {
				error.apply(this, arguments);
			}
		});
	};
	ws.doGetFile = function(serverFile, success, error) {
		var params = {action : 'getFile'};
		if(typeof serverFile == 'object') {
			params.file = serverFile.file;
		} else {
			params.file = serverFile;
		}
		ws.doGet(params, success, error);
	};
	ws.getFileUrl = function(serverFile, params) {
		params = params || {};
		if(typeof serverFile == 'object') {
			params.file = serverFile.file;
		} else {
			params.file = serverFile;
		}
		return conf.url + '/client.php?action=getFile&' + jQuery.param(params);
	};
	ws.getStateUrl = function(params) {
		params = params || {};
		var url = conf.url + '/state.php?' + jQuery.param(params);
		if(params.restartable == undefined || params.restartable) {
			url += '&restartable=1';
		}
		if(params.parentResizable == undefined || params.parentResizable) {
			url += '&parentResizable=1';
		}
		url += '&parentUrl=' + encodeURIComponent(document.location.href);
		return url;
	};
	ws.getUploadUrl = function() {
		return conf.url + '/client.php?action=upload';
	};
	return ws;
};

pdf24.selectWorkerServer = function(conf, callback) {
	conf = conf || {};
	conf.pageId = conf.pageId || 'unknown';
	
	callback = callback || function(ws) {};
		
	var wsh = pdf24.getQueryParam('wsh', false);
	if(wsh) {
		pdf24.workerServer = pdf24.createWorkerServerClient({
			host : wsh
		});
		callback(pdf24.workerServer);
		return;
	}
	
	var wshn = pdf24.getQueryParam('wshn', false);
	if(wshn) {
		pdf24.workerServer = pdf24.createWorkerServerClient({
			hostName : wshn
		});
		callback(pdf24.workerServer);
		return;
	}
	
	if(pdf24.isDevel) {
		pdf24.workerServer = pdf24.createWorkerServerClient({
			url : 'http://doc2pdf.pdf24.devel'
		});
		callback(pdf24.workerServer);
		return;
	}
	
	var serverUrls = [
		'https://filetools1.pdf24.org',
		'https://filetools2.pdf24.org',
		'https://filetools3.pdf24.org'
	];
	
	var index = Math.floor(Math.random() * serverUrls.length);
	var serverUrl = serverUrls[index];
	pdf24.workerServer = pdf24.createWorkerServerClient({
		url : serverUrl
	});
	callback(pdf24.workerServer);
};

pdf24.splitJobId = function(jobId) {
	var parts = jobId.replace(':','/').split('/');
	if(parts.length != 2) {
		return false;
	}

	var jobHostName = parts[0];
	var jobId = parts[1];
	return {
		id : jobId,
		hostName : jobHostName,
		wsc : pdf24.createWorkerServerClient({
			hostName : jobHostName
		})
	};
};

$(function() {
	$('.linkLock').each(function(i, v) {
		var jv = $(v);
		jv.data('linkLockActivateTimeout', null);
		jv.data('linkLockActivate', false);
		jv.find('a').click(function(e) {
			if(!jv.data('linkLockActivate')) {
				 e.preventDefault();
			}
		});
		jv.hover(function() {
			jv.data('linkLockActivateTimeout', setTimeout(function() {
				jv.data('linkLockActivate', true);
			}, 750));
		}, function() {
			jv.data('linkLockActivate', false);
			clearTimeout(jv.data('linkLockActivateTimeout'));
		});
	});
});

$(function() {	
	$('#footerLangSwitch a').click(function(ev) {		
		var p = $(ev.target).parents('#footerLangSwitch ul');
		if(!p.length == 1 || !p.hasClass('clicked')) {
			ev.preventDefault();
		}
	});
	$('#footerLangSwitch ul').click(function(ev) {
		ev.footerLangClick = true;
		$('#footerLangSwitch ul').addClass('clicked');
	});
	$(document).click(function(ev) {
		if($(ev.target).parents('#footerLangSwitch').length == 0) {
			$('#footerLangSwitch ul').removeClass('clicked');
		}
	});
});

pdf24.toggleTopToolSelect = function() {
	if($('#bottomToolSelect').length && !$('#topToolSelect .toolSelect').length) {
		var toolSelectNode = $('#bottomToolSelect .content').clone(true, true);
		$('#topToolSelect').append(toolSelectNode);
		pdf24.doAction('topToolSelectInitialized', toolSelectNode);
	}
	
	if($('#topToolSelect').is(':visible')) {
		$('#topToolSelect').hide();
		$('h1,h2').addClass('dark');
		$('#topBar .menu .burger').removeClass('active');
		$('#topBar .allTools').removeClass('active');
	} else {
		pdf24.requirePageIcons();
		$('#topToolSelect').show();
		$('h1,h2').removeClass('dark');
		$('#topBar .menu .burger').addClass('active');
		$('#topBar .allTools').addClass('active');
	}
};

$(function() {
	$('#topBar .menu .burger').click(function() {
		pdf24.toggleTopToolSelect();
		pdf24.trackPageEvent('UI', 'BurgerMenuClick', '');
	});
});

$(function() {
	$('#topBar .allTools').click(function() {
		pdf24.toggleTopToolSelect();
		pdf24.trackPageEvent('UI', 'AllToolsClick', '');
	});
});

$(function() {	
	$('#topBar .logo').on('click', function(ev) {
		pdf24.trackPageEvent('UI', 'PageLogoClick', '');
		return true;
	});
});

/*
$(function() {
	$('a').on('click', function() {
		var l = $(this);
		var id = l.attr('id');
		var href = l.attr('href');
		pdf24.trackPageEvent('UI', 'LinkClick', href || id || '');
		return true;
	});
});
*/

pdf24.monitorJobState = function(jobId, finishCallback, errorCallback) {
	var statusMonInterval = setInterval(function() {
		pdf24.workerServer.doGet({
			action : 'getStatus',
			jobId : jobId
		}, function(result) {
			if(result.status == 'done') {
				clearInterval(statusMonInterval);
				finishCallback(result);
			}
		}, function(xhr) {
			xhr = xhr || {};
			var status = xhr.status;
			if(status == 400 || status == 404) {
				clearInterval(statusMonInterval);
				console.warn('Error monitoring job', status, xhr.responseText);
				if(errorCallback) {
					errorCallback(xhr);
				}
			}
		});
	}, 1000);
};

pdf24.toPdfConverter = {
	jobs : [],
	doConvert : function() {
		var jobs = this.jobs;
		this.jobs = [];
		this.timeout = null;
		
		var nonPdfJobs = [];
		for(var i=0; i<jobs.length; i++) {
			if(jobs[i].serverFile.file.endsWith('.pdf')) {
				jobs[i].serverFile.pdfFile = jobs[i].serverFile;
				jobs[i].callback(jobs[i].serverFile);
			} else if(!jobs[i].serverFile.conversionToPdf) {
				jobs[i].serverFile.conversionToPdf = true;
				nonPdfJobs.push(jobs[i]);
			}
		}
		if(nonPdfJobs.length == 0) {
			return;
		}
		
		var nonPdfServerFiles = [];
		for(var i=0; i<nonPdfJobs.length; i++) {
			nonPdfServerFiles.push(nonPdfJobs[i].serverFile);
		}

		pdf24.workerServer.doPost({
			action : 'convertToPdf',
			files : nonPdfServerFiles
		}, function(result) {
			pdf24.monitorJobState(result.jobId, function(result) {
				var jobParams = result.job;
				for(var i=0; i<nonPdfServerFiles.length; i++) {
					var prefix = 'job.' + i;
					if(result.job[prefix + '.state'] == '3') {
						nonPdfServerFiles[i].pdfFile = {
							file : result.job[prefix + '.out'],
							size : result.job[prefix + '.out.size'],
							name : result.job[prefix + '.out.name']
						};
					} else {
						nonPdfServerFiles[i].conversionToPdfError = {
							state : result.job[prefix + '.state']
						};
					}
					nonPdfJobs[i].callback(nonPdfServerFiles[i]);
				}
			}, function(xhr) {
				alert('An error occured while converting files to PDF.');
			});
		}, function(xhr) {
			alert('An error occured while converting files to PDF.');
		});
	},
	convert : function(serverFile, callback) {
		if(serverFile.file.endsWith('.pdf')) {
			serverFile.pdfFile = $.extend({}, serverFile);
			callback(serverFile);
			return;
		}
		this.jobs.push({
			serverFile : serverFile,
			callback : callback
		});
		if(this.timeout) {
			clearTimeout(this.timeout);
		}
		this.timeout = setTimeout(this.doConvert.bind(this), 1000);
	}
};

pdf24.preferPdfFile = function(fileInfo) {
	return fileInfo.pdfFile || fileInfo;
}

pdf24.preferPdfFiles = function(fileInfos) {
	var preferred = [];
	for(var i=0; i<fileInfos.length; i++) {
		preferred.push(pdf24.preferPdfFile(fileInfos[i]));
	}
	return preferred;
}

pdf24.configurePdfJs = function() {
	var pdfjs = pdf24.pdfjs = window['pdfjsLib'];
	pdfjs.GlobalWorkerOptions.workerSrc = '/static/js/pdfjs/build/pdf.worker.js?v=1';
};

pdf24.requirePdfJs = function(callback) {
	if(!pdf24.pdfjs && window['pdfjsLib']) {
		pdf24.configurePdfJs();
	}
	if(pdf24.pdfjs) {
		callback(pdf24.pdfjs);
		return;
	}
	
	if(!pdf24.pdfjsCallbacks) {
		pdf24.pdfjsCallbacks = [];	
	}
	pdf24.pdfjsCallbacks.push(callback);
	
	var pdfjsScriptId = 'pdfJsScript';
	if($('#' + pdfjsScriptId).length > 0) {
		return;
	}
	
	var pdfjsSrc = pdf24.pdfjsSrc || '/static/js/pdfjs/build/pdf.js?v=1';
	var pdfjsScript = $('<script>');
	pdfjsScript.attr('type', 'text/javascript');
	pdfjsScript.attr('id', pdfjsScriptId);
	pdfjsScript.appendTo('body');
	pdfjsScript.attr('src', pdfjsSrc);
	
	pdf24.pdfjsLoadInterval = setInterval(function() {
		if(window['pdfjsLib']) {
			clearInterval(pdf24.pdfjsLoadInterval);
			pdf24.pdfjsLoadInterval = null;
			
			pdf24.configurePdfJs();
			
			for(var i=0; i<pdf24.pdfjsCallbacks.length; i++) {
				pdf24.pdfjsCallbacks[i](pdf24.pdfjs);
			}
			pdf24.pdfjsCallbacks = [];
		}
	}, 100);
};

pdf24.pdfIdForServerFile = function(serverFile, targetId) {
	var pdfId = targetId + '_pdf_' + serverFile.file.replace('.', '_');
	return pdfId;
};

pdf24.showPdfPagesForFile = function(conf) {
	var workerServer = conf.workerServer;
	var serverFile = conf.serverFile;
	var pageScale = conf.pageScale || (0.5 * (window.devicePixelRatio || 1));
	var pageLoadImg = conf.pageLoadImg;
	var docLoadImg = conf.docLoadImg || pageLoadImg;
	var pageTitle = conf.pageTitle;
	var onDocStart = conf.onDocStart || function(vars) {};
	var onDocPageStart = conf.onDocPageStart || function(vars) {};
	var onDocEnd = conf.onDocEnd || function(vars) {};
	var onPageStart = conf.onPageStart || function(vars) {};
	var onPageEnd = conf.onPageEnd || function(vars) {};
	var onPageRenderStart = conf.onPageRenderStart || function(vars) {};
	var onPageRenderEnd = conf.onPageRenderEnd || function(vars) {};
	var onPageImgClick = conf.onPageImgClick || function(pdfPageId) {};
	var targetId = conf.targetId || 'pdfLoadZone';
	var pdfId = pdf24.pdfIdForServerFile(serverFile, targetId);
	var pageClass = conf.pageClass || '';
	
	var pdfFileObj = $('<div id="'+ pdfId +'" class="pdfFile"></div>');
	pdfFileObj.data('serverFile', serverFile);
	
	var pdfFileTools = $('<div id="'+ pdfId +'_tools" class="pdfFileTools"></div>');
	pdfFileObj.append(pdfFileTools);
	
	var pdfFilePages = $('<div id="'+ pdfId +'_pages" class="pdfPages"></div>');
	pdfFileObj.append(pdfFilePages);
	
	if(docLoadImg) {
		var docImgLoadObj = $('<img class="pdfFileLoader" src="'+ docLoadImg +'" />');
		pdfFilePages.append(docImgLoadObj);
	}
	
	$('#' + targetId).append(pdfFileObj);
	
	pdf24.toPdfConverter.convert(serverFile, function(serverFile) {
		if(!serverFile.pdfFile) {
			return;
		}
		pdf24.requirePdfJs(function(pdfjs) {
			pdfjs.getDocument({
				url : workerServer.getFileUrl(serverFile.pdfFile),
				cMapUrl : '/static/js/pdfjs/web/cmaps/',
				cMapPacked : true
			}).then(function(pdfDoc) {

				onDocStart({
					conf:conf, pdfId:pdfId, pdfDoc:pdfDoc
				});

				for(var pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
					(function(pdfDoc, pageNum) {
						pdfFilePages.find('.pdfFileLoader').remove();
						
						var pdfPageId = pdfId + '_' + pageNum;
						var pdfPageObj = $('<div id="'+ pdfPageId +'" class="pdfPage"></div>');
						pdfPageObj.data('pageNum', pageNum);
						pdfPageObj.data('serverFile', serverFile.pdfFile);
						pdfPageObj.addClass(pageClass);
						pdfFilePages.append(pdfPageObj);
						
						var pdfPageImgContainer = $('<div class="pdfPageImgContainer"></div>');
						pdfPageObj.append(pdfPageImgContainer);
						
						if(pageLoadImg) {
							var pdfPageImgLoadObj = $('<img class="pdfPageLoader" src="'+ pageLoadImg +'" />');
							pdfPageImgContainer.append(pdfPageImgLoadObj);
						}
						
						onPageStart({
							conf:conf, pdfDoc:pdfDoc, pageNum:pageNum, pageId:pdfPageId
						});
						
						pdfDoc.getPage(pageNum).then(function(pdfPage) {
							var viewport = pdfPage.getViewport(pageScale);
							var canvas = document.createElement('canvas');
							var ctx = canvas.getContext('2d');
							canvas.height = viewport.height;
							canvas.width = viewport.width;
							var renderCtx = {
								canvasContext: ctx,
								viewport: viewport
							};
							
							onPageRenderStart({
								conf:conf, pdfDoc:pdfDoc, pageNum:pageNum, pageId:pdfPageId,
								pdfPage:pdfPage, renderCtx:renderCtx
							});
							
							pdfPage.render(renderCtx).then( function() {						
								ctx.globalCompositeOperation = 'destination-over';
								ctx.fillStyle = "#fff";
								ctx.fillRect( 0, 0, canvas.width, canvas.height );
								
								var pdfPageImgSrc = canvas.toDataURL();
								var pdfPageImg = $('<img class="pdfPageImg" />');
								if(pageTitle) {
									var filename = serverFile.name || serverFile.file;
									var thisPageTitle = pageTitle.replace('{pageNum}', pageNum).replace('{fileName}', filename);
									pdfPageImg.attr('title', thisPageTitle);
								}
								pdfPageImg.attr('src', pdfPageImgSrc);
								pdfPageImg.click(function() {
									onPageImgClick(pdfPageId);
								});
								pdfPageImg.hover(function() {
									pdfPageObj.addClass('imgHovered');
								}, function() {
									pdfPageObj.removeClass('imgHovered');
								});
								
								pdfPageImgContainer.find('.pdfPageLoader').remove();
								pdfPageImgContainer.append(pdfPageImg);
								pdfPageObj.addClass('rendered');
								
								canvas.remove();
								
								onPageRenderEnd({
									conf:conf, pdfDoc:pdfDoc, pageNum:pageNum, pageId:pdfPageId,
									pdfPage:pdfPage, renderCtx:renderCtx
								});
							});
							
							onPageEnd({
								conf:conf, pdfDoc:pdfDoc, pageNum:pageNum,
								pageId:pdfPageId, pdfPage:pdfPage
							});
						});
					})(pdfDoc, pageNum);
				}
				
				onDocEnd({
					conf:conf, pdfId:pdfId, pdfDoc:pdfDoc
				});
			});
		});
	});
};

pdf24.showPdfPagesForFiles = function(serverFiles, conf) {
	var targetId = conf.targetId || 'pdfLoadZone';
	for(var i=0; i<serverFiles.length; i++) {
		var serverFile = serverFiles[i];
		var pdfId = pdf24.pdfIdForServerFile(serverFile, targetId);
		if($('#' + targetId).find('#' + pdfId).length > 0) {
			continue;
		}
		var fileConf = $.extend({}, conf);
		fileConf.serverFile = serverFile;
		pdf24.showPdfPagesForFile(fileConf);
	}
};

/////////////////////////////////////////////////////////////////////////////////

pdf24.requireSlick = function(callback) {
	var slickLoaded = false;
	var slickLightboxLoaded = false;
	var checkAllLoaded = function() {
		if(slickLoaded && slickLightboxLoaded) {
			callback();
		}
	};
	
	pdf24.requireCss({
		file: {
			id: 'slickAllCss',
			src: '/static/js/slick/slick.all.css?v=1'
		}
	});
	
	pdf24.requireScript({
		loadCheck: function() {
			return jQuery().slick;
		},
		callback: function() {
			slickLoaded = true;
			checkAllLoaded();
		},
		script: {
			id: 'slickScript',
			src: '/static/js/slick/slick.patched.js?v=1'
		}
	});
	
	pdf24.requireScript({
		loadCheck: function() {
			return jQuery().slickLightbox;
		},
		callback: function() {
			slickLightboxLoaded = true;
			checkAllLoaded();
		},
		script: {
			id: 'slickLightboxScript',
			src: '/static/js/slick/lightbox/slick-lightbox.min.js?v=1'
		}
	});
};

pdf24.initImageSlider = function(selector) {
	var items = $(selector);
	if(items.length == 0) {
		return;
	}
	
	pdf24.requireSlick(function() {
		items.each(function() {
			var imgSlider = $(this);
			
			if(imgSlider.hasClass('slick-initialized')) {
				return;
			}
			
			var id = (imgSlider.attr('id') || 'unknown').replace('ImgSlider', '');
			var images = imgSlider.find('img');
			var imgCnt = images.length;
			var slides = imgSlider.data('slides') || 3;
			
			imgSlider.slick({
				arrows: true,
				infinite: false,
				slidesToShow: slides,
				slidesToScroll: 1,
				dots: imgCnt > slides,
				speed: 300,
				adaptiveHeight: true,
				responsive: [{
					breakpoint: 768,
					settings: {
						arrows: true,
						slidesToShow: Math.max(1, slides - 1),
						dots: imgCnt > Math.max(1, slides - 1)
					}
				}, {
					breakpoint: 530,
					settings: {
						arrows: true,
						slidesToShow: Math.max(1, slides - 2),
						dots: imgCnt > Math.max(1, slides - 2)
					}
				}]
			}).on('beforeChange', function(ev) {
				pdf24.trackPageEvent('Slick', 'ImageChange', id);
			}).on('lazyLoaded', function(ev) {
			});
			
			images.on('load', function(ev) {
				setTimeout(function() {
					imgSlider.slick('setPosition');
				}, 300);
			});
			
			imgSlider.slickLightbox({
				lazy: true,
				itemSelector: 'img',
				src: function(element) {
					element = $(element);
					var src = element.data('src') || element.data('lazy') || element.attr('src');
					src = src.replace('_thumb_', '').replace('-thumb-', '');
					src = src.replace('_thumb', '').replace('-thumb', '');
					src = src.replace('.jpg', '.png');
					return src;
				}
			}).on('show.slickLightbox', function() {
				pdf24.trackPageEvent('Slick', 'LightBoxShow', id);
			});
		});
	});
};

$(function() {
	var items = $('.imgSlider');
	var itemsInCollapsedSection = $('.sectionsCollapsed .section .imgSlider');
	var itemsToInit = items.not(itemsInCollapsedSection);
	pdf24.initImageSlider(itemsToInit);
});

pdf24.addAction('sectionExpand', function(section) {
	var imgSliders = section.find('.imgSlider');
	pdf24.initImageSlider(imgSliders);
});

/////////////////////////////////////////////////////////////////////////////////

pdf24.initSectionContent = function(selector) {
	var sections = $(selector);
};

pdf24.expandSection = function(section, source) {
	section = $(section);
	if(section.length == 0) {
		return;
	}
	
	if(!$('html').hasClass('sectionsCollapsed') || section.hasClass('expanded')) {
		section[0].scrollIntoView({behavior: 'smooth'});
		return;
	}
	
	var sectionId = section.attr('id') || '';
	var sections = $('.section');
	
	pdf24.doAction('sectionExpand', section, source);
	sections.not(section).removeClass('expanded');
	section.toggleClass('expanded');
	pdf24.initSectionContent(section);
	section[0].scrollIntoView({behavior: 'smooth'});
	pdf24.doAction('sectionExpanded', section, source);
	
	var collapseHandle = $('<div class="collapseHandle" />');
	collapseHandle.click(function() {
		pdf24.doAction('sectionCollapse', section, source);
		section.find('.content').slideUp(300, function() {
			section.removeClass('expanded');
			section.find('.collapseHandle').remove();
			section.find('.content').css('display', '').css('height', '');
			pdf24.doAction('sectionCollapsed', section, source);
		});
		event.stopPropagation();
		pdf24.trackPageEvent('UI', 'SectionCollapse', sectionId);
	});
	section.prepend(collapseHandle);
	
	if(source != 'backBtnLeave') {
		pdf24.trackPageEvent('UI', 'SectionExpand', sectionId);
	}
};

$(function() {
	var index = 0;
	var sections = $('.section');
	sections.each(function() {
		$(this).addClass('section-' + index);
		$(this).addClass(index % 2 == 0 ? 'even' : 'odd');
		$(this).toggleClass('first', index == 0);
		$(this).toggleClass('last', index == sections.length - 1);
		index += 1;
	});
	sections.click(function() {
		if(!$(this).hasClass('expanded')) {
			pdf24.expandSection(this);
		}
	});
	
	setTimeout(function() {
		var showSection = pdf24.getQueryParam('showSection', null);
		if(showSection) {
			pdf24.expandSection('#' + showSection);
		}
	}, 1000);
});

/////////////////////////////////////////////////////////////////////////////////

pdf24.getFilezone = function(fileZoneElement) {
	try {
		if(window.Dropzone) {
			return Dropzone.forElement(fileZoneElement);
		}
	} catch(err) {
		// ignore
	}
	return null;
};

pdf24.makeFilezoneImmuteable = function(fileZoneElement) {
	$(fileZoneElement).addClass('immutable');
	pdf24.getFilezone(fileZoneElement).disable();
};

pdf24.getServerFilesForFileZone = function(fileZoneElement, sort) {
	fileZoneElement = fileZoneElement || "#fileZone";
	
	var fileZone = pdf24.getFilezone(fileZoneElement);
	if(!fileZone || !fileZone.files) {
		return [];
	}
	
	var files = fileZone.files.slice();
	
	if(sort) {
		var unsorted = [];
		for (var i = 0; i < files.length; i++) {
			if(files[i].serverFile) {
				var pe = files[i].previewElement;
				var pi = i;
				if(pe) {
					pi = [].indexOf.call(pe.parentNode.children, pe);
				}
				unsorted.push({
					index : pi,
					file : files[i]
				});
			}
		}
		unsorted.sort(function(a, b) {
			return a.index - b.index;
		});
		files = unsorted.map(function(el) {
			return el.file;
		});
	}
	
	var serverFiles = [];
	for (var i = 0; i < files.length; i++) {
		if(files[i].serverFile) {
			serverFiles.push(files[i].serverFile);
		}
	}
	return serverFiles;
};

pdf24.getServerFilesForDefaultFileZone = function() {
	return pdf24.getServerFilesForFileZone("#fileZone");
};

pdf24.getServerFilesSortedForFileZone = function(fileZoneElement) {
	return pdf24.getServerFilesForFileZone(fileZoneElement, true);
};

pdf24.getServerFilesSortedForDefaultFileZone = function() {
	return pdf24.getServerFilesForFileZone("#fileZone", true);
};

pdf24.autoTouchServerFiles = function(fileZoneElement, workerServer) {
	var touchInterval = setInterval(function() {
		var serverFiles = pdf24.getServerFilesForFileZone(fileZoneElement);
		if(serverFiles && serverFiles.length > 0) {
			var workerServer = workerServer || pdf24.workerServer || window.workerServer;
			workerServer.doPost({
				action : 'touchFiles',
				fileInfos : serverFiles
			}, function(result) {
				//console.log(result);
			}, function(xhr) {
				xhr = xhr || {};
				var status = xhr.status;
				if(status == 400 || status == 404) {
					clearInterval(touchInterval);
					console.warn('Error touching server files', status, serverFiles, xhr.responseText);
				}
			});
		}
	}, 1 * 60 * 1000);
};

pdf24.hideDropzoneMessage = function(e) {
	if(e && e.previewElement) {
		var dz = pdf24.findAncestor(e.previewElement, 'dropzone');
		if(dz) {
			$(dz).find('.dz-message').hide();
		}
	}
};

$(function() {
	$('.dropzone').scroll(function(e) {
		var dz = $(e.target);
		var st = dz.scrollTop();
		dz.find('.lowerLeftTools, .lowerRightTools').css('margin-bottom', (-st) + 'px');
	});
});

$(function() {
	$('.filesystemImport').removeClass('disabled').show();
});

pdf24.importFromFilesystem = function(element) {
	var dropZoneElement = pdf24.findAncestor(element, 'dropzone');
	if(dropZoneElement) {
		var fileZone = pdf24.getFilezone(dropZoneElement);
		if(fileZone) {
			fileZone.hiddenFileInput.click();
		}
	}
	
	pdf24.trackPageEvent('ToolUsage', 'ImportToolClick', 'FileSystem');
};

pdf24.importFilesToFileZone = function(fileZoneElement, fileInfos, workerServer) {
	var fileZone = pdf24.getFilezone(fileZoneElement);
	if(!fileZone) {
		return;
	}
	workerServer = workerServer || pdf24.workerServer || window.workerServer;
	if(!workerServer) {
		return;
	}
	
	var queue = pdf24.createQueue();
	for(var i=0; i<fileInfos.length; i++) {
		(function(fileInfo) {
			queue.add(fileInfo);
			workerServer.doPost({
				action : 'import',
				fileInfo : fileInfo
			}, function(result) {
				var mockFile = {
					name: result.name,
					size: result.size,
				};
				fileZone.files.push(mockFile);
				fileZone.emit("addedfile", mockFile);
				fileZone.emit("complete", mockFile);
				fileZone.emit("success", mockFile, [result]);
				queue.remove(fileInfo);
				if(queue.isEmpty()) {
					fileZone.emit("queuecomplete");
				}
			}, function(xhr) {
				var mockFile = {
					name: fileInfo.name,
					size: fileInfo.size || fileInfo.bytes,
				};
				fileZone.emit("addedfile", mockFile);
				fileZone.emit("complete", mockFile);
				fileZone.emit("error", mockFile, 'Import error');
				queue.remove(fileInfo);
				if(queue.isEmpty()) {
					fileZone.emit("queuecomplete");
				}
			});
		})(fileInfos[i]);
	}
};

pdf24.importJobResult = function(fileZoneElement, jobId) {
	var job = pdf24.splitJobId(jobId);
	if(!job) {
		return;
	}

	$(fileZoneElement).addClass('importing');
	job.wsc.doGet({
		action : 'getJobResults',
		jobId : job.id
	}, function(result) {
		$(fileZoneElement).removeClass('importing');
		for(var i=0; i<result.length; i++) {
			result[i].url = job.wsc.getFileUrl(result[i]);
		}
		pdf24.importFilesToFileZone(fileZoneElement, result);
	}, function() {
		$(fileZoneElement).removeClass('importing');
		alert('An error occured importing the files');
	});
};

pdf24.importFromUrlArgs = function(fileZoneElement) {
	var jobId = pdf24.getQueryParam('importJobResult');
	if(jobId) {
		pdf24.importJobResult(fileZoneElement, jobId);
		pdf24.trackPageEvent('ToolUsage', 'JobResultImport', jobId);
	}
};

pdf24.importFromDropboxToFileZone = function(fileZoneElement, options) {
	if(!window.Dropbox || !pdf24.getFilezone(fileZoneElement)) {
		return;
	}
	options = options || {};
	
	Dropbox.choose({
		success: function(files) {
			pdf24.importFilesToFileZone(fileZoneElement, files);
		},
		linkType: "direct",
		multiselect: true,
		//extensions: ['.pdf', '.doc', '.docx'],
		extensions: options.extensions || null,
		folderselect: false
	});
	
	pdf24.trackPageEvent('ToolUsage', 'ImportToolClick', 'Dropbox');
};

pdf24.importFromDropbox = function(element) {
	var dropZoneElement = pdf24.findAncestor(element, 'dropzone');
	if(dropZoneElement) {
		pdf24.importFromDropboxToFileZone(dropZoneElement);
	}
};

pdf24.requireDropbox = function(callback) {
	pdf24.requireScript({
		loadCheck: function() {
			return window.Dropbox;
		},
		callback: callback,
		script: {
			id: 'dropboxjs',
			attribs: {
				'data-app-key': '7pgmdd7640v3no7'
			},
			src: 'https://www.dropbox.com/static/api/2/dropins.js'
		}
	});
};

$(function() {
	if($('.dropboxImport').length > 0) {
		pdf24.requireDropbox(function() {
			$('.dropboxImport').removeClass('disabled').show();
		});
	}
});

pdf24.googleApisStatus = {
	loaded: false,
	auth: false,
	picker: false,
	
	oauthTokenExpire: 30 * 60 * 1000,
	oauthToken: false,
	oauthTokenTime: false,
	isOauthTokenValid: function() {
		return this.oauthToken && pdf24.currentTimeMs() - this.oauthTokenTime < this.oauthTokenExpire;
	}
};

pdf24.loadGoogleApis = function(callback) {
	if(!pdf24.googleApisStatus.loaded) {
		pdf24.googleApisStatus.loaded = true;
		
		gapi.load('auth', {'callback': function() {
			pdf24.googleApisStatus.auth = true;
		}});
		gapi.load('picker', {'callback': function() {
			pdf24.googleApisStatus.picker = true;
		}});
	}
	
	var interval = setInterval(function() {
		if(pdf24.googleApisStatus.auth && pdf24.googleApisStatus.picker) {
			clearInterval(interval);
			callback();
		}
	}, 100);
};

pdf24.importFromGoogleDriveToFileZone = function(fileZoneElement) {
	var fileZone = pdf24.getFilezone(fileZoneElement);
	if(!fileZone) {
		return;
	}
	
	var clientId = '293682113827-59jp7n1eho86phfuvuq1ml5sho284h0e.apps.googleusercontent.com';
	var appId = '293682113827';
	var scope = ['https://www.googleapis.com/auth/drive.readonly'];
	
	var pickerCallback = function(data) {
		if (data.action == google.picker.Action.PICKED) {
			var fileInfos = [];
			for(var i=0; i<data.docs.length; i++) {
				var doc = data.docs[i];
				fileInfos.push({
					name: doc.name,
					bytes: doc.sizeBytes,
					url: 'https://www.googleapis.com/drive/v3/files/'+ doc.id +'?alt=media',
					bearer: pdf24.googleApisStatus.oauthToken
				});
			}
			pdf24.importFilesToFileZone(fileZoneElement, fileInfos);
		}
	};
	
	var getMimeTypes = function() {
		var resultTypes = [];
		if(fileZone.options.acceptedFiles) {
			var types = fileZone.options.acceptedFiles.split(',');
			for(var i=0; i<types.length; i++) {
				var mt = $.trim(types[i]);
				if(mt == 'image/*') {
					resultTypes.push('image/png');
					resultTypes.push('image/jpeg');
				} else {
					resultTypes.push(mt);
				}
			}
		}
		return resultTypes.length > 0 ? resultTypes.join(',') : null;
	};
	
	var createPicker = function() {
		if(!pdf24.googleApisStatus.oauthToken || !pdf24.googleApisStatus.picker) {
			return;
		}
		
		var view = new google.picker.DocsView(google.picker.ViewId.DOCS);
		view.setIncludeFolders(false);
		view.setSelectFolderEnabled(false);
		var mimeTypes = getMimeTypes();
		if(mimeTypes) {
			view.setMimeTypes(mimeTypes);
		}
		
		var picker = new google.picker.PickerBuilder()
			.enableFeature(google.picker.Feature.NAV_HIDDEN)
			.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
			.setAppId(appId)
			.setOAuthToken(pdf24.googleApisStatus.oauthToken)
			.addView(view)
			.addView(new google.picker.DocsUploadView())
			.setCallback(pickerCallback)
			.build();
		 picker.setVisible(true);
	};
	
	var handleAuthResult = function(authResult) {
		if (authResult && !authResult.error) {
			pdf24.googleApisStatus.oauthToken = authResult.access_token;
			pdf24.googleApisStatus.oauthTokenTime = pdf24.currentTimeMs();
			createPicker();
		}
	};
	
	if(pdf24.googleApisStatus.isOauthTokenValid()) {
		createPicker();
	}
	else if(pdf24.googleApisStatus.auth) {
		gapi.auth.authorize({
			'client_id': clientId,
			'scope': scope,
			'immediate': false
		}, handleAuthResult);
	}
	
	pdf24.trackPageEvent('ToolUsage', 'ImportToolClick', 'GoogleDrive');
};

pdf24.importFromGoogleDrive = function(element) {
	var dropZoneElement = pdf24.findAncestor(element, 'dropzone');
	if(dropZoneElement) {
		pdf24.importFromGoogleDriveToFileZone(dropZoneElement);
	}
};

pdf24.requireGoogleApi = function(callback) {
	pdf24.requireScript({
		loadCheck: function() {
			return window.gapi;
		},
		callback: callback,
		script: {
			id: 'gapiScript',
			src: 'https://apis.google.com/js/api.js?key=AIzaSyBUu7rTgj8NqlVrmq5KtCAUYmZFiUZlXks'
		}
	});
};

$(function() {
	if($('.googleDriveImport').length > 0) {
		pdf24.requireGoogleApi(function() {
			pdf24.loadGoogleApis(function() {
				$('.googleDriveImport').removeClass('disabled').show();
			});
		});
	}
});

$(function() {
	if(document.referrer && $('#tool').length > 0 && $('#moreToolsSection').length > 0) {
		var referrer = document.referrer.replace(/\/$/, '');
		if(referrer.indexOf('pdf24') < 0) {
			pdf24.trackPageEvent('Visitor', 'ExtRefVisit', referrer);
			history.pushState(null, document.title, location.href);
			window.addEventListener('popstate', function (event) {
				pdf24.trackPageEvent('Visitor', 'BackBtnLeave', referrer);
				pdf24.expandSection('#moreToolsSection', 'backBtnLeave');
				$('html, body').animate({
					scrollTop: $('#moreToolsSection').offset().top - 20
				});
				$('#moreToolsSection a').click(function() {
					pdf24.trackPageEvent('Visitor', 'BackBtnLeavePrevented', referrer);
					return true;
				});
			});
		}
	}
});

/////////////////////////////////////////////////////////////////////////////////

pdf24.showTopBottomNotification = function(content, options) {
	options = options || {};
	var position = options.position || 'top';
	var closeable = options.closeable === undefined || options.closeable === true;
	var cls = options.cls || false;
	var css = options.css || false;
	var time = options.time || false;
	var id = options.id || false;
	
	var closeElement = $('<a class="close" href="#" onclick="$(this).parent().remove(); return false;">x</a>');
	var contentElement = $('<div class="content">');
	var notificationElement = $('<div class="topBottomNotification">');
	
	contentElement.append(content);
	if(id) {
		notificationElement.attr('id', id);
	}
	if(closeable) {
		notificationElement.append(closeElement);
	}
	if(cls) {
		notificationElement.addClass(cls);
	}
	if(css) {
		notificationElement.css(css);
	}
	notificationElement.append(contentElement);
	
	if(position == 'bottom') {
		notificationElement.addClass('bottom');
		$('body').append(notificationElement);
	} else {
		notificationElement.addClass('top');
		$('body').prepend(notificationElement);
	}
	
	if(time && time > 0) {
		setTimeout(function() {
			notificationElement.remove();
		}, time);
	}
};

pdf24.showTopNotification = function(content, options) {
	options = options || {};
	options.position = 'top';
	pdf24.showTopBottomNotification(content, options);
};

pdf24.showBottomNotification = function(content, options) {
	options = options || {};
	options.position = 'bottom';
	pdf24.showTopBottomNotification(content, options);
};

/////////////////////////////////////////////////////////////////////////////////

pdf24.activateTheme = function(theme) {
	if(theme) {
		var themes = $('html').data('themes');
		if(themes) {
			themes = $.map(themes.split(','), $.trim);
			if(themes.indexOf(theme) >= 0) {
				for(var i=0; i<themes.length; i++) {
					$('html').removeClass(themes[i]);
				}
				$('html').addClass(theme);
				pdf24.localStorage.setItemString('themeClass', theme);
			}
		}
	}
};

pdf24.toggleTheme = function() {
	var activatedTheme = '';
	var themes = $('html').data('themes');
	if(themes) {
		themes = $.map(themes.split(','), $.trim);
		var theme = themes[0];
		for(var i=0; i<themes.length; i++) {
			if($('html').hasClass(themes[i])) {
				activatedTheme = themes[(i + 1) % themes.length];
				pdf24.activateTheme(activatedTheme);
				break;
			}
		}
	}
	
	pdf24.trackPageEvent('UI', 'ThemeToggleClick', activatedTheme);
};

$(function() {
	$('#topBar .menu .themeSwitcher').click(pdf24.toggleTheme);
});

(function() {
	var themeClass = pdf24.localStorage.getItemString('themeClass');
	if(themeClass) {
		pdf24.activateTheme(themeClass);
	}
})();

/////////////////////////////////////////////////////////////////////////////////

pdf24.getLastUsedTools = function() {
	var lastUsedTools = pdf24.localStorage.getItemObject('lastUsedTools');
	if(!lastUsedTools || !$.isArray(lastUsedTools)) {
		lastUsedTools = [];
	}
	return lastUsedTools;
};

pdf24.addLastUsedTool = function(toolId) {
	var lastUsedTools = pdf24.getLastUsedTools();
	lastUsedTools = lastUsedTools.filter(function(item) {
		return item !== toolId;
	});
	lastUsedTools.push(toolId);
	pdf24.localStorage.setItemObject('lastUsedTools', lastUsedTools);
};

pdf24.exposeLastUsedTools = function() {
	var limit = 5;
	var lastUsedTools = pdf24.getLastUsedTools();
	if(!lastUsedTools || !lastUsedTools.length) {
		return;
	}
	
	for(var i=0; i<lastUsedTools.length; i++) {
		var toolId = lastUsedTools[i];
		$('.toolSelect .toolLink.' + toolId + ' .tile').addClass('exposed');
	}
};

//$(pdf24.exposeLastUsedTools);

pdf24.toolSelectFilter = function(filter) {
	$('.toolSelect .filter').removeClass('active');
	$(this).addClass('active');
	$('.toolSelect .toolLink').show();

	if(filter == 'lastUsed') {
		var limit = 5;
		var lastUsedTools = pdf24.getLastUsedTools();
		if(!lastUsedTools || !lastUsedTools.length) {
			$('.toolSelect .toolLink').hide();
			return;
		}
		lastUsedTools = lastUsedTools.reverse();
		$('.toolSelect .toolLink').hide();
		for(var i=0; i<lastUsedTools.length && i < limit; i++) {
			var toolId = lastUsedTools[i];
			$('.toolSelect .toolLink.' + toolId).show();
		}
	}
};

$(function() {
	$(".toolSelect .filter").click(function() {
		var filter = $(this).data('show');
		pdf24.toolSelectFilter.call(this, filter);
	});
});

/////////////////////////////////////////////////////////////////////////////////

$(function() {
	$("#rateSection .star").hover(function() {
		$(this).addClass('active');
		$(this).prevAll().addClass('active');
	}, function() {
		if(!$("#rateSection .stars").hasClass('locked')) {
			$("#rateSection .star").removeClass('active');
		}
	}).click(function() {
		$("#rateSection .star").removeClass('active');
		$(this).addClass('active');
		$(this).prevAll().addClass('active');
		$("#rateSection .stars").addClass('locked');
		
		var star = $('#rateSection .star.active').length;
		pdf24.trackPageEvent('Rating', 'RatingStarClick', 'star-' + star);
	});
});

pdf24.submitRating = function(btn, pageId) {
	if(!$("#rateSection .stars").hasClass('locked')) {
		return;
	}
	var langCode = (navigator.language || '').substr(0, 2).toLowerCase();
	var stars = $('#rateSection .star.active').length;
	var messageElement = $('#rateSection [name="reviewText"]');
	var message = messageElement.val().trim();
	
	if(stars <= 3 && !message) {
		messageElement.addClass('errorBox');
		return;
	}
	messageElement.removeClass('errorBox');
	
	btn = $(btn);
	var box = btn.parent();
	btn.remove();
	box.text(btn.data('msg'));
	pdf24.doPost({
		action: 'submitRating',
		pageId: pageId,
		langCode: langCode,
		source: location.href,
		stars: stars,
		message: message
	}, function() {
		// nothing
	});
	
	pdf24.trackPageEvent('Rating', 'RatingSubmit', 'stars-' + stars);
};

/////////////////////////////////////////////////////////////////////////////////

$(function() {
	$('.qas .question').click(function() {
		var questionAnswer = $(this).parent();
		var questionAnswers = questionAnswer.parent();
		questionAnswers.find('.active').not(questionAnswer).removeClass('active');
		questionAnswer.toggleClass('active');
		
		pdf24.trackPageEvent('FAQ', 'QuestionClick', 'question-' + questionAnswer.index());
	});
});

/////////////////////////////////////////////////////////////////////////////////

if ('serviceWorker' in navigator) {
	if(location.host != 'tools.pdf24.devel' && location.host != 'tools-origin.pdf24.org') {
		window.addEventListener('load', function() {
			navigator.serviceWorker.register('/serviceWorker.js').then(function(reg) {
		    	//console.log('Successfully registered service worker', reg);
			}).catch(function(err) {
				console.warn('Error whilst registering service worker', err);
			});
		});
	}
}

/////////////////////////////////////////////////////////////////////////////////

pdf24.imgTrack = function(imgSources, arg2) {
	// arg2 can be callback or url
	var imgTrackData = pdf24.imgTrack;
	
	// object for completed images
	if(imgTrackData.imagesComlete == undefined) {
		imgTrackData.imagesComlete = {};
	}
	
	// handler used if all images are loaded
	var doArg2 = function() {
		if(!doArg2.done) {
			doArg2.done = true;
			if (typeof(arg2) == "function") {
				arg2();
			} else {
				location.href = arg2;
			}
		}
	};
		
	// force an array
	if(!(imgSources instanceof Array)) {
		imgSources = [imgSources];
	}
	
	// calculate remaining images to load
	var remaining = 0;
	for(var i = 0; i < imgSources.length; i++) {
		if(!imgTrackData.imagesComlete[imgSources[i]]) {
			remaining += 1;
		}
	}
	if(remaining == 0) {
		doArg2();
		return;
	}
	
	// timeout if something is broken
	var timeout = window.setTimeout(doArg2, imgSources.length * 500);
	
	// load the images
	var counter = new Object();
	counter.value = remaining;
	for(var i = 0; i < imgSources.length; i++) {
		var imgSrc = imgSources[i];
		if(imgTrackData.imagesComlete[imgSrc]) {
			continue;
		}
		
		var img = new Image(1,1);
		img.onload = function() {
			imgTrackData.imagesComlete[imgSrc] = 1;
			if(--counter.value == 0) {
				window.clearTimeout(timeout);
				doArg2();
			}
		}
		img.src = imgSrc;
	}
};

/////////////////////////////////////////////////////////////////////////////////

pdf24.fillAdSpaces = function(selector) {
	selector = $(selector);
	var adSpaces = selector.find('.adSpace');
	if(adSpaces.length > 0) {		
		var adTexts = selector.find('.adText');
		adTexts.removeClass('hidden').show();
		adSpaces.removeClass('hidden').show();
		
		window.adsbygoogle = window.adsbygoogle || [];
		adSpaces.each(function() {
			var adSpace = $(this);
			if(!adSpace.hasClass('adsbygoogle')) {
				$(this).addClass('adsbygoogle');
				window.adsbygoogle.push({});
			}
		});
		
		if(!document.getElementById('adsbygoogleScript')) {
			var wf = document.createElement('script');
			wf.src = '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
			wf.async = 'true';
			wf.id = 'adsbygoogleScript';
			document.body.appendChild(wf);
		}
	}
};

pdf24.addAction('sectionExpand', function(section) {
	pdf24.fillAdSpaces(section);
});

$(window).on('load', function() {
	var adBlocks = $('.adBlock');
	var adBlocksInCollapsedSection = $('.sectionsCollapsed .section').find('.adBlock');
	var adBlocksToLoad = adBlocks.not(adBlocksInCollapsedSection);
	pdf24.fillAdSpaces(adBlocksToLoad);
});

pdf24.requireSortable = function(callback) {
	pdf24.requireScript({
		loadCheck: function() {
			return window.Sortable;
		},
		callback: callback,
		script: {
			id: 'sortableScript',
			src: 'https://cdn.jsdelivr.net/npm/sortablejs@1.10.1/Sortable.min.js'
		}
	});
	
	$.fn.sortable = function (options) {
		var retVal, args = arguments;
		this.each(function () {
			var $el = $(this), sortable = $el.data('sortable');
			if (!sortable && (options instanceof Object || !options)) {
				sortable = new Sortable(this, options);
				$el.data('sortable', sortable);
			} else if (sortable) {
				if (options === 'destroy') {
					sortable.destroy();
					$el.removeData('sortable');
				} else if (options === 'widget') {
					retVal = sortable;
				} else if (typeof sortable[options] === 'function') {
					retVal = sortable[options].apply(sortable, [].slice.call(args, 1));
				} else if (options in sortable.options) {
					retVal = sortable.option.apply(sortable, args);
				}
			}
		});
		return (retVal === void 0) ? this : retVal;
	};
};

pdf24.requirePopper = function(callback) {
	pdf24.requireScript({
		loadCheck: function() {
			return window.Popper;
		},
		callback: callback,
		script: {
			id: 'popperScript',
			src: 'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js'
		}
	});
};

pdf24.requireTippy = function(callback) {
	pdf24.requirePopper(function() {
		pdf24.requireScript({
			loadCheck: function() {
				return window.tippy;
			},
			callback: callback,
			script: {
				id: 'tippyScript',
				src: 'https://cdn.jsdelivr.net/npm/tippy.js@5.1.2/dist/tippy-bundle.iife.min.js'
			}
		});
	});	
};

$(function() {
	pdf24.requireTippy(function() {
		var tracked = {};
		var attachTippy = function(evt) {
			var el = evt.currentTarget;
			var $el = $(el);			
			if($el.data('tippy-instance')) {				
				return;
			}			
			var title = $el.attr('title') || $el.data('title');
			if(!title) {
				return;
			}
			
			$el.data('title', title);
			$el.removeAttr('title');
			var tpl = $el.data('tippy-template');
			if(tpl && document.getElementById(tpl)) {
				title = $('#' + tpl).html();
			}
			
			var inst = tippy(el, {
				content: title,
				duration: [300, 0],
				touch: false,
				onShow: function(inst) {
					var tid = $(inst.reference).data('tippy-track-id');
					if(tid && !tracked[tid]) {
						tracked[tid] = true;
						pdf24.trackPageEvent('UI', 'TippyShow', tid);
					}
				}
			});
			
			$el.data('tippy-instance', inst);
		};
		
		$('[title]').one('mouseenter', attachTippy);
		
		pdf24.addAction('topToolSelectInitialized', function(toolSelectNode) {
			toolSelectNode.find('.tile ')
				.removeData('tippy-instance')
				.one('mouseenter', attachTippy);
		});
	});
});

pdf24.setDropzoneView = function(element, viewId) {
	var dropZone = $(element);
	if(!dropZone.hasClass('dropzone')) {
		dropZone = dropZone.parents('.dropzone');
	}
	dropZone.toggleClass('listView', viewId == 'listView');
	var viewSelect = dropZone.find('.viewSelect');
	viewSelect.find('.viewSelectBtn').removeClass('selected');
	viewSelect.find('.viewSelectBtn.' + viewId).addClass('selected');
	
	pdf24.trackPageEvent('UI', 'SetDropzoneView', viewId);
};

pdf24.setTooltip = function(element, content) {
	if(!element) {
		return;
	}
	
	if(element instanceof jQuery) {
		if(element.length == 0) {
			return;
		}
		element = element[0];
	}
	
	pdf24.requireTippy(function() {
		tippy(element, {
			content: content,
			duration: [300, 0],
			touch: false
		});
	});
};

pdf24.getFormParams = function(formSelector) {
	formSelector = $(formSelector || '#form');
	
	var list = [];
	formSelector.find('[name]').each(function() {
		var name = $(this).attr('name');
		var label = formSelector.find('label[for="'+ name +'"]').text();
		var value = $(this).val();
		var valueText = value;
		if(this.tagName == 'SELECT') {
			valueText = $(this).find('option[value="'+ value +'"]').text();
		}
		list.push({
			name : name,
			label : label,
			value : value,
			valueText : valueText
		});
	});
	
	return {
		list : list,
		toString : function(paramsSep, keyValueSep) {
			var parts = [];
			for(var i=0; i<this.list.length; i++) {
				var param = this.list[i];
				var pl = param.label.replace(/:$/, '');
				var str = pl + (keyValueSep || ': ') + param.valueText;
				parts.push(str);
			}
			return parts.join(paramsSep || ', ');
		},
		toHtml : function(paramsSep, keyValueSep) {
			var parts = [];
			var tpl = '<span class="formParam"><span class="key">{k}</span>'+ (keyValueSep || ': ') +'<span class="value">{v}</span></span>';
			for(var i=0; i<this.list.length; i++) {
				var param = this.list[i];
				var pl = param.label.replace(/:$/, '');
				var str = tpl.replace('{k}', pl).replace('{v}', param.valueText);
				parts.push(str);
			}
			return parts.join(paramsSep || ', ');
		},
		toId : function(paramsSep, keyValueSep) {
			var parts = [];
			for(var i=0; i<this.list.length; i++) {
				var param = this.list[i];
				parts.push(param.name + (keyValueSep || ':') + param.value);
			}
			return parts.join(paramsSep || ';');
		}
	};
};

