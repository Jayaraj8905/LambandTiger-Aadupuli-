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
			const name = $('#username').val().trim();

			$('#userForm .error').addClass('hidden');
			if (name == '') {
				showError('Please enter gamer id with minimum of 5 characters!');
				return;
			}

			if (name.length < 5) {
				showError('Please enter gamer id with minimum of 5 characters!');
				return;
			}
			if(name) {
				servicesObj.isUserExists(name).then((isExists) => {
					if (isExists) {
						showError('This gamer id is already chosen by some other gamer!');
						return;
					}
					else {
						servicesObj.createUser({name: name}).then(data => {
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
		})
	}

	function showError(msg) {
		$('#userForm .error').removeClass('hidden');
		$('#userForm .error').html(msg);
	}

	function showBoard() {
		$('#userForm').remove();
	    $('#information, #board, #rules').removeClass('hide');
	}
})
