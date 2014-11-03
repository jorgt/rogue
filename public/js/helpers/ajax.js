define(["helpers/promise"], function(Promise) {

	'use strict';
	return sendRequest;

	function sendRequest(url, postData) {
		return new Promise(function(resolve, reject) {
			var req = createXMLHTTPObject();
			var method = (postData) ? "POST" : "GET";
			var url = 'http://localhost/rogue/'+url;
			req.open(method, url, true);
			//req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
			if (postData) {
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			}
			req.onreadystatechange = function() {
				if (req.readyState !== 4) {
					reject({
						success: false,
						req: req
					})
					return;
				};
				if (req.status !== 200 && req.status !== 304) {
					reject({
						success: false,
						req: req
					})
					return;
				}
				resolve({
					success: true,
					req: req
				});
			}
			if (req.readyState === 4) return;
			req.send(postData);
		});
	}

	var XMLHttpFactories = [

		function() {
			return new XMLHttpRequest()
		},
		function() {
			return new ActiveXObject("Msxml2.XMLHTTP")
		},
		function() {
			return new ActiveXObject("Msxml3.XMLHTTP")
		},
		function() {
			return new ActiveXObject("Microsoft.XMLHTTP")
		}
	];

	function createXMLHTTPObject() {
		var xmlhttp = false;
		for (var i = 0; i < XMLHttpFactories.length; i++) {
			try {
				xmlhttp = XMLHttpFactories[i]();
			} catch (e) {
				continue;
			}
			break;
		}
		return xmlhttp;
	}
})