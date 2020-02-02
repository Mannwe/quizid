/**********************************************************************************/
/* Clase encargada mostrar los mensajes de notificaciones  					      */
/**********************************************************************************/

var messages = {
	htmlMessage: '',

	buildSuccessMessageAlert: function(message){
		messages.htmlMessage = `
			<div class='alert alert-success alert-dismissible fade show mt-3' role='alert'>
				${message}
				<button type="button" class="close" data-dismiss="alert" aria-label="Close">
				    <span aria-hidden="true">&times;</span>
				</button>
			</div>
		`;
	},

	buildErrorMessageAlert: function(message){
		messages.htmlMessage = `
			<div class='alert alert-danger alert-dismissible fade show mt-3' role='alert'>
				${message}
				<button type="button" class="close" data-dismiss="alert" aria-label="Close">
				    <span aria-hidden="true">&times;</span>
				</button>
			</div>
		`;
	},

	showSuccessMessage: function(message){
		messages.buildSuccessMessageAlert(message);
		$('#validationMessage').html(messages.htmlMessage);
	},

	showErrorMessage: function(message){
		messages.buildErrorMessageAlert(message);
		$('#validationMessage').html(messages.htmlMessage);
	},

	showLoadingSuccessMessage: function(message){
		messages.buildSuccessMessageAlert(message);
		$('#loadingAlert').html(messages.htmlMessage);
	},

	showLoadingErrorMessage: function(message){
		messages.buildErrorMessageAlert(message);
		$('#loadingAlert').html(messages.htmlMessage);
	},

	showNeutralMessage: function(message){
		messages.htmlMessage = `
			<div class='alert alert-warning alert-dismissible fade show mt-3' role='alert'>
				${message}
				<button type="button" class="close" data-dismiss="alert" aria-label="Close">
				    <span aria-hidden="true">&times;</span>
				</button>
			</div>
		`;
		$('#validationMessage').html(messages.htmlMessage);
	}
}