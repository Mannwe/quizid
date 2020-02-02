/**********************************************************************************/
/* Clase encargada de guardar las traducciones 						      		  */
/**********************************************************************************/

function Translation(user, id, language, word, translatedWord){
	this.user = user;
	this.id = id;
	this.language = language;
	this.word = word;
	this.translatedWord = translatedWord;
}