////////////////////////////////////////////////////////////////////
// Document object
////////////////////////////////////////////////////////////////////
function waitUntilDomReady(callback) {
	var check = function() {
		if(document.readyState === "complete") {
			callback();
		} else {
			setTimeout(function() {
				check();
			}, 100);
		}
	};
	setTimeout(check, 100);
}



////////////////////////////////////////////////////////////////////
// LayerWindow
////////////////////////////////////////////////////////////////////
function LayerWindow(windowData) {
	this.prev = false;
	this.maximize = false;
	this.closeable = true;
	this.closedByUser = false;
	this.bottomLayerMode = 'div';
	this.windowStyle = '';
	this.titleStyle = '';
	this.closeStyle = '';
	this.bodyStyle = '';
	
	if(windowData && windowData instanceof Object) {
		this.data = windowData.data;
		this.closeable = typeof windowData.closeable == 'undefined' ? true : windowData.closeable;
		this.maximize = typeof windowData.maximize == 'undefined' ? false : windowData.maximize;
		this.bottomLayerMode = windowData.bottomLayerMode ? windowData.bottomLayerMode : 'div';
		this.windowStyle = windowData.windowStyle || '';
		this.titleStyle = windowData.titleStyle || '';
		this.closeStyle = windowData.closeStyle || '';
		this.bodyStyle = windowData.bodyStyle || '';
		this.addCloseCallback(windowData.onClose);
	} else {
		this.data = windowData;
	}
}

LayerWindow.closeCurrent = function(closedByUser) {
	if(LayerWindow.current) {
		LayerWindow.current.close(closedByUser);
	}
};

LayerWindow.closeAll = function(closedByUser) {
	while(LayerWindow.current) {
		LayerWindow.current.close(closedByUser);
	}
};

LayerWindow.extractTitle = function(data) {
	var title = '';
	var erg = data.match(/<title>([\s\S]*?)<\/title>/i);
	if(erg) {
		title = erg[1].trim();
	}
	return title;
};

LayerWindow.extractBody = function(data) {
	var body = '';
	var m = data.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
	if(m) {
		var attribs = m[1].trim();
		if(attribs) {
			body = m[0].trim();
			body = body.replace(new RegExp('^<body', 'i'), '<div');
			body = body.replace(new RegExp('body>$', 'i'), 'div>');
		} else {
			body = m[2].trim();
		}
	}
	return body;
};

