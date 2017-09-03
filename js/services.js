var services = (function() {

	let http;
	/**
	 * [description]
	 * @return {[type]} [description]
	 */
	this.getUser = function(id) {
		var dfd = jQuery.Deferred();
		http = new Http();
		let setLocalStorage = false;
		let userId, userName;
		if (id) {
			userId = id;
		} else {
			userId = localStorage.getItem('userId');
			userName = localStorage.getItem('userName');	
			setLocalStorage = true;
		}
		
		if (userId && !userName) {
			http.get('/api/user/list?id='+userId).then((data) => {
				const userData = data[0];
				if (setLocalStorage && userData) {
					localStorage.setItem('userId', userData.id);
					localStorage.setItem('userName', userData.name);
				}

				dfd.resolve({
					userId: userData.id,
					userName: userData.name
				});	
			})	
		} else if (userId && userName) {
			dfd.resolve({
				userId: userId,
				userName: userName
			});
		}
				
		return dfd.promise();
	}
	/**
	 * Create the user
	 * Promise
	 */
	this.createUser = function(data) {
		return http.post('/api/user/create', data).then(data => {
			localStorage.setItem('userId', data.id);
			return data;
		});
	}

	/**
	 * Join the Game
	 * @return {[type]} [description]
	 */
	this.startGame = function() {
		return http.get('/api/game/start').then(data => {
			return data;
		});
	}

	this.getGame = function(gameId) {
		return http.get('/api/game/list?id='+gameId).then(data => {
			return data[0];
		})
	}
})
