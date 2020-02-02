/**********************************************************************************/
/* Clase que se encarga de controlar el juego								      */
/**********************************************************************************/

'use strict'

var quizController = {
	currentWord: '',
	currentTranslation: '',
	messageOn: false,
	trials: 0,
	success: 0,
	dictionary: [],
	direction: 'Español -> Alemán',
	currentPage: 0,
	numberOfPages: 1,
	pagedDictionary: [],
	query: [],

	// Cargaremos un diccionario temporal del que eliminaremos las palabras ya usadas
	initialize: function(){
		/********************* Firebase *****************************
		quizController.splitDictionaryInPageBlocs(databaseApi.dictionary);
		quizController.setDictionary(databaseApi.dictionary);
		************************************************************/

		let selectedLanguage = $('input[name=filterOptions]:checked').next().text();

		console.log(selectedLanguage);

		//databaseFirestoreApi.getQuery(selectedLanguage);
		databaseFirestoreApi.getDictionary(selectedLanguage);
		quizController.setDictionary(databaseFirestoreApi.dictionary);
		quizController.updatePagination(selectedLanguage);

		if(typeof quizController.dictionary != 'undefined' && 
		   quizController.dictionary != null &&
		   quizController.dictionary.length){
			$('#totalCount').html(quizController.dictionary.length + ' palabras');
		}else{
			$('#totalCount').html('');
		}
		quizController.showRecords()
	},

	// Hacemos el cambio de página
	updatePagination(language){
		quizController.currentPage = 
			Math.ceil((databaseFirestoreApi.totalRecords - databaseFirestoreApi.remainingRecords) /
					   databaseFirestoreApi.batchSize);

		let currentPage = quizController.currentPage + 1;
		let htmlPagination = `Página ${currentPage} de ${databaseFirestoreApi.totalPages}`;
		$('#pagingLabel').html(htmlPagination);
	},

	startGame: function(){
		// Seleccionamos el idioma
		let language = '';
		switch($('#dictionary').children("option:selected").val()){
			case 'Español -> Alemán': 
			case 'Alemán -> Español':
				language = 'Alemán';
			break;
			case 'Español -> Inglés':
			case 'Inglés -> Español':
				language = 'Inglés';
			break;
			case 'Español -> Francés':
			case 'Francés -> Español':
				language = 'Francés';
			break;
		}
		// Inicializamos el diccionario del juego
		databaseFirestoreApi.getDictionary(language);
		//quizController.setDictionary(databaseFirestoreApi.dictionary);
	},

	// Actualizamos el diccionario de quizController
	setDictionary(dictionary){
		quizController.dictionary = [];
		dictionary.forEach(record => {
			quizController.dictionary.push(new Translation(record.user,
														   record.id,
														   record.language,
														   record.word,
														   record.translation));
		});	
	},

	// Actualizamos el diccionario de quizController
	setQuery(query){
		quizController.query = [];
		query.forEach(record => {
			quizController.query.push(new Translation(record.user,
													  record.id,
													  record.language,
													  record.word,
													  record.translation));			
		});	

		// Ajustamos parámetros de paginación
		if(databaseFirestoreApi.totalPages > databaseFirestoreApi.batchSize){			
			databaseFirestoreApi.totalPages = Math.ceil(databaseFirestoreApi.totalRecords / databaseFirestoreApi.batchSize);	
		}
	},

	showNewWord: function(){
		if (quizController.dictionary.length == 0){
			throw 'No hay ningún diccionario cargado en memoria';
		}
		
		let numberOfWords = quizController.dictionary.length;
		let randomIndex = Math.floor(numberOfWords * Math.random());

		// Obtenemos el objeto Translation de la posición al azar generada	
		let translation = quizController.dictionary[randomIndex];

		let direction = $('#dictionary');
		if(direction.children("option:selected").val().indexOf('Alemán') > -1){
			if(direction.children("option:selected").val() == 'Español -> Alemán'){
				quizController.currentWord = translation.word;
				quizController.currentTranslation = translation.translatedWord;			
			}else{
				quizController.currentWord = translation.translatedWord;
				quizController.currentTranslation = translation.word;			
			}
		}
		if(direction.children("option:selected").val().indexOf('Inglés') > -1){
			if(direction.children("option:selected").val() == 'Español -> Inglés'){
				quizController.currentWord = translation.word;
				quizController.currentTranslation = translation.translatedWord;			
			}else{
				quizController.currentWord = translation.translatedWord;
				quizController.currentTranslation = translation.word;			
			}
		}
		if(direction.children("option:selected").val().indexOf('Francés') > -1){
			if(direction.children("option:selected").val() == 'Español -> Francés'){
				quizController.currentWord = translation.word;
				quizController.currentTranslation = translation.translatedWord;			
			}else{
				quizController.currentWord = translation.translatedWord;
				quizController.currentTranslation = translation.word;			
			}
		}

		quizController.direction = $('#dictionary').children("option:selected").val();

		$('.word').each(function(){
			$(this).text(quizController.currentWord);
		});
		$('#trial').focus();
	},

	loadEventHandlers: function(){
		$('#btn-ok').bind('click', quizController.buttonOkHandler);
		$('#btn-ok-sm').bind('click', quizController.buttonOkHandler);

		$('#btn-reset').bind('click',function(){
			quizController.reset();
		});

		$('#btn-reset-sm').bind('click',function(){
			quizController.reset();
		});

		$('#refresh').bind('click',function(){
			quizController.showNewWord();
			quizController.clear();
			$('#dictionary-empty').hide();
		});

		$('#view').bind('click',function(){
			var html = quizController.currentWord + '<span class="text-danger"> (' + quizController.currentTranslation + ')</span>';
			$('.word').each(function(){
				$(this).html(html);
			});
		});
	},

	buttonOkHandler: function(){
		var trial = $('#trial').val();
		quizController.trials++;
		if (quizController.checkCorrectWord(trial)){
			
			soundController.playRightSound();
			let message = $('#message');

			message.removeClass()
				   .addClass('alert')
				   .addClass('alert-success')
				   .addClass('mt-3')
				   .addClass('alert-dismissible')
				   .attr('role','alert')
				   .html(`<h3 class="d-none d-sm-block">¡Correcto!</h3>
				   		  <h6 class="d-block d-sm-none">¡Correcto!</h6>
				   		`);

			message.append(`
				<button type="button" class="close" data-dismiss="alert" aria-label="Close">
				    <span aria-hidden="true">&times;</span>
				</button>`
				);
							 
			quizController.success++;
			quizController.removeWordFromDictionary();

			// Si hemos agotado el diccionario, mostramos un mensaje y volvemos a cargar
			if(quizController.checkDictionaryEmpty()){
				$('#dictionary-empty').show();
				quizController.loadDictionary();
				quizController.trials = 0;
				quizController.success = 0;
			}
		}else{
			soundController.playWrongSound();
			let message = $('#message');

			message.removeClass()
						 .addClass('alert')
						 .addClass('alert-danger')
						 .addClass('mt-3')
						 .addClass('alert-dismissible')
						 .attr('role','alert')
						 .html(`<h3 class="d-none d-sm-block">¡Inténtalo otra vez!</h3>
					   		  	<h6 class="d-block d-sm-none">¡Inténtalo otra vez!</h6>
					   			`);
			message.append(`
				<button type="button" class="close" data-dismiss="alert" aria-label="Close">
				    <span aria-hidden="true">&times;</span>
				</button>`
				);
		}
		quizController.messageOn = true;
		quizController.updateScore();
		$('#trial').focus();
	},

	checkCorrectWord: function(translatedWord){
		return translatedWord == quizController.currentTranslation;
	},

	clear: function(){
		if(quizController.messageOn){
			$('#message').removeClass() // Al no usar parámetros en removeClass, borramos todas las clases
						 .removeAttr('role')
						 .html('');
			quizController.messageOn = false;
		}

		$('#trial').val('');
		$('#trial').focus();
	},
	updateScore: function(){
		var scoreHTML = '';

		if(quizController.success == 0 && quizController.trials == 0)
			scoreHTML = '<strong>Puntuación: </strong>';
		else{
			let percentage = Math.ceil(100 * quizController.success / quizController.trials);
			scoreHTML = '<strong>Puntuación: </strong>' + quizController.success + '/' + quizController.trials;
			scoreHTML += ' (' + percentage + '%)';
		}

		$('.score').each(function(){
			$(this).html(scoreHTML);
		});
	},
	// Eliminamos el elemento del diccionario temporal si se ha acertado
	removeWordFromDictionary: function(){
		var okWord = $('#trial').val();

		if(quizController.direction == 'Español -> Alemán'){
			quizController.dictionary = quizController.dictionary.filter(words => words.translatedWord != okWord);	
		}else{
			quizController.dictionary = quizController.dictionary.filter(words => words.word != okWord);	
		}
	},

	checkDictionaryEmpty: function(){
		return !quizController.dictionary.length;
	},

	reset: function(){
		// Inicializamos todo el entorno
		if(quizController.dictionary.length)
			quizController.dictionary = new Array();

		quizController.success = 0;
		quizController.trials = 0;

		quizController.clear();
		quizController.startGame();
		$('.score').each(function(e){
			$(this).html('');
		});
		$('#origin').val('');
	},

	/******************************************** Funciones CRUD y de base de datos *****************************************/
	saveEventHandler: function(){
		$('#save').click(function(){
			const language = $('#language').val();
			const word = $('#origin').val();
			databaseFirestoreApi.findRecordByWord(language, word)
			.then(querySnapshot => {
				if(querySnapshot.empty){
					quizController.saveRecord();
				}else{
					let message = 'Ya existe esa palabra para el idioma seleccionado.';
					messages.showErrorMessage(message);	
				}
			})
			.catch(error => {
				let message = 'Error al intentar recuperar el registro.';
				messages.showErrorMessage(message);	
			});
			
		});
	},

	saveRecord: function(){
		const user = 'Alberto';
		const language = $('#language');
		const word = $('#origin');
		const translation = $('#translation');

		/* Hemos almacenado el id de registro un campo oculto en caso de
		   que sea edición de un registro existente */
		let id = $('#idRecord');
		if(id.val() == ''){
			let errors = false;
			if(word.val() == ''){
				let message = 'Introduce una palabra en español.';
					messages.showErrorMessage(message);	
				word.select();
				errors = true;
			}
			if(word.val() != '' && translation.val() == ''){
				let message = 'Introduce una traducción.';
					messages.showErrorMessage(message);	
				translation.select();
				errors = true;
			}
			if(!errors){
				let record = {
				    usuario: user,
				    idioma: language.val(),
				    palabra: word.val(),
				    traduccion: translation.val()
				};
				databaseFirestoreApi.createRecord(record)
				.then(() => {
					let message = 'Registro creado con éxito.';
					messages.showSuccessMessage(message);
				})
				.catch(function(error) {
				    let message = 'Error al crear el registro.';
					messages.showErrorMessage(message);	
				});	
				//let selectedLanguage = $('input[name=filterOptions]:checked').next().text();
				quizController.initialize();
				
			}	
		}else{
			databaseFirestoreApi.updateRecord(id,
				{
				    usuario: user,
				    idioma: language.val(),
				    palabra: word.val(),
				    traduccion: translation.val()
				}
			)
			.then(function() {
				let message = 'Registro actualizado con éxito.';
				messages.showSuccessMessage(message);	
		    	//let selectedLanguage = $('input[name=filterOptions]:checked').next().text();
				//databaseFirestoreApi.getQuery(selectedLanguage);	
				quizController.initialize();
			}).catch(function(error) {
			    let message = 'Error al actualizar el registro.';
				messages.showErrorMessage(message);	
			});
		}
		$('#save').html('<i class="fas fa-save"></i> Crear');
		quizController.limpiarPantallaEdicion();
	},

	newEventHandler: function(){
		$('#newRecord').click(function(){
			$('#idRecord').val('');
			$('#save').html('<i class="fas fa-save"></i> Crear');
			$('#validationMessage').html('');	
			quizController.limpiarPantallaEdicion();
			$('#origin').select();
		});
	},

	deleteRecord: function(){
		const id = $(this).attr('id').substring(3);
		databaseFirestoreApi.deleteRecord(id)
		.then(function() {
			let message = 'Registro eliminado con éxito.';
			messages.showSuccessMessage(message);	
	    	//databaseFirestoreApi.getQuery(selectedLanguage);	
			quizController.initialize();
	    	
	    	// Eliminamos la marce de código editándose
	    	$('#idRecord').val('');
			$('#save').html('<i class="fas fa-save"></i> Crear');

			quizController.limpiarPantallaEdicion();
		}).catch(function(error) {
		    let message = 'Error al eliminar el registro.';
			messages.showErrorMessage(message);
		});
	},

	editRecord: function(){
		const id = $(this).attr('id').substring(7);
		databaseFirestoreApi.findRecord(id)
		.then(doc => {
			if(doc.exists){
				let word = $('#origin');
				$('#language').val(doc.data().idioma);
				word.val(doc.data().palabra);
				word.select();
				$('#translation').val(doc.data().traduccion);

				// Dejamos marcado que estamos editando un documento
				$('#idRecord').val(id);
				let message = 'Editando registro...';
				messages.showNeutralMessage(message);
				$('#save').html('<i class="fas fa-edit"></i> Editar');
			}else{
				let message = 'El registro no existe.';
				messages.showErrorMessage(message);	
			}
		})
		.catch(error => {
			let message = 'Error al intentar recuperar el registro.';
			messages.showErrorMessage(message);	
		});
	},

	// Parametrizamos los eventos de los botones borrar/editar de los registros
	recordButonsEventHandler: function(){
		$('body').on('click', '.deleteRecords', quizController.deleteRecord);
		$('body').on('click', '.deleteRecords-sm', quizController.deleteRecord);

		$('body').on('click', '.editRecords', quizController.editRecord);
		$('body').on('click', '.editRecords-sm', quizController.editRecord);
	},

	// Cargamos los eventos de los dos botones de paginación
	paginationEventsHandler: function(){
		$('#nextPage').click(function(e){
			e.preventDefault();
			let current = $(this);
			const id = current.attr('id');
					
			// Sólo paginamos hacia adelante si quedan registros para la página siguiente
			if(databaseFirestoreApi.remainingRecords > databaseFirestoreApi.batchSize){
				let selectedLanguage = $('input[name=filterOptions]:checked').next().text();
				databaseFirestoreApi.getNext(selectedLanguage);				
			}
			return false;
		});

		$('#prevPage').click(function(e){
			e.preventDefault();
			let current = $(this);
			const id = current.attr('id');

			// Sólo paginamos hacia adelante si no hemos llegado al primer registro
			if(quizController.currentPage > 0) {
				let selectedLanguage = $('input[name=filterOptions]:checked').next().text();
				databaseFirestoreApi.getPrevious(selectedLanguage);
			}
			return false;
		});
	},

	showRecords: function(){
		$('#loadingAlert').html('');
		$('#query').html('');
		if(typeof quizController.query != 'undefined' &&
  		   quizController.query != null &&
		   quizController.query.length){
		   	let query =
				`<table class="table table-striped table-dark table-hover table-sm d-none d-sm-table">
					<thead>
						<tr>
							<th>Idioma</th>
							<th>Español</th>
							<th>Traducción</th>
						</tr>
					</thead>
				<tbody>`;
				quizController.query.forEach(record => {
					query += `<tr>
								<td>${record.language}</td>
								<td>${record.word}</td>
								<td>${record.translatedWord}</td>
								<td>
							  	  <button id='del${record.id}' class='btn btn-danger btn-sm deleteRecords detailButton ml-2'><i class="fas fa-trash-alt"></i> Borrar</button>
							  	  <button id='edit${record.id}' class='btn btn-success btn-sm editRecords detailButton'><i class="fas fa-edit"></i> Editar</button>
						  	  	</td>
							 </tr>`;
				});
			query += '</tbody></table>';

			// Añadimos la parte de smartphones
			query += `<table class="table table-striped table-dark table-hover table-sm d-table d-sm-none">
					<thead>
						<tr>
							<th>Español</th>
							<th>Traducción</th>
						</tr>
					</thead>
				<tbody>`;
				quizController.query.forEach(record => {
					query += `<tr>
							  <td>${record.word}</td>
							  <td>${record.translatedWord}</td>
							  <td><button id='del-sm${record.id}' class='btn btn-danger btn-sm deleteRecords-sm detailButton ml-2'><i class="fas fa-trash-alt"></i><span class='d-none d-sm-inline'> Borrar</span></button></td>
							  <td><button id='edit-sm${record.id}' class='btn btn-success btn-sm editRecords-sm detailButton'><i class="fas fa-edit"></i><span class='d-none d-sm-inline'> Editar</span></button></td>
							 </tr>`;
				});
			query += '</tbody></table>';
			$('#query').html(query);	
		}
	},

	setPagination: function(){
		// Si hay más de una página, implementamos los botones de paginación
		let pagination = `
			<div class='col'>
				<nav aria-label="Page navigation">
				  <ul class="pagination">
				    <li id='prevPage' class="page-item">
				      <a class="page-link" href="#" aria-label="Previous">
				        <span aria-hidden="true"><i class="fas fa-angle-left"></i></span>
				        <span class="sr-only">Anteriorr</span>
				      </a>
				    </li>
				    <li id='nextPage' class="page-item">
				      <a class="page-link" href="#" aria-label="Previous">
				        <span aria-hidden="true"><i class="fas fa-angle-right"></i></span>
				        <span class="sr-only">Siguiente</span>
				      </a>
				    </li>
				  </ul>
				</nav>
			</div>
			<div class='col'>
			<span id='pagingLabel' class='text-primary float-right'></span></div>`;			
		$('#pagination').html(pagination);
	},

	filterEventsHandler: function(){
		$('.filterOptions').click(function(){
			let selectedLanguage = $('input[name=filterOptions]:checked').next().text();
			databaseFirestoreApi.getQuery(selectedLanguage);
			//quizController.initialize();			
		});

		$('#dictionary').change(function(){
			//databaseFirestoreApi.getDictionary(language);
			//quizController.initialize();
			quizController.startGame();
		});
	},

	limpiarPantallaEdicion: function(){
		$('#origin').val('');
		$('#translation').val('');
	}
}