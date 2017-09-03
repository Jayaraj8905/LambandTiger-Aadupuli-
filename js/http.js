var Http = (function() {

	const domain = 'http://192.168.1.80:3000';

	this.get = function(url, data) {
		const headers = new Headers();
		constructHeaders(headers);

		const init = {
			method: 'GET',
			headers: headers,
		}

		parsedData = constructParams(data);
		let fullUrl = constructUrl(url);
		if (parsedData) {
			fullUrl += '?'+parsedData;
		}

		return fetch(fullUrl, init)
		.then(response => {
			return response.json().then(data => {
				return data;
			})
		})
		.catch(error => {
			console.log(error);
		})
	}

	this.post = function(url, data) {
		const headers = new Headers();
		constructHeaders(headers);

		parsedData = constructParams(data);
		let fullUrl = constructUrl(url);

		const init = {
			method: 'POST',
			headers: headers,
			body: parsedData
		}

		return fetch(constructUrl(url), init)
		.then(response => {
			return response.json().then(data => {
				return data;
			})
		})
		.catch(error => {
			console.log(error);
		})
	}

	function constructUrl(url) {
		return domain+url;
	}

	function constructHeaders(headers) {
		headers.set("Content-Type","application/x-www-form-urlencoded");
	}

	/**
	 * [constructParams description]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	function constructParams(data) {
		var parsedData = '';

		for (var key in data) {
			if (parsedData) {
				parsedData += '&';
			}
			parsedData += key+'='+data[key];
		}

		const userId = localStorage.getItem('userId');
		if (userId) {
			parsedData += parsedData ? '&USERID='+userId : 'USERID='+userId;
		}

		return parsedData;
	}
})
