

;(function($){
	var mainCanvas = $('#mainCanvas');
	//var ctx = document.getElementById('mainCanvas').getContext('2d');
	
	var webcamVideo = document.getElementById('webcamVideo');
	var localMediaStream = null;
	
	var webcamCanvas = document.getElementById('webcamCanvas');
	
	
	
	/////////////////////////////////////////////////////
	//  Misc Operations
	/////////////////////////////////////////////////////
	
	function addError(title, body) {
		$('#modeModal').modal('hide');
		$('#canvasModal').modal('hide');
		$('#alerts').append('<div class="alert alert-block alert-error"><h4>'+title+'</h4>'+body+'</div>');
	}
	
	/////////////////////////////////////////////////////
	//  Canvas Operations
	/////////////////////////////////////////////////////
	function setCanvas(input){
		mainCanvas.qrcode({
			text : input,
			width: 512,
			height: 512,
		});
	}
	
	/////////////////////////////////////////////////////
	//  getUserMedia Operations
	/////////////////////////////////////////////////////
	
	function testGetUserMedia() {
		// Opera is unprefixed.
		if (!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)) {
			addError('Unsupported Browser', 'Your browser doesn\'t seem to support getUserMedia, which is used to read data from your webcam. Try an up-to-date version of Firefox, Opera or Chrome instead!');
		}
	}
	
	function enableWebcamStream(videoDomElement) {
		videoDomElement.autoplay = true;
		var getUserMedia = (
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.oGetUserMedia ||
			navigator.msieGetUserMedia ||
			false
		);
		var onStream = function(stream) {
			try {
				/**
				* Chrome / Opera
				*/
				videoDomElement.src = ( window.URL || window.webkitURL ).createObjectURL( stream );
			} catch( e ) {
				/**
				* Firefox
				*/
				if( videoDomElement.srcObject ) {
					videoDomElement.srcObject = stream;
				} else {
					videoDomElement.mozSrcObject = stream;
				}
				videoDomElement.play();
			}
		};
		var onError = function(error) {
			throw error;
		};
		if(getUserMedia) {
			getUserMedia.call(navigator, {"video" : true }, onStream, onError);
		}
	};
	
	function initVideoStream() {
		try {
			
			enableWebcamStream(webcamVideo);
			
			webcamVideo.addEventListener('loadeddata', function(){
				webcamCanvas.width=Math.floor(webcamVideo.videoWidth/2);
				webcamCanvas.height=Math.floor(webcamVideo.videoHeight/2);
				
				window.setInterval(decodeFromVideo,100);
				
				
				
			});
			
		} catch(e) {
			addError('Could not read from webcam', 'Hm. We can\'t seem to access your webcam. Please try reloading the page and approving the request at the top of this window for webcam access, or try this page in an up-to-date version of Firefox, Opera or Chrome instead!');
		}
	}
	
	function decodeFromVideo() {
		webcamCanvas.getContext('2d').drawImage(webcamVideo,0,0,webcamCanvas.width,webcamCanvas.height);
		//qrcode.decode(webcamCanvas.getContext('2d').getImageData(0,0,webcamCanvas.width,webcamCanvas.height));
		qrcode.decode(webcamCanvas.toDataURL());
		
	}
	
	/////////////////////////////////////////////////////
	//  Decode Operations
	/////////////////////////////////////////////////////
	
	function decodeQR() {
		qrcode.decode("screen.png");
	}
	
	function showInfo(data) {
		if (data != "error decoding QR Code") {
			console.log(data);
		}
	}
	
	/////////////////////////////////////////////////////
	//  Main Flow
	/////////////////////////////////////////////////////
	$(window).load(function () {
		
		testGetUserMedia();
		qrcode.callback = showInfo;
		
		$('#sendFile').click(function() {
			$('#modeModal').modal('hide')
			$('#canvasModal').modal('show');
			
			var start = new Date().getTime();
			for (i = 0; i < 1000; ++i) {
				setCanvas('this is a very very long string');
			}
			var end = new Date().getTime();
			var time = end - start;
			alert('Execution time: ' + time);
			
		});
		$('#getFile').click(function() {
			$('#modeModal').modal('hide')
			$('#canvasModal').modal('show');
			initVideoStream();
			//decodeQR();
		});
	});
})(jQuery);