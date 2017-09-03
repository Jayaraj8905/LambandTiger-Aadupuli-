var services = (function() {

	let http;
	/**
	 * [description]
	 * @return {[type]} [description]
	 */
	this.getUser = function() {
		http = new Http();
		const userId = localStorage.getItem('userId');
		if (userId) {
			return userId;
		}
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
})
