var user = (function() {

	this.userId = '';
	this.userName = '';

	this.init = function() {
		// if

		servicesObj.getUser().then(data => {
			this.userId = data.userId;
			this.userName = data.userName;
			if (this.userId) {
				showBoard();
			}	
		});
		

		$('body').delegate('#userForm button', 'click', () => {
			const name = $('#username').val();
			if(name) {
				servicesObj.createUser({name: name, test: 'test'}).then(data => {
					servicesObj.getUser().then(data => {
						this.userId = data.userId;
						this.userName = data.userName;
						if (this.userId) {
							showBoard();
						}	
					});
				})
			}
		})
	}

  function showBoard() {
    $('#userForm').remove();
    $('#information, #board, #rules').removeClass('hide');
  }
})
