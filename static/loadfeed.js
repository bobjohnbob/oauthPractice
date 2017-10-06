(function(){
	'use strict';
	var AUTH_SETTINGS = {
		clientID: "1944365805820399",
		redirectURI: "http://localhost:3000/",
		authEndpoint: "https://www.facebook.com/v2.10/dialog/oauth",
		requiredPerms:  ["user_posts"]
	}

	var store = {
		status: "unauthenticated",
		userName: "",
		feed: []
	}

	$Auth.init(AUTH_SETTINGS);

	if(document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", onload);
	}	else {
		onload();
	}
	
	function onload(){
		var feed = document.getElementById("feed");
		var header = document.getElementById("header");
		if(!$Auth.isAuthed()) {
			if($Auth.wasError()){
				header.textContent = "It won't work if I can't spy on you.  Are you \
					sure you don't want to authorize it?";
				header.appendChild(createAuthButton("TRY AGAIN"));
			} else {
				header.textContent = "First you need to authorize Facebook to allow me \
					to spy on you.";
				header.appendChild(createAuthButton("AUTHORIZE"));
			}
		} else {
			$Auth.addExpireListener(onload);
			header.textContent = "Hello person.";
		}

	}

	function renderFeed() {

	}

	function createAuthButton(buttonText) {
		var button = document.createElement("Button");
		button.onclick = function(){$Auth.gotoAuth();};
		button.value = "authorize";
		button.type = "button";
		button.textContent = buttonText;
		return button;
	}
	
    
})();
