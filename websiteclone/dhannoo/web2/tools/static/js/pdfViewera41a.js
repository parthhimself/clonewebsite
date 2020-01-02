//'use strict';

window.pdf24 = window.pdf24 || {};

pdf24.createPdfViewer0 = function(conf) {
	var viewer = {
		devicePixelRatio : window.devicePixelRatio || 1,
		jtarget : $('#' + conf.targetId),
		pageScale : 0,
		pdfDoc : null,
		currentPage : {
			pageNum : 0,
			scale : null,
			pdfPage : null,
			wrapper : null
		},
		isMovePageMode : false,
		uiTools : []
	};
	
	var validatePage = function(page, numPages) {
		if(page < 1) {
			return 1;
		}
		if(page >= numPages) {
			return numPages;
		}
		return page;
	};
	
	viewer.loadFile = function(fileUrl, callback) {
		callback = callback || function() {};
		pdf24.pdfjs.getDocument({
			url : fileUrl,
			cMapUrl : '/static/js/pdfjs/web/cmaps/',
			cMapPacked : true
		}).then(function(pdfDoc) {
			viewer.fileUrl = fileUrl;
			viewer.pdfDoc = pdfDoc;
			viewer.currentPage.pageNum = 1;
			viewer.currentPage.pdfPage = null;
			viewer.currentPage.wrapper = null;
			$(viewer).trigger('fileLoaded');
			callback(pdfDoc);
		});
	};
	
	viewer.update = function() {
		viewer.showPage(viewer.currentPage.pageNum);
	};
	
	viewer.bindHandTool = function(canvas) {
		var currentX, currentY;
		var clicked = false;
		var updateScrollPos = function(e) {
			var obj = viewer.jtarget;
			obj.scrollLeft(obj.scrollLeft() + currentX - e.pageX);
			obj.scrollTop(obj.scrollTop() + currentY - e.pageY);			
			currentX = e.pageX;
			currentY = e.pageY;
		};

		$(canvas).on({
			'mousemove': function(e) {
				if(viewer.isMovePageMode) {
					clicked && updateScrollPos(e);
					$(canvas).css('cursor', 'grabbing');
				}				
			},
			'mousedown': function(e) {
				if(viewer.isMovePageMode) {
					clicked = true;
					currentX = e.pageX;
					currentY = e.pageY;
				}
			},
			'mouseup': function(e) {
				clicked = false;
				$('html').css('cursor', 'auto');
			}
		});
	};
	
	viewer.scalePage = function(factor) {
		viewer.setPageScale(viewer.pageScale * factor);
	};
					
	viewer.setPageScale = function(pageScale) {
		viewer.pageScale = pageScale;
		viewer.update();
	};
	
	viewer.goPage = function(number) {
		viewer.setPage(viewer.currentPage.pageNum + number);
	}
	
	viewer.setPage = function(page) {
		viewer.showPage(page);
	};
	
	var uiTools = {
		isCurrentPage : function() {
			return viewer.currentPage.wrapper != null;
		},
		scaleUp : function(o) {
			o.click(function() {
				viewer.scalePage(1.25);
			});			
			return {
				obj: o,
				isEnabled: this.isCurrentPage
			};
		},
		scaleDown : function(o) {
			o.click(function() {
				viewer.scalePage(0.85);
			});			
			return {
				obj: o,
				isEnabled: this.isCurrentPage
			};
		},
		prevPage : function(o) {
			o.click(function() {
				viewer.goPage(-1);
			});			
			return {
				obj: o,
				isEnabled: this.isCurrentPage
			};
		},
		nextPage : function(o) {
			o.click(function() {
				viewer.goPage(1);
			});			
			return {
				obj: o,
				isEnabled: this.isCurrentPage
			};
		},
		currentPage : function(o) {
			viewer.currentPageUi = o;
			o.click(function() {
				viewer.goPage(1);
			});
			return {
				obj: o,
				isEnabled: true
			};
		},
		movePage : function(o) {
			o.click(function() {
				viewer.isMovePageMode = !viewer.isMovePageMode;
				viewer.updateUiTools();
				$(viewer).trigger('movePageToolToggle', viewer.isMovePageMode);
			});
			$(viewer).on('disableMovePageTool', function(e) {
				if(viewer.isMovePageMode) {
					o.trigger('click');
				}
			});
			return {
				obj: o,
				isEnabled: this.isCurrentPage,
				update: function() {
					o.toggleClass('down', viewer.isMovePageMode)
				}
			};
		},
	};
	
	viewer.bindTools = function(selector) {
		$(selector).each(function() {
			var o = $(this);
			var role = o.data('role');
			if(role && uiTools[role]) {
				var tool = uiTools[role](o);
				if(tool) {
					viewer.uiTools.push(tool);
				}
			}
		});
		viewer.updateUiTools();
	};
	
	viewer.doUpdateUiTools = function(uiTools) {
		var updateTool = function(uiTool) {
			// enable/disabled
			var enabled = false;
			if(uiTool.isEnabled) {
				enabled = true;
				if(typeof uiTool.isEnabled === "function") {
					enabled = uiTool.isEnabled();
				}
			}
			uiTool.obj.toggleClass('disabled', !enabled);
			
			// update
			if(enabled && uiTool.update) {
				uiTool.update();
			}
		};
		
		// normal tools first
		for(var i=0; i<uiTools.length; i++) {
			if(!uiTools[i].group) {
				updateTool(uiTools[i]);
			}
		}
		
		// groups after normal tools
		for(var i=0; i<uiTools.length; i++) {
			if(uiTools[i].group) {
				updateTool(uiTools[i]);
			}
		}
	};
	
	viewer.updateUiTools = function() {
		viewer.doUpdateUiTools(viewer.uiTools);
	};
	
	var onPageShown = function(page, wrapper) {
		if(viewer.currentPageUi) {
			viewer.currentPageUi.text(page);
		}
		$(viewer).trigger('pageShown', viewer.currentPage);
	};
	
	viewer.clearPage = function() {
		if(viewer.currentPage.wrapper) {
			$(viewer).trigger('beforePageClear', viewer.currentPage);
			viewer.jtarget.empty();
		}
		viewer.currentPage.wrapper = null;
	};
	
	viewer.showPage = function(pageNum) {
		pageNum = validatePage(pageNum, viewer.pdfDoc.numPages);
		viewer.pdfDoc.getPage(pageNum).then(function(pdfPage) {
			if(viewer.pageScale <= 0) {
				var tw = viewer.jtarget.innerWidth();
				viewer.pageScale =  tw * 0.95 / pdfPage.getViewport(1.0).width;
			}
			var scale = viewer.pageScale * viewer.devicePixelRatio;
			var viewport = pdfPage.getViewport(scale);
			var canvas = document.createElement('canvas');
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			var ctx = canvas.getContext('2d');
			var renderCtx = {
				canvasContext: ctx,
				viewport: viewport
			};
			pdfPage.render(renderCtx).then(function() {
				ctx.globalCompositeOperation = 'destination-over';
				ctx.fillStyle = "#fff";
				ctx.fillRect( 0, 0, canvas.width, canvas.height );
			
				viewer.clearPage();
				viewer.bindHandTool(canvas);
				
				$(canvas).css('width','100%').css('height','100%');
				
				var wrapper = $('<div class="pageCanvasWrapper"/>');
				wrapper.css('display', 'inline-block').css('position','relative');
				wrapper.css('width', (viewport.width/viewer.devicePixelRatio) + 'px');
				wrapper.css('height', (viewport.height/viewer.devicePixelRatio) + 'px');
				wrapper.append(canvas);
				wrapper.data('page', pageNum);
				
				viewer.jtarget.append(wrapper);
				viewer.currentPage.wrapper = wrapper;
				viewer.currentPage.pageNum = pageNum;
				viewer.currentPage.pdfPage = pdfPage;
				viewer.currentPage.scale = scale;
				viewer.currentPage.viewport = viewport;
				onPageShown(pageNum, wrapper);
				
				pdfPage.getTextContent().then(function(textContent) {
					viewer.currentPage.textContent = textContent;
				});
			});
		});
	};
	
	$(viewer).on('pageShown', function(ev, p) {
		viewer.updateUiTools();
	});
	
	return viewer;
};

pdf24.createPdfViewer = function(conf, callback) {
	callback = callback || function() {};
	pdf24.requirePdfJs(function(pdfjs) {
		var viewer = pdf24.createPdfViewer0(conf);
		if(conf.fileUrl) {
			viewer.loadFile(conf.fileUrl, function() {
				callback(viewer);
			});
		} else {
			callback(viewer);
		}
	});
};