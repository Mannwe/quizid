/**********************************************************************************/
/* Clase encargada del CRUD con la base de datos								  */
/**********************************************************************************/
'use strict'

var databaseApi = {

	configuration: null,
	databaseReference: null,
	dictionary: null,
	currentId: '',

	connect: function(){

		// Configuración de la aplicación de Firebase
		databaseApi.configuration = {
		    apiKey: "AIzaSyDTU25NoWJk4LptvxjnTdjiwNFo0jpzL9U",
		    authDomain: "quizidiomas-c3cdd.firebaseapp.com",
		    databaseURL: "https://quizidiomas-c3cdd.firebaseio.com",
		    projectId: "quizidiomas-c3cdd",
		    storageBucket: "quizidiomas-c3cdd.appspot.com",
		    messagingSenderId: "143869458982",
		    appId: "1:143869458982:web:7320e9bbabd9b98e80c4e7"
	  	};
	  	
	  	firebase.initializeApp(databaseApi.configuration);
	  	databaseApi.databaseReference = firebase.database().ref('quiz');
	},

	saveRecord: function(language, word, translation){
		const record = {
			language: language,
			word: word,
			translation: translation
		}
		let recordExists = databaseApi.checkRecordExists();
		if(!recordExists){ // Creamos un nuevo registro
			let vocabulary = databaseApi.databaseReference.push();
			vocabulary.set(record)
				.then(() => {
					databaseApi.loadDatabaseDictionary();
					quizController.initialize();
					quizController.splitDictionaryInPageBlocs();
					let message = 'Registro guardado correctamente.';
					messages.showSuccessMessage(message);					
					databaseApi.currentId = '';
				})
				.catch(() => {
					let message = 'Error al grabar el registro.';
					messages.showErrorMessage(message);	
					databaseApi.currentId = '';
				});	
		}else{ // Modificamos un registro existente
			let keyReference = databaseApi.databaseReference.child(databaseApi.currentId);
			keyReference.set(record)
				.then(() => {
					databaseApi.loadDatabaseDictionary();
					quizController.initialize();
					quizController.splitDictionaryInPageBlocs();
					let message = 'Registro actualizado correctamente.';
					messages.showSuccessMessage(message);					
				})
				.catch(() => {
					let message = 'Error al actualizar.';
					messages.showErrorMessage(message);	
				});	
		}		
	},

	loadDatabaseDictionary: function(){
		// Primero obtenemos el número de registros (nodos hijo de 'quiz')
		databaseApi.databaseReference.once('value')
		.then(snapshot => {
			let totalRecords = snapshot.numChildren();
			if(totalRecords > 0){			
				databaseApi.buildRecordsArray(snapshot);
				quizController.initialize();
				if(databaseApi.dictionary != null){
					// Definimos los eventos de los botones
					$('body').on('click','.editRecords', databaseApi.editRecord);
					$('body').on('click','.deleteRecords', databaseApi.deleteRecord);
				}
			}	
			// Actualizamos datos en quizController y mostramos los registros
			quizController.initialize();
			quizController.splitDictionaryInPageBlocs();
			quizController.showRecords();					
			quizController.paginationEventHandler();
		});
	},

	buildRecordsArray: function(recordset){
		databaseApi.dictionary = [];

		recordset.forEach(snapshot => {
			let record = snapshot.val();
			let key = snapshot.key;
			let recordObject = {
				id: key,
				language: record.language,
				word: record.word,
				translation: record.translation
			};
			databaseApi.dictionary.push(recordObject);
		});
	},

	editRecord: function(){
		const id = $(this).attr('id');
		let currentRecord = null;
		databaseApi.currentId = id.substring(4);
		databaseApi.dictionary.forEach(record => {
			if('edit' + record.id == id){
				currentRecord = record;				
			}
		});
		$('#language').val(currentRecord.language);
		$('#origin').val(currentRecord.word);
		$('#translation').val(currentRecord.translation);
		$('#origin').select();
	},

	deleteRecord: function(){
		const id = $(this).attr('id');
		databaseApi.currentId = id.substring(3);
		if(databaseApi.currentId != ''){
			let recordExists = databaseApi.checkRecordExists();
			if(!recordExists){
				let message = 'Error en el borrado. El registro no existe.';
					messages.showErrorMessage(message);
			}else{
				let keyReference = databaseApi.databaseReference.child(databaseApi.currentId);
				keyReference.remove()
				.then(() =>{
					databaseApi.loadDatabaseDictionary();
					quizController.initialize();
					quizController.splitDictionaryInPageBlocs();
					let message = 'Registro borrado correctamente.';
					messages.showSuccessMessage(message);
				})
				.catch(() => {
					let message = 'Error al borrar el registro.';
					messages.showErrorMessage(message);	
				})
			}
		}
	},

	checkRecordExists: function(){
		let exists = false;
		if(databaseApi.dictionary != null){
			databaseApi.dictionary.forEach(record => {
				if(!exists){
					exists = (record.id == databaseApi.currentId);
				}
			});
		}
		return exists;
	},

	checkWordExists: function(language, word){
		let exists = false;
		if(databaseApi.dictionary != null){
			databaseApi.dictionary.forEach(record => {
				if(!exists){
					exists = (record.language == language &&
							  record.word == word);
				}
			});
		}
		return exists;	
	},

	loadFile: function(recordsArray){
		return new Promise((resolve, reject) => {
			recordsArray.forEach(record => {
				databaseApi.loadRecord(record.language,
									   record.word,
									   record.translatedWord)
				.catch(message =>{
					return reject(message);
				});
			});
			return resolve('Carga realizada correctamente correctamente.');
		});		
	},

	loadRecord: function(language, word, translation){
		const record = {
			language: language,
			word: word,
			translation: translation
		}
		return new Promise((resolve, reject) =>{
			let recordExists = databaseApi.checkWordExists(language, word);
			// Sólo creamos nuevos registros. Si uno ya está creado, no se cambia
			if(!recordExists){ 
				let vocabulary = databaseApi.databaseReference.push();
				vocabulary.set(record)
				.then(() =>{
					databaseApi.currentId = '';
					// Si todo ha ido bien agregamos la nueva palabra al diccionario
					quizController.initialize();
				})
				.catch(() => {
					return reject('Se han producido errores en la carga.');
				});	
			}		
		});
	},

	// Se deja preparado por si algún día se hace
	backupDatabase: function(){
		return null;
	},

	// Se deja preparado por si algún día se hace
	restoreBackup: function(databaseBackup){

	}
}