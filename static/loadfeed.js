(function(){
	'use strict';
	var CLIENT_ID = "1944365805820399";
	var REDIRECT_URI = "http://localhost:3000/";
	var AUTH_ENDPOINT = "https://www.facebook.com/v2.10/dialog/oauth";
	var PERMS = "user_posts";
	var token = window.localStorage.getItem("token");
	var state = window.localStorage.getItem("state");
	if (!state) {
		state = get15RandomSafeChars();
		window.localStorage.setItem("state", state);
	}
	console.log("state: ", state);

	if(window.location.hash !== "") {
		var hashParams = window.location.hash.slice(1).split("&");
		hashParams = hashParams.reduce(function(obj, param) {
			var parsed = param.split("=");
			obj[parsed[0]] = decodeURIComponent(parsed[1]);
			return obj;
		}, {});

		if(hashParams.access_token) {
			if(hashParams.state === state) {
				token = hashParams.access_token;
				window.localStorage.setItem("token", token);
			} else {
				console.log("Invalid state! Something fishy here. Ignoring token...");
				console.log("Our state: ", state, " Received state: ", hashParams.state);
			}
		}
	}
	if(!token) {
		console.log("NOT AUTHED!");
	} else {
		console.log("Probably authed!");
	}

	document.addEventListener('DOMContentLoaded', function() {
		var feed = document.getElementById("feed");
		if(!token) {
			feed.textContent = "First you need to authorize Facebook to allow me to spy you.";
			var button = document.createElement("Button");
			button.onclick = function(){redirectToAuthEndpoint(PERMS);};
			button.value = "authorize";
			button.type = "button";
			button.textContent = "AUTHORIZE";
			feed.appendChild(button);
		} else {
			feed.textContent = "Hello person.";
		}

	});

	function redirectToAuthEndpoint(perms) {
		var payload = {
			client_id: CLIENT_ID,
			redirect_uri: REDIRECT_URI,
			state: state,
			response_type: "token",
			scope: perms
		};

		var params = Object.keys(payload).map(function(key) {
			return key + "=" + encodeURIComponent(payload[key]);
		}).join("&");

		window.location = AUTH_ENDPOINT + "?" + params;
	}

	function get15RandomSafeChars() {
		var characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
		var string = "";
		var numbers = [0,1,2].map(function() {
			return Math.floor(Math.random() * Math.pow(2,32));
		});
		numbers.forEach(function(num) {
			var bits = num;
			for(var i = 0; i < 5; ++i) {
				string += characters[bits & 0x3f];
				bits = bits >> 6;
			}
		});
		return string;
	}
    
})();
