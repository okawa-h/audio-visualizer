(function($) {

	var _$win,_canvas,_ctx,_audioCtx,_analyser,_source,_animationFrame;

	$(function() {

		_$win   = $(window);
		_canvas = $('#canvas').get(0);
		_ctx    = _canvas.getContext('2d');
		_audioCtx = new AudioContext();

		$('#fileinput').on('change',onChange);
		$('[data-js]').on('click',onClick);
		_$win.on('resize',onResize).trigger('resize');

	});

	function onClick(event) {

		switch($(event.target).data('js')) {
			case'play':play();
			case'stop':stop();
		}

	}

	function onResize() {

		_canvas.width  = _$win.width();
		_canvas.height = _$win.height();
		setup();

	}

	function onChange(event) {

		var fileReader = new FileReader();
		fileReader.onload = onLoaded;
		fileReader.readAsArrayBuffer(event.target.files[0]);

	}

	function onLoaded() {

		_audioCtx.decodeAudioData(this.result, function(buffer) {

			_analyser = _audioCtx.createAnalyser();
			_analyser.fftSize = 2048;

			_source = _audioCtx.createBufferSource();
			_source.buffer = buffer;
			_source.connect(_audioCtx.destination);
			_source.connect(_analyser);
			　
			_source.start(0);
			start();

		});

	}

	function play() {

		_source.start(_audioCtx.currentTime);
		_animationFrame = requestAnimationFrame(update);

	}

	function stop() {

		_source.stop();
		cancelAnimationFrame(_animationFrame);

	}

	function start() {

		update();

		var timer = function() {

			_isWave = (.5 < Math.random());
			setTimeout(timer, Math.random() * 1000);

		}

		timer();


	}

	_isWave = true;

	function update() {

		var dataArray = new Uint8Array(_analyser.fftSize);
		_analyser.getByteTimeDomainData(dataArray);

		if (_isWave) {
			drawWave(dataArray);
		} else {
			draw(dataArray);
		}
		
		_animationFrame = requestAnimationFrame(update);

	}

	function setup() {

		var width  = _canvas.width;
		var height = _canvas.height;

		_ctx.fillRect(0,0,width,height);

		_ctx.lineWidth = 2;
		_ctx.strokeStyle = 'rgb(255, 255, 255)';
		_ctx.beginPath();
		_ctx.moveTo(0,height * .5);
		_ctx.lineTo(width,height * .5);
		_ctx.stroke();

	}

	function drawWave(dataArray) {

		var padding = 40;
		var width   = _canvas.width;
		var height  = _canvas.height;
		var centerH = height * .5;
		var sliceWidth = width / _analyser.fftSize;
		sliceWidth = 1;

		_ctx.fillStyle = 'rgb(0, 0, 0)';
		_ctx.fillRect(0,0,width,height);

		_ctx.lineWidth = 2;
		_ctx.strokeStyle = 'rgb(255, 255, 255)';
		_ctx.beginPath();
		_ctx.moveTo(0,centerH);
		_ctx.lineTo(padding,centerH);

		for (var i = 0; i < _analyser.fftSize; i++) {

			var x = sliceWidth * i;
			var v = dataArray[i] / 128;
			var y = v * centerH;

			if (x < padding) continue;
			if (width - padding < x) break;

			_ctx.lineTo(x, y);

		}

		_ctx.lineTo(width - padding,centerH);
		_ctx.lineTo(width,centerH);
		_ctx.stroke();
		console.log(dataArray);

	}


	function draw(dataArray) {

		var canvasW = _canvas.width;
		var canvasH = _canvas.height;
		var freqs   = new Uint8Array(_analyser.frequencyBinCount);

		_analyser.smoothingTimeConstant = .5;
		_analyser.getByteFrequencyData(freqs);
		// _ctx.globalCompositeOperation = 'destination-out';
		_ctx.fillStyle = 'rgb(0, 0, 0)';
		_ctx.fillRect(0, 0, canvasW, canvasH);
		// _ctx.globalCompositeOperation = 'source-over';

		var barWidth,
		spacerWidth,
		height, hue;

		for (var i = 0; i < 128; ++i) {

			barWidth = canvasW / 128 / 2;
			spacerWidth = barWidth * 2;
			height = freqs[i] - 160;
			hue = i / 128 * 360;

			_ctx.fillStyle = 'rgb(255,255,255)';
			// _ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';

			if (height > 40) {
				_ctx.fillRect(i * spacerWidth, canvasH, barWidth, -height * 5);
			}
			if (height > 35) {
				_ctx.fillRect(i * spacerWidth, canvasH, barWidth, -height * 4);
			}
			if (height > 0) {
				_ctx.fillRect(i * spacerWidth, canvasH, barWidth, -height * 3);
			}
			if (height < 0) {
				_ctx.fillRect(i * spacerWidth, canvasH, barWidth, -rand(1, 5));
			}

		}

		for (var i = 0; i < _analyser.frequencyBinCount; ++i) {

			barWidth = canvasW / _analyser.frequencyBinCount;
			height = freqs[i];
			hue = i / _analyser.frequencyBinCount * 360;

			_ctx.fillStyle = 'rgb(255,255,255)';
			// _ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
			_ctx.fillRect(i * barWidth, canvasH / 2, barWidth, -height);

		}

	}

	var rand = function (min, max) {

		return Math.random() * (max - min) + min;

	};


})(jQuery);
