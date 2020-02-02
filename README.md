# Welcome to QuizId


<b>Description</b>

This is a simple quiz game to test vocabulary knowledge of English, French and German from Spanish. It´s made with Firestore as
database and hosting, so it would be possible to play with it from everywhere. Moreover, it has a responsive design, so that it
could be used from an smartphone, iPhone, Tablet, etc. I made this game to sharp my programming skills of Javascript technology.

<b>How to deploy it</b>

I do not provide the connection configuration, as this is private data from my Google Firestore hosting. If you want to replicate
this application and then create a new copy for you to test and play you have to create a new free Firestore hosting and configure
the application to work with it. So that you downloand and unpack the zip file in your computer. Then you should create a new file 
called dbConnection.js within app foulder. This file would contain the followin code:

var dbConnection = {
	database: null,
	connect: function(){
		firebase.initializeApp({
		  	apiKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
		  	authDomain: "quizid-YYYY.firebaseapp.com",
		  	projectId: "quizid-YYYY",
		});

		dbConnection.database = firebase.firestore();
	}
}

To set up your hosting please follow the excellent Get Started provided by Google: 
https://firebase.google.com/docs/hosting/quickstart?hl=en

<b>How to use it</b>

It is a game made it for Spanish speakers, or for people that can speak Spanish and want to learn another language (French, English
or German). I wanted to make an application for my family to test their language skills, and know it´s public mainly to share my
code to the commuity. Maybe it will help you if you want to create your own quiz app!

You have two views: the Game and the Vocabulary screen.

* Vocabulary screen: here you can create, read, edit and delete words to populate your own dictionary. 
* Game screen: You can select the language and try a translation. You also have a counter to give you your % of success.

<b>Final considerations</b>

This app belongs to the set of software made to learn web programming skills. Although I am a professional developer, web applications
are still a hobby. So, I am currently learning, any comments and improvement ideas will be welcome!

Enjoy!
