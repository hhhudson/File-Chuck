

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
	//  getUserMedia Operations
	/////////////////////////////////////////////////////
	
	function hasGetUserMedia() {
		// Opera is unprefixed.
		return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	}
	
	/////////////////////////////////////////////////////
	//  Decode Operations
	/////////////////////////////////////////////////////
	
	function decodeQR() {
		qrcode.decode("qr.jpg")
	}
	
	function showInfo(data) {
		alert(data);
	}
	
	/////////////////////////////////////////////////////
	//  Main Flow
	/////////////////////////////////////////////////////
	$(window).load(function () {
		
		qrcode.callback = showInfo;
		
		$('#sendFile').click(function() {
			$('#modeModal').modal('hide')
			$('#canvasModal').modal('show');
			
			var start = new Date().getTime();
			for (i = 0; i < 100; ++i) {
				setCanvas('this is a very very long string');
			}
			var end = new Date().getTime();
			var time = end - start;
			alert('Execution time: ' + time);
			
		});
		$('#getFile').click(function() {
			$('#modeModal').modal('hide')
			$('#canvasModal').modal('show');
			decodeQR();
		});
	});
})(jQuery);