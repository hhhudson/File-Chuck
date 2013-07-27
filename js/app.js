

;(function($){
	var mainCanvas = $('#mainCanvas');
	//var ctx = document.getElementById('mainCanvas').getContext('2d');
	
	var webcamVideo = document.getElementById('webcamVideo');
	var localMediaStream = null;
	
	var webcamCanvas = document.getElementById('webcamCanvas');
	
	var stage = 0;
	var role = '';
	var loop;
	var length = 8;
	var lengthLastUpdate = 9007199254740992; //Max int in JS
	
	var lastRead = '';
	
	/////////////////////////////////////////////////////
	//  Misc Operations
	/////////////////////////////////////////////////////
	
	function addError(title, body) {
		$('#modeModal').modal('hide');
		$('#canvasModal').modal('hide');
		$('#alerts').append('<div class="alert alert-block alert-error"><h4>'+title+'</h4>'+body+'</div>');
		window.clearInterval(loop)
	}
	
	canvasTitle = $('#canvasTitle');
	function notify(message) {
		//alert(message);//chage to something more subtle later...
		canvasTitle.text(message);
	}
	function padInt(input, targetLength) {
		var inputStr = input+"";
		while (inputStr.length < targetLength) {
			inputStr = "0" + inputStr;
		};
		return inputStr;
	}
	
	
	/////////////////////////////////////////////////////
	//  Canvas Operations
	/////////////////////////////////////////////////////
	
	function setQR(input) {
		mainCanvas.qrcode({
			text : input,
			width: 512,
			height: 512,
		});
	}
	function senderSetQR(input) {
		if (role == 'SENDER') {
			setQR(input);
		}
	}
	function getterSetQR(input) {
		if (role == 'GETTER') {
			setQR(input);
		}
	}
	
	/////////////////////////////////////////////////////
	//  getUserMedia Operations
	/////////////////////////////////////////////////////
	
	function testFeatureSupport() {
		// Opera is unprefixed.
		if (!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)) {
			addError('Unsupported Browser', 'Your browser doesn\'t seem to support getUserMedia, which is used to read data from your webcam. Try an up-to-date version of Firefox, Opera or Chrome instead!');
		}
		if(typeof(Worker)=="undefined") {
			// No Web Worker support
			addError('Unsupported Browser', 'Darn. Looks like your browser doesn\'t support webWorkers, which are used to improve processing speed. Please try this page in an up-to-date version of Firefox, Opera or Chrome instead!');
		}
	}
	
	function enableWebcamStream(videoDomElement) {
		/*
		 * Shoot. This function should be credited to somebody else. I copied this from somewhere, but I've forgotten from where :(
		 */
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
				webcamCanvas.width=Math.floor(webcamVideo.videoWidth/1);
				webcamCanvas.height=Math.floor(webcamVideo.videoHeight/1);
			});
			
		} catch(e) {
			addError('Could not read from webcam', 'Hm. We can\'t seem to access your webcam. Please try this page in an up-to-date version of Firefox, Opera or Chrome instead!');
		}
	}
	
	
	/////////////////////////////////////////////////////
	//  Decode Operations
	/////////////////////////////////////////////////////
	
	function decodeFromVideo() {
		webcamCanvas.getContext('2d').drawImage(webcamVideo,0,0,webcamCanvas.width,webcamCanvas.height); //copy video to canvas
		qrcode.decode(webcamCanvas.toDataURL()); //copy canvas to decoder
	}
	function decodeCallback(data) {
		lastRead = data;
	}
	function onDetect(trigger, advanceStage, callback, arg) {
		decodeFromVideo();
		if (lastRead == trigger) {
			if (advanceStage) {
				stage += 1;
			}
			callback(arg);
		}
	}
	function senderOnDetect(trigger, advanceStage, callback, arg) {
		if (role == 'SENDER') {
			onDetect(trigger, advanceStage, callback, arg);
		}
	}
	function getterOnDetect(trigger, advanceStage, callback, arg) {
		if (role == 'GETTER') {
			onDetect(trigger, advanceStage, callback, arg);
		}
	}
	
	function senderDetectResOK() {
		if (role == 'SENDER') {
			var currentTime = new Date().getTime();
			decodeFromVideo();
			if (lastRead.substring(0, 3) == 'ROK') {
				var parsed = parseInt(lastRead.substring(3));
				if (!isNaN(parsed) && parsed>length) {
					length++;
					setQR('ROK'+inputStr(length, length-3));
					lengthLastUpdate = currentTime;
				}
			}
			if(lengthLastUpdate + 10000 < currentTime) { //if no updates in a few seconds,
				length-=1; //switch back a resolution level since this one obviously doesn't work.
				length-=3; //switch back a few more resolution levels for safety.
				stage++; //switch to next stage
			}
		}
	}
	function getterDetectRes() {
		if (role == 'GETTER') {
			var currentTime = new Date().getTime();
			decodeFromVideo();
			if (lastRead.substring(0, 3) == 'RES') {
				var parsed = parseInt(lastRead.substring(3));
				if (!isNaN(parsed)) {
					length = parsed;
					setQR('ROK'+parsed);
					lengthLastUpdate = currentTime;
				}
			}
			if(lengthLastUpdate + 10000 < currentTime) { //if no updates in a few seconds,
				length-=3; //switch back a few resolution levels for safety.
				stage++; //switch to next stage
			}
		}
	}
	
	/////////////////////////////////////////////////////
	//  Main Flow
	/////////////////////////////////////////////////////
	
	function mainLoop() {
		switch(stage) {
		case 1: // Display availability
			notify('Waiting for connection...');
			senderSetQR('SND0.1');
			getterOnDetect('SND0.1', true, setQR, 'GET0.1');
			senderOnDetect('GET0.1', true);
			break;
			
		case 2: // Check for sign of life from other end
			notify('Confirming connection...');
			senderSetQR('SNDRDY');
			getterOnDetect('SNDRDY', true, setQR, 'GETRDY');
			senderOnDetect('GETRDY', true, setQR, 'ROK'+padInt(length, length-3));
			break;
			
		case 3: // Find max working resoulution
			notify('Determining resolution (Checking '+length+')...');
			getterDetectRes();
			senderDetectResOK();
			break;
			
		case 4: // Main send
			notify('Finalized resolution of '+length+'!');
			
			break;
			
		case 5: // Done!
			
			
			break;
			
		case 6: // Clean up, and create file.
			
			
			break;
			
		default:
			addError('Unknown Error', 'Well, that shouldn\'t have happened. Somehow we\'ve hit an invalid state, and I don\'t know what to do. Try again?');
		}
	}
	
	
	$(window).load(function () {
		
		testFeatureSupport();
		qrcode.callback = decodeCallback;
		
		$('#sendFile').click(function() {
			$('#modeModal').modal('hide')
			$('#canvasModal').modal('show');
			
			stage = 1;
			role = 'SENDER';
			loop = setInterval(mainLoop,150);
			initVideoStream();
			setQR('...');
			
		});
		$('#getFile').click(function() {
			$('#modeModal').modal('hide')
			$('#canvasModal').modal('show');
			
			stage = 1;
			role = 'GETTER';
			loop = setInterval(mainLoop,150);
			initVideoStream();
			setQR('...');
			
		});
	});
})(jQuery);