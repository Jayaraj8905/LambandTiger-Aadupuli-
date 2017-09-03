//object holding the information about the game
var lambtiger = (function(){
	var tigerCount = 3;//max tiger count
	var lambCount = 15;//max lamb count
	var placeCount = 23;//total positions
	var hElements = [[1],[2,3,4,5,6,7],[8,9,10,11,12,13],[14,15,16,17,18,19],[20,21,22,23]];//pattern for rows
	var vElements = [[2,8,14],[1,3,9,15,20],[1,4,10,16,21],[1,5,11,17,22],[1,6,12,18,23],[7,13,19]];//pattern for columns

	var tigers = new Array();
	var lambs = new Array();
	var deadlambscount = 0;
	var lambTurn = true;

	//add the tiger to the position
	this.addTiger = function(position){
		//check the tiger count within the limit
		if(tigers.length >= tigerCount){
			gameLog('Tiger count reaches the limit');
		}
		//check whether no other tiger or lamb in that position
		else if(isTigerExists(position)){
			gameLog('Tiger Exists at location '+position);
		}
		else if(isLambExists(position)){
			gameLog('Lamb Exists at location '+position);
		}
		else{
			tigers.push(new tiger(position));
      if (gameObj.type == 'tiger') {
        socketListener.send(tigers.length - 1, position);
      }
			gameLog('Tiger added at position '+position);
			return true;
		}
		return false;
	};

	//add the lamb to the position
	this.addLamb = function(position){
		//check the lamb count within the limit
		if((lambs.length) >= lambCount){
			gameLog('Lamb count reaches the limit');
		}
		//check whether no other tiger or lamb in that position
		else if(isTigerExists(position)){
			gameLog('Tiger Exists at location '+position);
		}
		else if(isLambExists(position)){
			gameLog('Lamb Exists at location '+position);
		}
		else{
			lambs.push(new lamb(position));

      if (gameObj.type == 'lamb') {
        socketListener.send(lambs.length - 1, position);
      }
			gameLog('Lamb added at position '+position);
			lambTurn = false;//set the flag that it is a tiger turn
			return true;
		}
		return false;
	};

	//move the lamb to the requested position
	//check that is the valid position
	this.moveLamb = function(currPosition, position){
		var moved = false;
		//check whether no other tiger or lamb in that position
		if(isTigerExists(position)){
			gameLog('Tiger Exists at location '+position);
		}
		else if(isLambExists(position)){
			gameLog('Lamb Exists at location '+position);
		}
		else{
			var validMove = false;
			//check valid in horizontal movement or vertical movement
			validMove = hElements.filter(function(arr){
				//check valid in horizontal movement
				var currIndex = arr.indexOf(currPosition);//get the current position index
				var nextIndex = arr.indexOf(position);//get the next position index
				if(currIndex != -1 && nextIndex != -1){//if exist
					return currIndex+1 == nextIndex || currIndex-1 == nextIndex;//check the next index is next or prev to current index
				}
			}).length > 0
			//check valid in vertical movement
			|| 	vElements.filter(function(arr){
				var currIndex = arr.indexOf(currPosition);
				var nextIndex = arr.indexOf(position);
				if(currIndex != -1 && nextIndex != -1){
					return currIndex+1 == nextIndex || currIndex-1 == nextIndex;
				}
			}).length > 0;
			if(validMove){
				lambs.filter(function(lamb,index){
					//filter out the array of lambs and change the position
					if(lamb.getPosition() == currPosition){
						lambs[index].setPosition(position);
            if (gameObj.type == 'lamb') {
              socketListener.send(index, position, currPosition);
            }
						moved = true;//set the flag as moved once done
						lambTurn = false;//set the flag for tiger turn
					}
				});
			}
			else
				gameLog('Invalid Lamb Move');

			if(moved)
				gameLog('Lamb position changed from '+currPosition+ ' to '+ position);
			else
				gameLog('Lamb position not changed from '+currPosition+ ' to '+ position);
		}
		return moved;
	};

	//move the tiger to the requested position
	//check that is the valid position
	//check whether there is any eatable goat
	this.moveTiger = function(currPosition, position){
		var moved = false;
		var eatenLamb = false;

		//check whether no other tiger or lamb in that position
		if(isTigerExists(position)){
			gameLog('Tiger Exists at location '+position);
		}
		else if(isLambExists(position)){
			gameLog('Lamb Exists at location '+position);
		}
		else{
			var validMove = false;
			//check valid in horizontal movement or vertical movement
			validMove = hElements.filter(function(arr){
				//check valid in horizontal movement
				var currIndex = arr.indexOf(currPosition);//get the current position index
				var nextIndex = arr.indexOf(position);//get the next position index
				if(currIndex != -1 && nextIndex != -1){//if exist
					//check for normal move
					if(currIndex+1 == nextIndex || currIndex-1 == nextIndex)//check the next index is next or prev to current index							}
						return true;
					//check for eating the lamb
					else{
						eatenLamb = isLambAvailToEat(arr, currIndex, nextIndex);
						return true;
					}
				}
			}).length > 0
			//check valid in vertical movement
			|| 	vElements.filter(function(arr){
				var currIndex = arr.indexOf(currPosition);
				var nextIndex = arr.indexOf(position);
				if(currIndex != -1 && nextIndex != -1){
					//check for normal move
					if(currIndex+1 == nextIndex || currIndex-1 == nextIndex)
						return true;
					//check for eating the lamb
					else{
						eatenLamb = isLambAvailToEat(arr, currIndex, nextIndex);
						return true;
					}
				}
			}).length > 0;
			if(validMove){
				tigers.filter(function(tiger,index){
					//filter out the array of tigers and change the position
					if(tiger.getPosition() == currPosition){
						tigers[index].setPosition(position);
            if (gameObj.type == 'tiger') {
              socketListener.send(index, position, currPosition);
            }
						moved = true;//set the flag as moved once done
						lambTurn = true;//set the flag for lamb turn
					}
				});
			}
			else
				gameLog('Invalid Tiger Move');

			if(moved)
			{
				gameLog('Tiger position changed from '+currPosition+ ' to '+ position);
				if(eatenLamb) return eatLamb(eatenLamb);
			}
			else
				gameLog('Tiger position not changed from '+currPosition+ ' to '+ position);
		}
		return moved;
	};

	//eat the lamb
	//return the position of the eaten lamb
	var eatLamb = function(eatenLamb){
		if(eatenLamb){
			//eat the lamb
			eatenLambPosition = eatenLamb.getPosition();
			gameLog('Lamb eaten at position '+eatenLambPosition);
			deadlambscount++;
			//identify the position of lamb to eaten
			var eatenLambIndex;
			var eatenLambs = lambs.filter(function(lamb, index){
				if(lamb.getPosition() == eatenLambPosition){
					eatenLambIndex = index;
					lambs[index].setPosition(-1);//set the poition as eaten
					return true;
				}
			});

			return eatenLambPosition;
		}
	}

	/*********PRIVATE FUNCTIONS********/
	//check whether the lamb is available
	//checking the current index is 2 index lesser than or equal to next index
	//and get the available lamb for eating
	var isLambAvailToEat = function(arr, currIndex, nextIndex){
		var eatenLamb = false;
		//check lamb exists at next position
		if(currIndex+2 == nextIndex){
			eatenLamb = getLambByPosition(arr[currIndex+1]);
			gameLog('Lamb for lunch is available at previous position');
		}
		//check lamb exists at next position
		else if(currIndex-2 == nextIndex){
			eatenLamb = getLambByPosition(arr[currIndex-1]);
			gameLog('Lamb for lunch is available at next position');
		}
		return eatenLamb;
	}
	//TODO:CALCULATION FOR TIGER MOVE
	this.getTigerMove = function(){
		//calculate the favourable move for the tiger
		//return current position and next position
		var tiger, index;
		var keys = Object.keys(lambtigerObj.getTigers());
		shuffle(keys);//shuffle the tigers
		for(var index=0;index<keys.length;index++){
			//check if any lamb can available
			tiger = tigers[keys[index]];
			var lambMovePosition = favLambForTiger(tiger);
			//if the lamb list is available
			//return the lamb at first index
			if(lambMovePosition.length) {
				gameLog('Favourite Lamb for tiger at position '+tiger.getPosition()+' exist so move to position '+lambMovePosition);
				return [tiger.getPosition(),lambMovePosition[0]];
			}
		}

		gameLog('Search favourite lamb at next move');
		//else move the tiger to the next position and check whether any goat available on that position
		shuffle(keys);

		var nextPositionAvailLambsCount = 0;//count of available lamb to eat on next move
		var nextPosition, fromPosition;//next move position, from position
		for(var index=0;index<keys.length;index++){
			//check if any lamb can dead in first move of the tiger
			tiger = tigers[keys[index]];
			var originalPosition = tiger.getPosition();
			gameLog('Analyse for tiger at position '+originalPosition);
			gameLog('AvailPositions:::');
			//get the available positions
			var availPositions = getAvailPositions(tiger.getPosition());
			gameLog(availPositions);
			for(var positionIndex=0;positionIndex<availPositions.length;positionIndex++){
				var next = availPositions[positionIndex];
				//NOTE: SETTING THE POSITION FOR BELOW TIGER VARIABLE REFLECTED IN THE GLOBAL VARIBALE TIGERS
				tiger.setPosition(next);//move the tiger to the next position and check any favourite lamb exists
				for(var nextIndex=0;nextIndex<keys.length;nextIndex++){
					var lambMovePosition = favLambForTiger(tigers[keys[nextIndex]]);
					if(lambMovePosition.length) {
						// return [originalPosition,next];//return the current position and next position
						if(lambMovePosition.length > nextPositionAvailLambsCount)
						{
							nextPositionAvailLambsCount = lambMovePosition.length;
							nextPosition = next;
							fromPosition = originalPosition;
						}
					}
				}
				//once again reset to the original position
				tiger.setPosition(originalPosition);
			}
		}
		if(nextPosition){//
			gameLog('Total ' +nextPositionAvailLambsCount+' Favourite Lamb for tiger at position '+fromPosition+' occurs on next move so move to position '+nextPosition);
			return [fromPosition,nextPosition];
		}
		gameLog('No favourite lamb available:::Going for favourite move');
		//TODO: check if the tiger has three or two or one movement positions after this move
		//get the available position to move
		shuffle(keys);

		var nextPositionMovePossibilitiesCount = 0;
		var fromPosition, nextPosition;
		for(var index=0;index<keys.length;index++){
			tiger = tigers[keys[index]];
			var originalPosition = tiger.getPosition();
			var availPositions = getAvailPositions(tiger.getPosition());
			gameLog('Analyse favourite move for tiger at position '+originalPosition);
			for(var positionIndex=0;positionIndex<availPositions.length;positionIndex++){
				var next = availPositions[positionIndex];
				//NOTE: SETTING THE POSITION FOR BELOW TIGER VARIABLE REFLECTED IN THE GLOBAL VARIBALE TIGERS
				tiger.setPosition(next);//move the tiger to the next position and check any favourite lamb exists

				//get the avail position on next move
				//and return the tiger with max moves after the next move
				var nextAvailPositions = getAvailPositions(tiger.getPosition());
				if(nextAvailPositions.length && nextAvailPositions.length > nextPositionMovePossibilitiesCount){
					nextPositionMovePossibilitiesCount = nextAvailPositions.length;
					nextPosition = next;
					fromPosition = originalPosition;
				}
				//once again reset to the original position
				tiger.setPosition(originalPosition);
			}
		}
		if(nextPosition){
			gameLog('Total ' +nextPositionMovePossibilitiesCount+' Moves for tiger at position '+fromPosition+' occurs on next move so move to position '+nextPosition);
			return [fromPosition,nextPosition];
		}

		return false;
	};

	//get the favourite lamb for the tiger
	var favLambForTiger = function(tiger){
		var position = tiger.getPosition();

		var positionIndex;
		var lamb = false;

		var favLambList = [];//collect the available favourite lamb in this object
		//check in the horizontal array if any lamb is available
		for(var index=0;index<hElements.length;index++){
			var analyseArr = hElements[index];
			positionIndex = analyseArr.indexOf(position);
			if(positionIndex != -1){
				//check the previous and its previous position exists in the array
				//and previous of previous is empty
				//and check lamb exists in the previous
				if(analyseArr[positionIndex-1] != undefined
					&& analyseArr[positionIndex-2] != undefined && isEmptyPosition(analyseArr[positionIndex-2])) {
					lamb = getLambByPosition(analyseArr[positionIndex-1]);
					if(lamb) favLambList.push(analyseArr[positionIndex-2]);
				}
				//check the next  and its next position exists in the array
				//and check lamb exists in the next
				//and next of next is empty
				if(analyseArr[positionIndex+1] != undefined
					&& analyseArr[positionIndex+2] != undefined && isEmptyPosition(analyseArr[positionIndex+2])) {
					lamb = getLambByPosition(analyseArr[positionIndex+1]);
					if(lamb) favLambList.push(analyseArr[positionIndex+2]);
				}
			}
		}
		//check in the vertical array if any lamb is available
		for(var index=0;index<vElements.length;index++){
			var analyseArr = vElements[index];
			positionIndex = analyseArr.indexOf(position);
			if(positionIndex != -1){
				//check the previous  and its previous position exists in the array
				//and check lamb exists in the previous
				//and previous of previous is empty
				if(analyseArr[positionIndex-1] != undefined
					&& analyseArr[positionIndex-2] != undefined && isEmptyPosition(analyseArr[positionIndex-2])) {
					lamb = getLambByPosition(analyseArr[positionIndex-1]);
					if(lamb) favLambList.push(analyseArr[positionIndex-2]);
				}
				//check the next  and its next position exists in the array
				//and check lamb exists in the next
				//and next of next is empty
				if(analyseArr[positionIndex+1] != undefined
					&& analyseArr[positionIndex+2] != undefined && isEmptyPosition(analyseArr[positionIndex+2])) {
					lamb = getLambByPosition(analyseArr[positionIndex+1]);
					if(lamb) favLambList.push(analyseArr[positionIndex+2]);
				}
			}
		}
		if(favLambList.length) return favLambList;
		return false;
	}

	//returns horizontal and vertical position available next to the given position
	var hvPositions = function(position){
		var positionIndex;
		var hArr = [],vArr = [];
		//get the horizontal array in which the requested tiger position exists
		for(var index=0;index<hElements.length;index++){
			var analyseArr = hElements[index];
			positionIndex = analyseArr.indexOf(position);
			if(positionIndex != -1){
				if(analyseArr[positionIndex-1] != undefined) hArr.push(analyseArr[positionIndex-1]);
				if(analyseArr[positionIndex+1] != undefined) hArr.push(analyseArr[positionIndex+1]);
			}
		}
		//get the vertical array in which the requested tiger position exists
		for(var index=0;index<vElements.length;index++){
			var analyseArr = vElements[index];
			positionIndex = analyseArr.indexOf(position);
			if(positionIndex != -1){
				if(analyseArr[positionIndex-1] != undefined) vArr.push(analyseArr[positionIndex-1]);
				if(analyseArr[positionIndex+1] != undefined) vArr.push(analyseArr[positionIndex+1]);
			}
		}
		return [hArr,vArr];
	}
	//get the next and previous position from given array based on the index
	var getImmediatePositions = function(position){
		var arr = [];
		var returnData = hvPositions(position);
		return arr.concat(returnData[0], returnData[1]);
	}
	//get the availablePositions to move
	var getAvailPositions = function(position){
		var immediatePositions = getImmediatePositions(position);
		var availPositions = [];
		for(var index=0;index<immediatePositions.length;index++){
			if(isEmptyPosition(immediatePositions[index])) availPositions.push(immediatePositions[index]);
		}
		return availPositions;
	}
	//check any other tiger exists at this position
	var isTigerExists = function(position){
		return tigers.filter(function(tiger){
			return tiger.getPosition() == position;
		}).length > 0;
	};
	//check any other lamb exists at this position
	var isLambExists = function(position){
		return lambs.filter(function(lamb){
			return lamb.getPosition() == position;
		}).length > 0;
	}
	//check the position is empty
	var isEmptyPosition = function(position){
		return !isTigerExists(position) && !isLambExists(position);
	}
	//get the tigerObj by position
	var getTigerByPosition = function(position){
		var lists = tigers.filter(function(tiger){
			return tiger.getPosition() == position;
		});

		if(lists.length > 0) return lists[0];
		return false;
	};
	//get the lambObj by position
	var getLambByPosition = function(position){
		var lists = lambs.filter(function(lamb){
			return lamb.getPosition() == position;
		});
		if(lists.length > 0) return lists[0];
		return false;
	};

	/**********GETTER FUNCTIONS********/
	this.getTigers = function(){
		return tigers;
	}
	this.getLambs = function(){
		return lambs;
	}

	this.maxTiger = function(){
		return tigerCount;
	}

	this.maxLamb = function(){
		return lambCount;
	}

	this.deadLambCount = function(){
		return deadlambscount;
	}

	this.isLambTurn = function(){
		return lambTurn;
	}
});

var tiger = (function(pos){
	var position = pos;

	this.setPosition = function(pos){
		position = pos;

	};

	this.getPosition = function(){
		return position;
	}
});

var lamb = (function(pos){
	var position = pos;

	this.setPosition = function(pos){
		position = pos;

	};

	this.getPosition = function(){
		return position;
	}
});

function random(max){
	return Math.floor((Math.random() * max) + 1);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
