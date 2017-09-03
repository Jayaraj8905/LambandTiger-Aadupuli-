var socketListener = (function() {
	//listener for selecting tiger
	var socket;
  var userId, gameId, socketId;

  this.create = (gameId) => {
    userId = userObj.userId;
    gameId = gameId;
		socket = new WebSocket('ws://192.168.1.80:3000/message?userId='+userId+'&gameId='+gameId);
		socket.onopen = (event) => {
      console.log('Socket Opened');
      gameObj.start();
		};
		socket.onmessage = (event) => {
      console.log('Message from server');
      gameObj.socketMessage(JSON.parse(event.data));
		};
		socket.onclose = (event) => {
			socket = null;
      userId = null;
      gameId = null;
		}
	}

  this.close = function() {
    socket.close();
  }

  this.send = function(index, position, prevPosition) {
    const data = {
      number: index,
      position: position,
      prevPosition: prevPosition
    }
    socket.send(JSON.stringify(data));
  }
})