LayerWindow.prototype.show = function() {
	if(this.node) {
		return;
	}
	
	if(!LayerWindow.current && LayerWindow.enterWindowMode) {
		LayerWindow.enterWindowMode();
	}
	
	var self = this;
	var appendLayerWindow = function() {
		var title = LayerWindow.extractTitle(self.data);
		var bodyContent = LayerWindow.extractBody(self.data);		
		if(!title && !bodyContent) {
			bodyContent = self.data;
		}
		
		var windowStyle = 'visibility:hidden;';
		windowStyle += (self.maximize ? 'height:100%; width:100%;' : '');
		windowStyle += self.windowStyle;
		
		var html = '<div class="layerWindow" style="'+ windowStyle +'">';
		if(title) {
			html += '<div class="layerWindowHead">';
			var titleStyle = 'float:left;' + self.titleStyle;
			html += '<div class="layerWindowTitle" style="'+titleStyle+'">'+ title +'</div>';
			if(self.closeable) {
				var closeStyle = 'float:right;' + self.closeStyle;
				html += '<div class="layerWindowClose" style="'+ closeStyle +'">';
				html += '<a href="javascript:LayerWindow.closeCurrent(true)">x</a>';
				html += '</div>';
			}
			html += '</div>';
			var bodyStyle = 'clear:both;' + self.bodyStyle;
			html += '<div class="layerWindowBody" style="'+ bodyStyle +'">';
			html += bodyContent;
			html += '</div>';
		} else {
			var bodyStyle = '' + self.bodyStyle;
			html += '<div class="layerWindowBody noTitle" style="'+ bodyStyle +'">' + bodyContent + '</div>';
		}
		html += '<div>';
		
		self.node = $(html);
		self.node.appendTo('body');
		self.node.focus();
				
		//set current
		if(LayerWindow.current) {
			LayerWindow.current.node.hide();
			LayerWindow.current.bottomLayer.hide();
			self.prev = LayerWindow.current;
		}
		LayerWindow.current = self;
	};
	
	var appendBottomLayer = function() {
		if(self.bottomLayerMode == 'iframe') {
			var temp = $('<div class="layerWindowBottomLayer" style="display:none;"></div>');
			temp.appendTo('body');
			var bg = temp.css('background-color') || '#CCC';
			temp.remove();
			
			var iframe = self.bottomLayer = $('<iframe class="layerWindowBottomLayer" frameborder="0"></iframe>');
			iframe.appendTo('body');
			
			iframe.ready(function() {
				var wd = iframe[0].contentDocument || iframe[0].contentWindow.document;
				if(wd) {
					wd.open();
					wd.write('<body style="margin:0;padding:0;background-color:'+ bg +';width:100%;height:100%;"></body>');
					wd.close();
				}
			});
		} else {
			self.bottomLayer = $('<div class="layerWindowBottomLayer"></div>');
			self.bottomLayer.appendTo('body');
		}
	};
	
	appendBottomLayer();
	appendLayerWindow();
	
	var checker = function() {
		if(self.closed) {
			$(window).unbind('resize', checker);
			$(window).unbind('scroll', checker);
			clearInterval(self.checkInterval);
			return;
		}
		if(LayerWindow.current && LayerWindow.current != self) {
			return;
		}
		
		var win = self.node;
		var bodyWrapper = self.node.find('.layerWindowBodyWrapper').eq(0);
		var body = self.node.find('.layerWindowBody').eq(0);
		var bodyWidth = Math.ceil(body[0].scrollWidth);
		var bodyHeight = Math.ceil(body[0].scrollHeight);		
		var maxBodyHeight = $(window).height() - (win.outerHeight() - body.outerHeight()) - 3;
		var maxBodyWidth = $(window).width() - (win.outerWidth() - body.outerWidth()) - 3;
		
		body.css({
			maxHeight : maxBodyHeight + 'px',
			maxWidth : maxBodyWidth + 'px',
			overflowY : bodyHeight > maxBodyHeight ? 'scroll' : 'visible',
			overflowX : bodyWidth > maxBodyWidth ? 'scroll' : 'visible'
		});
		
		var posX = Math.floor(($(window).width() - win.outerWidth()) / 2);
		var posY = Math.floor(($(window).height() - win.outerHeight()) / 2);
		win.css({
			left : (posX < 0 ? 0 : posX) + $(window).scrollLeft() + 'px',
			top : (posY < 0 ? 0 : posY) + $(window).scrollTop() + 'px'
		});
		
		if(win.css('visibility') == 'hidden') {
			win.css('visibility', 'visible');
		}
		
		self.bottomLayer.css('top', $(window).scrollTop() + 'px');
		self.bottomLayer.css('left', $(window).scrollLeft() + 'px');
	};
	waitUntilDomReady(function() {
		checker();
		self.checkInterval = setInterval(checker, 500);
		$(window).resize(checker);
		$(window).scroll(checker);
	});
		
	//add close handler
	this.closeHandler = function(e) {
		if (e.keyCode == 27 && self.node && LayerWindow.current == self) {
			LayerWindow.closeCurrent(true);
		}
	};
	$(document).keyup(this.closeHandler);
};

LayerWindow.show = function(data) {
	var w = new LayerWindow(data);
	w.show();
	return w;
};

