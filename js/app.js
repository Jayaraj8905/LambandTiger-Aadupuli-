var userObj, servicesObj, gameObj, playerBoardObj, socketListner, lambtigerObj;

$(document).ready(function(){
	servicesObj = new services();

	userObj = new user();
	userObj.init();

	gameObj = new game();
	gameObj.init();
	playerBoardObj = new playerBoard();

	socketListener = new socketListener();
});

function gameLog(log){
	console.log(log);
}
