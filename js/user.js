var user = (function() {

	this.userId = '';

	this.init = function() {
		// if
		this.userId = servicesObj.getUser();
		if (this.userId) {
			showBoard();
		}

		$('body').delegate('#userForm button', 'click', function() {
			const name = $('#username').val();
			if(name) {
				servicesObj.createUser({name: name, test: 'test'}).then(data => {
					this.userId = servicesObj.getUser();
					showBoard();
				})
			}
		})
	}

  function showBoard() {
    $('#userForm').remove();
    $('#information, #board, #rules').removeClass('hide');
  }
})