LayerWindow.prototype.close = function(closedByUser) {
	if(!this.node) {
		return;
	}
	
	this.closed = true;
	this.closedByUser = closedByUser || false;
	
	$(window).unbind('keyup', this.closeHandler);
	
	this.bottomLayer.remove();
	this.node.remove();
	
	LayerWindow.current = this.prev;
	
	var leaveWM = LayerWindow.current ? false : true;
	
	if(this.closeCallbacks) {
		for(var i=0; i < this.closeCallbacks.length; i++) {
			this.closeCallbacks[i](this);
		}
	}
	
	if(LayerWindow.current && LayerWindow.current == this.prev) {
		LayerWindow.current.node.show();
		LayerWindow.current.bottomLayer.show();
	}
	
	if(leaveWM && LayerWindow.leaveWindowMode) {
		LayerWindow.leaveWindowMode();
	}
};

LayerWindow.showInfo = function(data) {
	var title = data.title || '';
	var content = data.content || '';
	var width = data.width || '500px';
	var margin = data.margin || '10px';
		
	var style = '';
	style += ';width:'+width;
	style += ';margin:'+margin;
	
	content = '<div style="'+style+'">'+content+'</div>';
	
	var okbtn = '<div style="margin:10px; text-align:right;">';
		okbtn += '<input type="button" value="Ok" onclick="LayerWindow.closeCurrent(true);">';
	okbtn += '</div>';
	
	var html = '<title>'+ title +'</title>\n';
	html += '<body>'+ content + okbtn +'</body>';
	
	var win = new LayerWindow({
		data : html,
		bottomLayerMode : data.bottomLayerMode || 'div',
		windowStyle : data.windowStyle || null,
		titleStyle : data.titleStyle || null,
		closeStyle : data.closeStyle || null,
		onClose : data.onClose || null
	});
	win.show();
	return win;
};

LayerWindow.prototype.addCloseCallback = function(callback) {
	if(callback) {
		if(typeof callback == 'function') {
			callback = [callback];
		} 
		if(callback instanceof Array) {
			if(!this.closeCallbacks) {
				this.closeCallbacks = callback;
			} else {
				this.closeCallbacks.concat(callback);
			}
		}
	}
};

LayerWindow.prototype.setBorder = function(border) {
	$(this.node).find('.layerWindow').css('border', border);
};


////////////////////////////////////////////////////////////////////
// LoadingState
////////////////////////////////////////////////////////////////////
function LoadingState(data) {
	this.data = data;
	this.isSet = false;
	this.img = new Image();
	if (data.onImgLoad) {
		this.img.onload = data.onImgLoad;
	}
	this.img.src = data.img;
}

LoadingState.makeData = function(value) {
	if(typeof value == 'string') {
		if(document.getElementById(value)) {
			return {id:value};
		}
		return {selector:value};
	}
	if(value instanceof jQuery) {
		return {jnode:value};
	}
	if(value.tagName) {
		return {node:value};
	}
	return null;
};

LoadingState.set = function(data) {
	var ls = new LoadingState(data);
	ls.show();
	return ls;
};

LoadingState.prototype.makeJNode = function() {
	var jnode = null;
	if(this.data) {
		if (this.data.jnode) {
			jnode = this.data.jnode;
		} else if (this.data.node) {
			jnode = $(this.data.node);
		} else if (this.data.id) {
			jnode = $('#' + this.data.id);
		} else if (this.data.selector) {
			jnode = $(this.data.selector);
		}
	}
	return jnode;
};

LoadingState.prototype.show = function() {
	if (this.isSet) {
		return;
	}
	this.isSet = true;
	var jnode = this.makeJNode();
	if (jnode) {
		this.old = jnode.html();
		if (this.data.keepSize) {
			jnode.html('<div style="width:' + jnode.width()
					+ 'px; text-align:center"><img src="' + this.data.img
					+ '" alt="" /></div>');
		} else {
			jnode.html('<img src="' + this.data.img + '" alt="" />');
		}
	}
};

