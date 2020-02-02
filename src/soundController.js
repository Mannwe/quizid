/*******************************************************************************/
/*  Clase encargada de gestionar los sonidos del juego			               */
/*******************************************************************************/

var soundController = {
    rightWordAudioElement: null,
    wrongWordAudioElement: null,
	setUpGameMusic: function(){
        soundController.rightWordAudioElement = document.createElement('audio');
        soundController.rightWordAudioElement.setAttribute('src', 'assets/right.wav'); // Freesound: Bertrof - https://freesound.org/people/Bertrof/sounds/131660/
        soundController.rightWordAudioElement.volume = 0.4;
        
        soundController.wrongWordAudioElement = document.createElement('audio');
        soundController.wrongWordAudioElement.setAttribute('src', 'assets/wrong.mp3'); // Freesound: Raclure - https://freesound.org/people/Raclure/sounds/483598/
        soundController.wrongWordAudioElement.volume = 0.4;
    },
    playRightSound: function(){
        soundController.rightWordAudioElement.play();
    },
    playWrongSound: function(){
        soundController.wrongWordAudioElement.play();
    }
}