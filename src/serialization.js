/**********************************************************************************/
/* Clase encargada de grabar y recuperar archivos							      */
/**********************************************************************************/

var serialization = {
	file: '',
	dictionary: [],
	setup: function(){
		// Ponemos a la escucha del evento change (pulsar el botón y abrir el navegador del SO)
		$('#dictionary-file').bind('change', function(){
			serialization.file = this.files[0]; // Sólo seleccionamos un archivo
			if(window.FileReader){
				var reader = new FileReader();
				reader.readAsText(serialization.file);

				reader.onload = function(){
					const fileContent = reader.result;
					serialization.parseFileOutput(fileContent); // Convertimos el contenido del fichero en array

					let ok = databaseFirestoreApi.loadFile(serialization.dictionary)
					.then(message => {
						databaseFirestoreApi.getQuery('Alemán');
						quizController.initialize();
						messages.showLoadingSuccessMessage(message);	
						$('#loadFile').hide();
						$('#play').show();
					})
					.catch(message => {
						messages.showLoadingErrorMessage(message);	
						databaseFirestoreApi.getQuery('Alemán');
						quizController.initialize();
					});
				};
			}else{
				throw "El navegador no soporta la API FileReader";
			}
		});
	},
	// Convertimos la estructura csv del fichero en un array
	parseFileOutput: function(fileContent){

		// Separamos la cadena en un array por líneas
		let rows = fileContent.split('\n');
		while(typeof rows[0] !== 'undefined' || rows[0] == ''){

			// Eliminamos la primera posición (fila) en cada iteración
			// guardando el elemento para convertirlo en un objeto Translation
			let row = rows.shift(); 
			const translationArray = row.split(';');
			let language = translationArray[0];
			let word = translationArray[1];
			let translatedWord = translationArray[2];

			if(language != '' && word != '' && translatedWord != ''){
				// Nos aseguramos de que no queden espacios añadidos accidentalmente
				word = word.trim();
				translatedWord = translatedWord.trim();
				const user = "Alberto";
				const id = ''; // No la sabemos, ya que es un dato que se generará al grabar en la bbdd

				var translation = new Translation(id, user, language, word, translatedWord);
				serialization.dictionary.push(translation);
			}			
		}	
	}
} 