LoadingState.prototype.reset = function() {
	this.isSet = false;
	var jnode = this.makeJNode();
	if (jnode) {
		jnode.html(this.old || '');
		this.old = null;
	}
};



////////////////////////////////////////////////////////////////////
// Email
////////////////////////////////////////////////////////////////////
function isValidEmail(email) {
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z0-9]+)$/;
	return reg.test(email.trim());
}
function isValidEmailList(emailList) {
	emailList = emailList.replaceAll(',',';');
	emailList = emailList.split(';');
	for(var i = 0; i < emailList.length; i++) {
		if(!isValidEmail(emailList[i])) {
			return false;
		}
	}
	return emailList.length > 0;
}



////////////////////////////////////////////////////////////////////
// String
////////////////////////////////////////////////////////////////////
if(!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

if(!String.prototype.replaceAll) {
	String.prototype.replaceAll = function(search, replace) {
		var str = this;
		while(str.indexOf(search) != -1) {
			str = str.replace(search, replace);
		}
		return str;
	};
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

if(!String.prototype.startsWith){
    String.prototype.startsWith = function (str) {
        return !this.indexOf(str);
    };
}



////////////////////////////////////////////////////////////////////
// HTML
////////////////////////////////////////////////////////////////////
function decodeHtmlSpecialChars(str) {
	str = str.replace('&amp;','&');
	str = str.replace('&quot;','"');
	str = str.replace('&#039;',"'");
	str = str.replace('&lt;','<');
	str = str.replace('&gt;','>');
	return str;
}


////////////////////////////////////////////////////////////////////
// URL and Query
////////////////////////////////////////////////////////////////////
function getQueryParam( name, def ) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&#]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( !results ) {
		return def;
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

function addQueryParam( url, key, val ){
    var parts = url.match(/([^?#]+)(\?[^#]*)?(\#.*)?/);
    var url = parts[1];
    var qs = parts[2] || '';
    var hash = parts[3] || '';

    if ( !qs ) {
		return url + '?' + key + '=' + encodeURIComponent( val ) + hash;
    } else {
		var qs_parts = qs.substr(1).split("&");
		var i;
		for (i=0;i<qs_parts.length;i++) {
			var qs_pair = qs_parts[i].split("=");
			if ( qs_pair[0] == key ){
				qs_parts[ i ] = key + '=' + encodeURIComponent( val );
				break;
			}
		}
		if ( i == qs_parts.length ){
			qs_parts.push( key + '=' + encodeURIComponent( val ) );
		}
		return url + '?' + qs_parts.join('&') + hash;
    }
}

function removeUrlArgs(url, args) {
	if(typeof args == 'string') {
		args = args.split(',');
	}
	for(var i=0; i<args.length; i++) {
		args[i] = args[i].trim();
		
		var patt = new RegExp('&'+ args[i] +'=[^&]+', 'g');
		url = url.replace(patt, '');
		
		patt = new RegExp('\\?'+ args[i] +'=[^&]+&?', 'g');
		url = url.replace(patt, '?');
	}
	if(url.endsWith('?')) {
		url = url.substring(0, url.length - 1);
	}
	return url;
}



////////////////////////////////////////////////////////////////////
// ImgLoader
////////////////////////////////////////////////////////////////////
function ImgLoader(imgSources,callback) {
	if(!(imgSources instanceof Array)) {
		imgSources = [imgSources];
	}
	var callbackCalled = false;
	var counter = imgSources.length;
	var timeout = window.setTimeout(function() {
		if(!callbackCalled) {
			callbackCalled = true;
			if(callback) {
				callback();
			}
		}
	}, imgSources.length * 500);
	for(var i = 0; i < imgSources.length; i++) {
		var imgSrc = imgSources[i];
		var lockImg = new Image(1,1);
		lockImg.onload = function() {
			if(--counter == 0) {
				window.clearTimeout(timeout);
				if(!callbackCalled) {
					callbackCalled = true;
					if(callback) {
						callback();
					}
				}
			}
		};
		lockImg.src = imgSrc;
	}
	return false;
}


////////////////////////////////////////////////////////////////////
// Version number compare
////////////////////////////////////////////////////////////////////
function cmpVersions(strV1, strV2) {
	var nRes = 0
	  , parts1 = strV1.split('.')
	  , parts2 = strV2.split('.')
	  , nLen = Math.max(parts1.length, parts2.length);

	for (var i = 0; i < nLen; i++) {
		var nP1 = (i < parts1.length) ? parseInt(parts1[i], 10) : 0
		  , nP2 = (i < parts2.length) ? parseInt(parts2[i], 10) : 0;

		if (isNaN(nP1)) { nP1 = 0; }
		if (isNaN(nP2)) { nP2 = 0; }

		if (nP1 != nP2) {
		  nRes = (nP1 > nP2) ? 1 : -1;
		  break;
		}
	}
	return nRes;
}



////////////////////////////////////////////////////////////////////
// Object representation and alert
////////////////////////////////////////////////////////////////////
function var_rep(obj, indent, objSet) {
	indent = indent || 0;
	objSet = objSet || [];
	
	var istr = '';
	for(var i = 0; i<indent; i++) {
		istr += '\t';
	}
	var istrp1 = istr + '\t';
			
	if(Array.isArray(obj) && indent < 4) {
		for(var i=0; i<objSet.length; i++) {
			if(objSet[i] == obj) {
				return istr + '***\n';
			}
		}
		objSet.push(obj);
		var out = '[\n';
		for(var i=0; i<obj.length; i++) {
			out += istrp1;
			out += i + ": " + var_rep(obj[i], indent + 1, objSet) + "\n";
		}
		out += istr + ']';
		return out;
	} else if(typeof(obj) == 'object' && indent < 10) {
		for(var i=0; i<objSet.length; i++) {
			if(objSet[i] == obj) {
				return istr + '***\n';
			}
		}
		objSet.push(obj);
		var out = '{\n';
		for (var i in obj) {
			out += istrp1;
			if(typeof obj[i] == 'function') {
				out += i + ": function(...)\n";
			} else {
				out += i + ": " + var_rep(obj[i], indent + 1, objSet) + "\n";
			}			
		}
		out += istr + '}';
		return out;
	}
	return "" + obj;
}

function var_alert(obj) {
	alert(var_rep(obj));
}



////////////////////////////////////////////////////////////////////
// Array
////////////////////////////////////////////////////////////////////
if(!Array.prototype.contains) {
	Array.prototype.contains = function(obj) {
		var i = this.length;
		while (i--) {
			if (this[i] === obj) {
				return true;
			}
		}
		return false;
	};
}

if(!Array.prototype.indexOf) {
    Array.prototype.indexOf= function(what, i){
		i= i || 0;
		var L= this.length;
		while(i< L){
			if(this[i] === what) return i;
			++i;
		}
		return -1;
    };
}
	
if(!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf= function(what, i){
		var L= this.length;
		i= i || L-1;
		if(isNaN(i) || i>= L) i= L-1;
		else if(i< 0) i += L;
		while(i> -1){
			if(this[i] === what) return i;
			--i;
		}
		return -1;
    };
}


////////////////////////////////////////////////////////////////////
// Error formatting
////////////////////////////////////////////////////////////////////
function formatError(err) {
	if(err.error) {
		return formatError(err.error);
	}
	
	if(err.code && err.message != undefined) {
		var code = err.code;
		
		var msg = err.message;
		msg = msg.replace('\r\n', '<br />');
		msg = msg.replace('\n', '<br />');
		
		var out = '<div class="error">';
			out += '<div class="code">'+ code +'</div>';
			out += '<div class="message">'+ msg +'</div>';
		out += '</div>';
		return out;
	}
	
	if(typeof(err) == 'string') {
		return err;
	}
	
	var_alert(err);
	return '';
}
