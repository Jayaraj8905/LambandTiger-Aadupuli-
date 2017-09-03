var game = (function(){
	this.gameId = '';
	this.type = ''
	var th = this;
	var started = false;
	this.init = () => {
		// var playerBoardObj = new playerBoard();
		lambtigerObj = new lambtiger();

		//timer routine
		var time = 300;
		var timer;
		var timefn = function(){
			time--;
			$('.timer .min').html(Math.floor(time/60));
			$('.timer .sec').html(time%60);
			if(time == 0) clearInterval(timer);
		}
		timer = setInterval(timefn, 1000);

		//add position for every eleHld
		var iteratePos = 1;
		$('#board .eleHld').each(function(){
			$(this).data('position',iteratePos++);
		});

		$('#buttonsHld .start').click(function(){
			th.start();
		})

		$('#buttonsHld .startonline').click(function() {
			startOnline();
		})

		$('#buttonsHld .reset').click(function(){
			reset();
		})

		//listener for selecting tiger
		$('#board').delegate('.eleHld.tiger','click',function(){
			if(!started || lambtigerObj.isLambTurn() || !$(this).hasClass('tiger')) return;
			$('#board .eleHld.tiger').removeClass('selectedTiger');
			$(this).addClass('selectedTiger');
		});

		//listener for selecting lamb
		$('#board').delegate('.eleHld.lamb','click',function(){
			if(!started || !lambtigerObj.isLambTurn() || (lambtigerObj.getLambs().length) < lambtigerObj.maxLamb()) return;
			if(!$(this).hasClass('lamb')) return;
			$('#board .eleHld.lamb').removeClass('selectedLamb');
			$(this).addClass('selectedLamb');
		});

		//listener for move tiger
		$('#board .eleHld:not(.tiger):not(.lamb)').click(function(e){
			if(!started || lambtigerObj.isLambTurn() || $(this).hasClass('tiger') || $(this).hasClass('lamb')) return;
			// if online game and the type is lamb return
			if (th.gameId && th.type == 'lamb') return;
			moveTiger($(this), e);
		});

		//listener for add lamb and move lamb
		$('#board .eleHld:not(.lamb):not(.tiger)').click(function(e){
			if(!started || !lambtigerObj.isLambTurn() || $(this).hasClass('lamb') || $(this).hasClass('tiger')) return;
			// if online game and the type is tiger return
			if (th.gameId && th.type == 'tiger') return;
			moveLamb($(this), e);
		});

	};

	//get the data position
	var getPosition = (obj) => {
		return obj.data('position');
	};

	var updateLambCount = () => {
		$('#information .infounit.lamb .count').html(lambtigerObj.maxLamb() - lambtigerObj.getLambs().length);
	}

	var updateDeadLambCount = () => {
		$('#information .infounit.deadlamb .count').html(lambtigerObj.deadLambCount());
	}

	var updateMessage = () => {
		$('#information .infounit.deadlamb .count').html(lambtigerObj.deadLambCount());
	}

	var showMessage = (classname,callback) => {
		$('#information .'+classname).show();
		if(classname == 'lambdead')
			$('#information .'+classname).fadeOut(2000,function(){
				if(typeof callback == 'function'){
					callback();
				}
			});
	}

	//game initiator
	this.start = () => {
		$('.page').addClass('live');
		playerBoardObj.draw();
		var tigerPos = [1,4,5];
		for(var index=0; index<tigerPos.length; index++){
			if(lambtigerObj.addTiger(tigerPos[index]))
				$('.eleNo_'+tigerPos[index]).addClass('tiger');
		}
		updateLambCount();
		updateDeadLambCount();

		started = true;
	};

	var startOnline = (data) => {
		servicesObj.startGame().then( data => {
			// establish websocket here
			// start the game
			th.gameId = data.id;
			th.type = data.playertype;
			socketListener.create(th.gameId);
		})
	}

	var reset = () => {
		lambtigerObj = new lambtiger();
		$('#board .eleHld').removeClass('tiger lamb deadlamb selectedTiger selectedLamb');
		$('.page').removeClass('live');
		started = false;
		$('#information').find('.lambdead,.tigerwin,.lambwin').hide();
		$(playerBoardHld).find('.eleHld').css({display: 'none'});
		if (th.gameId) {
			// close the socket
			socketListener.close();
			th.gameId = '';
			th.type = '';
		}
	}

	this.socketMessage = (data) => {
		console.log("socket message", data);
		var fn = data.type == 'lamb' ? moveLamb : moveTiger;
		if (data.prevPosition) {
				// fn($('#board .eleHld.eleNo_'+data.prevPosition));
				$('#board .eleHld.eleNo_'+data.prevPosition).trigger('click');
		}
		if (data.position) {
				fn($('#board .eleHld.eleNo_'+data.position));
				// $('#board .eleHld.eleNo_'+data.position).trigger('click');
		}
	}

	var moveTiger = (obj, e) => {
		var position = getPosition(obj);
		var selectedObj = $('#board .eleHld.selectedTiger');//get the selected lamb
		if(selectedObj.length == 0) return;
		var currPosition = getPosition(selectedObj);
		var eatenLambPosition = lambtigerObj.moveTiger(currPosition, position);
		if(eatenLambPosition === false && e){
			e.stopPropagation();
		}
		else{
			$('.eleNo_'+currPosition).removeClass('tiger selectedTiger');
			$('.eleNo_'+position).addClass('tiger');
			if(eatenLambPosition !== true){//not true means it is a position of the eaten lamb position
				$('.eleNo_'+eatenLambPosition).removeClass('lamb').addClass('deadlamb');
				updateDeadLambCount();

				if(lambtigerObj.deadLambCount() >= 5) started = false;
				showMessage('lambdead',function(){
					$('.eleNo_'+eatenLambPosition).removeClass('deadlamb');
					if(lambtigerObj.deadLambCount() >= 5) showMessage('tigerwin');
				});
			}
		}
	}

	var moveLamb = (obj, e) => {
		var position = getPosition(obj);
		//add lamb here if there is still some lambs
		if((lambtigerObj.getLambs().length) < lambtigerObj.maxLamb()){
			if(lambtigerObj.addLamb(position)){
				obj.addClass('lamb').removeClass('deadlamb');
				updateLambCount();
			}
		}
		//move the lamb
		else{
			var selectedObj = $('#board .eleHld.selectedLamb');//get the selected lamb
			if(selectedObj.length == 0) return;
			var currPosition = getPosition(selectedObj);
			if(lambtigerObj.moveLamb(currPosition, position)){
				$('.eleNo_'+currPosition).removeClass('lamb selectedLamb');
				$('.eleNo_'+position).addClass('lamb');
			}

			if(e) {
				e.stopPropagation();
			}

		}

		// it represents the online game
		if (!th.gameId){
			//get the tiger to move
			var data = lambtigerObj.getTigerMove();
			if(data){
				setTimeout(function(){
					$('#board .eleHld.eleNo_'+data[0]).trigger('click');
					$('#board .eleHld.eleNo_'+data[1]).trigger('click');
				}, 1000);
			}
			else
				showMessage('lambwin');
		}
	}
});
