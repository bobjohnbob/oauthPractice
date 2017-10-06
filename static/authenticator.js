(function(){
	'use strict';
	//This is how the world accesses it!
	var Auth = window.$Auth = {};
	var error;
	var expireListeners = [];
  
	//Init should be called before any other functions are used
	//settings: {
	//	clientID: client_id for oauth request
	//	redirectURI: where redirect to with the token after authorizing
	//	authEndpoint: OAuth endpoint to retrieve token
	//	requiredPerms: what permissions to request from the user 
	//}
	Auth.init = function(settings) {
		var isValid = Auth.verifySettings(settings);
		if(!isValid) {
			console.error("authenticator($Auth) initialized with invalid settings! \
			There may be problems...");
		}
		Auth.settings = {};
		Auth.settings.clientID = settings.clientID;
		Auth.settings.redirectURI = settings.redirectURI;
		Auth.settings.authEndpoint = settings.authEndpoint;
		Auth.settings.requiredPerms = settings.requiredPerms;
	
		if(Auth.getToken()) {
			if(Date.now() >= Auth.getToken().expiresTime) {
				Auth.removeToken();
			} else {
				window.setTimeout(Auth.expire, Auth.getToken().expiresTime - Date.now());
			}
		}
		
		if(window.location.hash !== "") {
			var hashParams = Auth.parseParams(window.location.hash);

			if(hashParams.error_reason) {
				error = error_reason;
				window.location.hash = "";
			}
			if(hashParams.access_token) {
				if(hashParams.state === Auth.getState()) {
					Auth.setToken(hashParams.access_token, hashParams.expires_in);
				} else {
					console.error("Invalid state! Something fishy here. Ignoring token...");
					console.error("Our state: ", hashParams.state, " Received state: ", hashParams.state);
				}
				clearHash();
			}
		}

		return isValid;
	};

	//Used to verify a settings object for init.  Also checked before each call
	//that uses the settings.
	Auth.verifySettings = function(settings) {
		return (
			settings &&
			settings.clientID &&
			settings.redirectURI &&
			settings.authEndpoint &&
		  Object.prototype.toString.call(settings.requiredPerms) === '[object Array]'
		);
	};

	//Test if the current $Auth.settings are valid.
	Auth.isInit = function(){
		return Auth.verifySettings(Auth.settings);
	};

	Auth.isAuthed = function() {
		return Auth.getToken();
	};

	Auth.wasError = function() {
		return error;
	};

	//Redirect to the auth endpoint and request an implicit authorization
	//	according to the current $Auth.settings.
	Auth.gotoAuth = function() {
		if(!Auth.isInit()) {
			console.error(
				"Error! Please configure with $Auth.init() before using $Auth"
			);
		}
		redirectToAuthEndpoint();

	};
	
	//User needs to know when things have expires so they can react to it.


	Auth.addExpireListener = function(listener) {
		expireListeners.push (listener);
	};

	Auth.removeExpireListener = function(listener) {
		expireListeners.forEach(function(element, i) {
			if(element === listener) {
				expireListeners[i] = undefined;
			}
		});
	};
	
	Auth.addExpireListener = function(listener) {
		expireListeners.push (listener);
	};

	Auth.removeExpireListener = function(listener) {
		expireListeners.forEach(function(element, i) {
			if(element === listener) {
				expireListeners[i] = undefined;
			}
		});
	};
	Auth.expire = function() {
		Auth.removeToken();
		expireListeners.forEach(function(listener) {
			if(typeof listener === "function") {
				listener();
			}
		});
	};
	
	Auth.parseParams = function(params) {
		var result = params.slice(1).split("&").reduce(function(obj, param) {
			var parsed = param.split("=");
			obj[parsed[0]] = decodeURIComponent(parsed[1]);
			return obj;
		}, {});
		return result;
	};

	Auth.encodeParams = function(paramObj) {
		return Object.keys(paramObj).map(function(key) {
			return key + "=" + encodeURIComponent(paramObj[key]);
		}).join("&");

	};

	Auth.getToken = function() {
		try {
			return JSON.parse(window.localStorage.getItem("$Auth_token"));
		} catch (e) {
			console.error("Error parsing token string from storage.")
			throw e;
		}
	};

	Auth.setToken = function(value, expires) {
		var token = {
			value: value,
			expiresTime: Date.now() + expires * 1000
		};
		window.setTimeout(Auth.expire, expires * 1000 - 60000);

		window.localStorage.setItem("$Auth_token", JSON.stringify(token));
	};

	Auth.removeToken = function() {
		window.localStorage.removeItem("$Auth_token");
	};
	
	Auth.getState = function() {
		if(!window.localStorage.getItem("$Auth_state")) {
			window.localStorage.setItem("$Auth_state", get15RandomSafeChars());
		}
		return window.localStorage.getItem("$Auth_state");
	};

	function redirectToAuthEndpoint(perms) {
		var payload = {
			client_id: Auth.settings.clientID,
			redirect_uri: Auth.settings.redirectURI,
			state: Auth.getState(),
			response_type: "token",
			scope: Auth.settings.requiredPerms.join(" ")
		}

		window.location = Auth.settings.authEndpoint + "?" + Auth.encodeParams(payload);
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
	function clearHash() {
		if(window.history && typeof window.history.replaceState !== "undefined") {
			history.replaceState({}, "", window.location.pathname + window.location.search);
		} else {
			window.location.hash = "";
		}
	}

})();
