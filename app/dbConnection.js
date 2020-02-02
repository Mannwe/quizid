var dbConnection = {
	database: null,
	connect: function(){
		firebase.initializeApp({
		  	apiKey: "AIzaSyAbg929xT3Vq9NpXM8YbyxEAmE35bhR-vc",
		  	authDomain: "quizid-2663c.firebaseapp.com",
		  	projectId: "quizid-2663c",
		});

		dbConnection.database = firebase.firestore();
	}
}