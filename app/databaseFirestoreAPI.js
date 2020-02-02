 /**********************************************************************************/
/* Clase encargada del CRUD con la base de datos Firestore						  */
/**********************************************************************************/

var databaseFirestoreApi = {
	query: [],
	batchSize: 5,
	lastRecord: 0,
	firstRecord: 0,
	totalRecords: 0,
	remainingRecords: 0,
	totalPages: 0,
	dictionary: [],

	/********************** Métodos de actualización de la base de datos **********************/
	createRecord: function(record){
		/* Devolvemos el resultado del método add, que es una promesa que trataremos
		   desde el cliente */
		return dbConnection.database.collection("diccionario").add(record);		
	},

	updateRecord: function(id, record){
		return dbConnection.database.collection("diccionario").doc(id.val()).update(record);
	},

	deleteRecord: function(id){
		/* Devolvemos el resultado del método delete, que es una promesa que trataremos
		   desde el cliente */
		return dbConnection.database.collection("diccionario").doc(id).delete();		
	},

	/************************* Métodos de consulta de la base de datos ************************/
	getQuery: function(language){
		dbConnection.database.collection("diccionario")
		.orderBy('palabra')
		.limit(databaseFirestoreApi.batchSize)
		.where('idioma', '==', language)
		.get()
		.then(querySnapshot => {
			databaseFirestoreApi.query = []; // Tenemos que inicializar por el onSnapshot
			querySnapshot.forEach(snapshot => {
			    let record = {
		        	id: snapshot.id,
				    user: snapshot.data().usuario,
				    language: snapshot.data().idioma,
				    word: snapshot.data().palabra,
				    translation: snapshot.data().traduccion
				}
				databaseFirestoreApi.query.push(record);
			});			

			// Nos guardaremos el primer y último registro
			databaseFirestoreApi.lastRecord = querySnapshot.docs[querySnapshot.docs.length - 1];				
			databaseFirestoreApi.firstRecord = querySnapshot.docs[0]; 
			databaseFirestoreApi.firstRecordPreviousPage = querySnapshot.docs[0]; 

			/* Paralelamente a obtnener los primeros n registros para mostrar,
	    	   buscamos los datos de paginación (última págian, número de páginas...) */
	    	databaseFirestoreApi.getPaginationData(language);
	    });    
	},

	getDictionary: function(language){
		dbConnection.database.collection("diccionario")
		.where('idioma', '==', language)
		.get()
		.then(querySnapshot => {
			databaseFirestoreApi.dictionary = []; // Tenemos que inicializar por el onSnapshot
			querySnapshot.forEach(snapshot => {
			    let record = {
		        	id: snapshot.id,
				    user: snapshot.data().usuario,
				    language: snapshot.data().idioma,
				    word: snapshot.data().palabra,
				    translation: snapshot.data().traduccion
				}
				databaseFirestoreApi.dictionary.push(record);
			});	
			quizController.setQuery(databaseFirestoreApi.query);	
			quizController.setDictionary(databaseFirestoreApi.dictionary);	
	    });	    
	},

	// Actualiza todas las variables de paginación
	getPaginationData:function(language){
		dbConnection.database.collection("diccionario")
		.where('idioma', '==', language)
		.get()
		.then(result =>{
			// Recopilamos los datos de paginación y totales de nuestra base de datos
			databaseFirestoreApi.totalRecords = result.size;
			databaseFirestoreApi.remainingRecords = databaseFirestoreApi.totalRecords;
			databaseFirestoreApi.totalPages = Math.ceil(databaseFirestoreApi.totalRecords / databaseFirestoreApi.batchSize);

			// Lanzamos la query
			//quizController.paginationEventHandler();
			quizController.setQuery(databaseFirestoreApi.query);
			quizController.initialize();
			quizController.showRecords();			
		});	    
	},

	getNext: function(language){
		dbConnection.database.collection("diccionario")
		.orderBy('palabra')
		.startAfter(databaseFirestoreApi.lastRecord)
		.limit(databaseFirestoreApi.batchSize)
		.where('idioma', '==', language)
		.get()
		.then(querySnapshot => {
			if(!querySnapshot.empty){
				databaseFirestoreApi.query = [];
				querySnapshot.forEach(snapshot => {
					let record = {
			        	id: snapshot.id,
					    user: snapshot.data().usuario,
					    language: snapshot.data().idioma,
					    word: snapshot.data().palabra,
					    translation: snapshot.data().traduccion
					}							
					databaseFirestoreApi.query.push(record);		
				});
				
				// Disminuimos el número de registros restantes en el número de registros reales de la página	
				if(querySnapshot.size < databaseFirestoreApi.batchSize){
					databaseFirestoreApi.remainingRecords = querySnapshot.size;
				}else{
					databaseFirestoreApi.remainingRecords = databaseFirestoreApi.remainingRecords - databaseFirestoreApi.batchSize;
				}

				// Nos guardaremos el primer y último registro
				databaseFirestoreApi.lastRecord = querySnapshot.docs[querySnapshot.docs.length - 1];
				databaseFirestoreApi.firstRecord = querySnapshot.docs[0]; 	

				// Lanzamos la query
				quizController.setQuery(databaseFirestoreApi.query); // Le indicamos al diccionario los cambios
				quizController.updatePagination(language);
				quizController.showRecords();
			}
	    });
	},

	getPrevious: function(language){
		dbConnection.database.collection("diccionario")
		.orderBy('palabra')
		.endBefore(databaseFirestoreApi.firstRecord)
		.limitToLast(databaseFirestoreApi.batchSize)
		.where('idioma', '==', language)
		.get()
		.then(querySnapshot => {
			databaseFirestoreApi.query = [];
		    querySnapshot.forEach(snapshot => {
		    	let record = {
		        	id: snapshot.id,
				    user: snapshot.data().usuario,
				    language: snapshot.data().idioma,
				    word: snapshot.data().palabra,
				    translation: snapshot.data().traduccion
				}
				databaseFirestoreApi.query.push(record);
			});
			// Aumentamos el número de registros restantes en el total por página
			if(databaseFirestoreApi.remainingRecords >= databaseFirestoreApi.totalRecords){
				databaseFirestoreApi.remainingRecords = databaseFirestoreApi.totalRecords;
			}else{
				databaseFirestoreApi.remainingRecords = databaseFirestoreApi.remainingRecords + querySnapshot.size;
			}

			// Nos guardaremos el primer y último registro
			databaseFirestoreApi.lastRecord = querySnapshot.docs[querySnapshot.docs.length - 1];				
			databaseFirestoreApi.firstRecord = querySnapshot.docs[0]; 

			// Lanzamos la query
			quizController.setQuery(databaseFirestoreApi.query); // Le indicamos al diccionario los cambios
			quizController.updatePagination(language);
			quizController.showRecords();
	    });
	},

	findRecord: function(id){
		/* Devolvemos el resultado del método get, que es una promesa que trataremos
		   desde el cliente */
		return dbConnection.database.collection("diccionario").doc(id).get();		
	},

	findRecordByWord: function(language, word){
		return dbConnection.database.collection("diccionario")
				.where('idioma', '==', language)
				.where('palabra', '==', word)
				.get();
	}
}