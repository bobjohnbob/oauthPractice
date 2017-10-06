(function(){
	'use strict';
	var AUTH_SETTINGS = {
		clientID: "1944365805820399",
		redirectURI: "http://localhost:3000/",
		authEndpoint: "https://www.facebook.com/v2.10/dialog/oauth",
		requiredPerms:  ["user_posts"]
	}

	var store = {
		status: "unauthorized",
		name: "",
		feed: []
	}

	function updateStore(newState) {
		store = newState;
		var feed = document.getElementById("feed");
		var header = document.getElementById("header");
		render(store, header, feed);
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
				updateStore({status:"error", name:"", feed: []});
			} else {
				updateStore({status:"unauthorized", name:"", feed: []});
			}
		} else {
			updateStore({status:"success", name:"", feed: []});
			$Auth.addExpireListener(onload);
			header.textContent = "Hello person.";
			requestFeed($Auth.isAuthed().value, handleRes);
		}

	}

	function render(state, header, feed) {
		if(!state || state.status === "unauthorized") {
			
			header.textContent = "First you need to authorize Facebook to allow me \
				to spy on you.";
			header.appendChild(createAuthButton("AUTHORIZE"));
			feed.textContent = "...loading...";

		} else if(state.status ===  "error") {
			
			header.textContent = "It won't work if I can't spy on you.  Are you \
					sure you don't want to authorize it?";
			header.appendChild(createAuthButton("TRY AGAIN"));
			feed.textContent = "...loading...";

		} else if (state.status === "success") {

			feed.textContent = "";
			
			header.textContent = "Hello " + (state.name ? state.name : "Person") + ".";
			var feedEles = state.feed.map(createFeedEle);
			feedEles.forEach(function(ele){
				feed.appendChild(ele);
			});
		}
	}

	function requestFeed(token, callback) {
		var url = "https://graph.facebook.com/v2.10/me?access_token=" + token + 
			"&debug=all&fields=id%2Cname%2Cfeed.limit(20)%7Bcaption%2Cdescription\
			%2Cmessage%2Cname%2Cpicture%2Cstory%2Ctype%7D&format=json&method=get&pretty=0&\
			suppress_http_code=1";
		var req =  new XMLHttpRequest();
		req.open("GET", url);
		req.onreadystatechange = function() {
			if(req.readyState === XMLHttpRequest.DONE) {
				if(req.status === 200) {
					console.log("request complete!");
					callback(req.response);
				} else {
					console.log("request failed!");
					$Auth.expire();
				}
			} else {
				console.log("not done yet!");
			}

		};
		req.send();
	}

	function handleRes(json) {
		var data = JSON.parse(json);
		var feed = data.feed.data.map(function(item) {
			var type = (item.type === "status")? 
				(item.story ?  "event" : "post") :
			  "share";

			switch(type) {
				case "post":
					return {
						id: item.id,
						title: "You posted...",
						type: "post",
						message: item.message
					}
					break;
				case "share":
					return {
						id: item.id,
						type: "share",
						title: item.story,
						message: item.message,
						shareBox: {
							name: item.name,
							description: item.description,
							picture: item.picture
						}
					}
					break;
				case "event":
					return {
						id: item.id,
						type: "event",
						event: item.story
					}
					break;
			}
		});
		updateStore({status: store.status, name:data.name, feed: feed});
	}

	function createAuthButton(buttonText) {
		var button = document.createElement("Button");
		button.onclick = function(){$Auth.gotoAuth();};
		button.value = "authorize";
		button.type = "button";
		button.textContent = buttonText;
		return button;
	}
	function createFeedEle(item) {
		console.log(item);
		var container = document.createElement("div");
		switch(item.type){
			case "post":
				var title = document.createElement("div");
				title.textContent = item.title;
				var message = document.createElement("div");
				message.textContent = item.message;

				container.appendChild(title);
				container.appendChild(message);
				break;
			case "share":
				var title = document.createElement("div");
				title.textContent = item.title;
				
				var message = document.createElement("div");
				message.textContent = item.message;

				var shareBox = document.createElement("div");

				var shareBox_name = document.createElement("div");
				shareBox_name.textContent = item.shareBox.name;

				var shareBox_description = document.createElement("div");
				shareBox_description.textContent = item.shareBox.description;

				var shareBox_image = document.createElement("img");
				shareBox_image.src = item.shareBox.picture;

				shareBox.appendChild(shareBox_name);
				shareBox.appendChild(shareBox_description);
				shareBox.appendChild(shareBox_image);

				container.appendChild(title);
				container.appendChild(message);
				container.appendChild(shareBox);

				break;
			case "event":
				container.innerText = item.event;
				break;
		};
		return container;
	}
})();
