/**********************************************************************************/
/* Clase inicializa el código Javascript   									      */
/**********************************************************************************/

'use strict'

$('#dictionary-empty').hide();

$(document).ready(function(){

	/* Ocultamos el botón de jugar en la selección del archivo para mostrarlo
	   una vez seleccionemos uno */
	$('#play').hide();

	// Permitimos tooltips en todo el documento
	$(function () {
	  	$('[data-toggle="tooltip"]').tooltip();
	});

	dbConnection.connect();
	//databaseFirestoreApi.getDictionary('Alemán'); // Obtenemos todas las palabras para jugar
	//databaseFirestoreApi.getQuery('Alemán'); // Consulta por defecto
	quizController.initialize();

	/*serialization.setup();*/
	quizController.setPagination();
	quizController.loadEventHandlers();	
	quizController.saveEventHandler();
	quizController.newEventHandler();
	quizController.recordButonsEventHandler();
	//quizController.fileSelectionEventHandler();
	quizController.filterEventsHandler();
	quizController.paginationEventsHandler();
	soundController.setUpGameMusic();
	
	router.loadRouter(); // Lanzamos el router que ocultará las páginas distintas a la seleccionada

});