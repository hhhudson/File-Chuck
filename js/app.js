/////////////////////////////////////////////////////
//  Copy and paste me!
/////////////////////////////////////////////////////

;(function($){
	/////////////////////////////////////////////////////
	//  Canvas Operations
	/////////////////////////////////////////////////////
	function setCanvas(input){
		jQuery('#mainCanvas').qrcode({
			text : input
		});
	}
	/////////////////////////////////////////////////////
	//  Main Flow
	/////////////////////////////////////////////////////
	$(window).load(function () {
		$('#sendFile').click(function() {
			$('#modeModal').modal('hide')
			$('#canvasModal').modal('show');
			setCanvas('lol');
		});
		$('#getFile').click(function() {
			$('#modeModal').modal('hide')
			$('#canvasModal').modal('show');
			setCanvas('this is a very very long string this is a very very long string this is a very very long string...1234567!@#$%^&');
			
		});
	});
})(jQuery);