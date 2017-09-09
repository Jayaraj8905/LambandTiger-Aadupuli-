var line = (function(x1, y1, x2, y2) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.draw = function() {

		var dfd = jQuery.Deferred();

		setTimeout(function() {
			playerBoardObj.ctx.moveTo(x1, y1);
			playerBoardObj.ctx.lineTo(x2, y2);
			playerBoardObj.ctx.stroke();
			dfd.resolve();
		}, 100);


		return dfd.promise();
	}
})

var circle = (function(index, line1, line2) {
	this.index = index;
	this.line1 = line1;
	this.line2 = line2;
})


var playerBoard = (function(){
	var width;
	var height;
	var circleWidth;
	var circleRadius;
	var lineObjs;
	var circleObjs;
	this.ctx;
	playerBoardHld = $('#board');

	function setCirclePosition(index, line1Obj, line2Obj) {
		var intersectionPoint = checkLineIntersection(line1Obj.x1, line1Obj.y1, line1Obj.x2, line1Obj.y2,
														line2Obj.x1, line2Obj.y1, line2Obj.x2, line2Obj.y2);

		var indexes = {
			x: intersectionPoint.x - circleRadius,
			y: intersectionPoint.y - circleRadius,
		}
		$(playerBoardHld).find('.eleNo_'+index).css({'left' : indexes.x + 'px', 'top' : indexes.y + 'px', 'display': 'inline'});
	}

	function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
	    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
	    var denominator, a, b, numerator1, numerator2, result = {
	        x: null,
	        y: null,
	        onLine1: false,
	        onLine2: false
	    };
	    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
	    if (denominator == 0) {
	        return result;
	    }
	    a = line1StartY - line2StartY;
	    b = line1StartX - line2StartX;
	    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
	    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
	    a = numerator1 / denominator;
	    b = numerator2 / denominator;

	    // if we cast these lines infinitely in both directions, they intersect here:
	    result.x = line1StartX + (a * (line1EndX - line1StartX));
	    result.y = line1StartY + (a * (line1EndY - line1StartY));
		/*
	        // it is worth noting that this should be the same as:
	        x = line2StartX + (b * (line2EndX - line2StartX));
	        y = line2StartX + (b * (line2EndY - line2StartY));
	        */
	    // if line1 is a segment and line2 is infinite, they intersect if:
	    if (a > 0 && a < 1) {
	        result.onLine1 = true;
	    }
	    // if line2 is a segment and line1 is infinite, they intersect if:
	    if (b > 0 && b < 1) {
	        result.onLine2 = true;
	    }
	    // if line1 and line2 are segments, they intersect if both of the above are true
	    return result;
	};

	function initLineDraw(lineNo) {
		if (!lineNo) {
			lineNo = 0;
		}
		var dfd = jQuery.Deferred();

		$.when(lineObjs[lineNo].draw()).then(function() {
			lineNo++;
			if (lineNo == lineObjs.length) {
				dfd.resolve();
			}
			else {
				$.when(initLineDraw(lineNo)).then(function() {
					dfd.resolve();
				})
			}

		})
		return dfd.promise();
	}

	function drawCircle(circleNo) {
		if (!circleNo) {
			circleNo = 0;
		}
		var dfd = jQuery.Deferred();

		setTimeout(function() {
			// draw here
			setCirclePosition(circleObjs[circleNo].index, circleObjs[circleNo].line1, circleObjs[circleNo].line2);
			circleNo++;
			if (circleNo == circleObjs.length) {
				dfd.resolve();
			}
			else {
				$.when(drawCircle(circleNo)).then(function() {
					dfd.resolve();
				})
			}
		}, 50)
		return dfd.promise();
	}

	this.draw = function(){
		if (isMobile()) {
			circleWidth = 20;
			circleRadius = circleWidth/2;
			// var ratio = window.devicePixelRatio || 1;
			width = playerBoardHld.width();
			height = screen.height/2;
			// width = screen.width - circleWidth;

		} else {
			circleWidth = 35;
			circleRadius = circleWidth/2;
			width = playerBoardHld.width();
			var height = width/2;
		}

		var playerBoardCanvas = document.getElementById("playerBoardCanvas");
		playerBoardCanvas.width = width;
		playerBoardCanvas.height = height;
		this.ctx = playerBoardCanvas.getContext("2d");

		var hDiv = width/5;
		var vDiv = height/4;
		var startPoint = width/2;

		lineObjs = [
			new line(startPoint, 0, hDiv*1, height),
			new line(startPoint, 0, hDiv*2, height),
			new line(startPoint, 0, hDiv*3, height),
			new line(startPoint, 0, hDiv*4, height),
			new line(0, vDiv*1.5, 0, vDiv*3.1),
			new line(width, vDiv*1.5, width, vDiv*3.1),
			new line(0, vDiv*1.5, width, vDiv*1.5),
			new line(0, vDiv*2.3, width, vDiv*2.3),
			new line(0, vDiv*3.1, width, vDiv*3.1),
			new line(hDiv*1, height-1, hDiv*4, height-1)
		]

		circleObjs = [
			new circle(1, lineObjs[0], lineObjs[1]),

			new circle(2, lineObjs[4], lineObjs[6]),
			new circle(3, lineObjs[0], lineObjs[6]),
			new circle(4, lineObjs[1], lineObjs[6]),
			new circle(5, lineObjs[2], lineObjs[6]),
			new circle(6, lineObjs[3], lineObjs[6]),
			new circle(7, lineObjs[5], lineObjs[6]),

			new circle(8, lineObjs[4], lineObjs[7]),
			new circle(9, lineObjs[0], lineObjs[7]),
			new circle(10, lineObjs[1], lineObjs[7]),
			new circle(11, lineObjs[2], lineObjs[7]),
			new circle(12, lineObjs[3], lineObjs[7]),
			new circle(13, lineObjs[5], lineObjs[7]),

			new circle(14, lineObjs[4], lineObjs[8]),
			new circle(15, lineObjs[0], lineObjs[8]),
			new circle(16, lineObjs[1], lineObjs[8]),
			new circle(17, lineObjs[2], lineObjs[8]),
			new circle(18, lineObjs[3], lineObjs[8]),
			new circle(19, lineObjs[5], lineObjs[8]),

			new circle(20, lineObjs[0], lineObjs[9]),
			new circle(21, lineObjs[1], lineObjs[9]),
			new circle(22, lineObjs[2], lineObjs[9]),
			new circle(23, lineObjs[3], lineObjs[9])
		]

		$.when(initLineDraw()).then(function() {
			$.when(drawCircle()).then(function() {

			})
		})

		function isMobile() {
			if( navigator.userAgent.match(/Android/i)
			 || navigator.userAgent.match(/webOS/i)
			 || navigator.userAgent.match(/iPhone/i)
			 || navigator.userAgent.match(/iPad/i)
			 || navigator.userAgent.match(/iPod/i)
			 || navigator.userAgent.match(/BlackBerry/i)
			 || navigator.userAgent.match(/Windows Phone/i)
			 ){
			    return true;
			}
			 else {
			    return false;
			}
		}
	}
});
