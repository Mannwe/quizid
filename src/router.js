/*******************************************************************************/
/* Clase que enruta las diferentes páginas de la aplicación                    */    
/*******************************************************************************/

var router = {
	loadRouter: function(){
		$(window).bind('hashchange', function (){
			let uri = !location.href ? 'main' : location.hash.replace('#', '');

			if(location.hash == '') uri = 'main';
			$('#' + uri).show().siblings().hide();

			if(uri == 'vocabulary'){
				databaseFirestoreApi.getQuery('Alemán'); // Consulta por defecto
			}else if(uri == 'quiz'){
				quizController.startGame();				
			}

		}).trigger('hashchange');
	}
}