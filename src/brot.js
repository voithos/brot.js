(function() {
    'use strict';

    var _ = require('./polyfills');
    var Buddhabrot = require('./buddhabrot');

    window.onload = function() {
        // Setup the canvas
        var canvas = document.getElementById('main');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var width = canvas.width,
            height = canvas.height;

        var ctx = canvas.getContext('2d');
        var imageData = ctx.createImageData(canvas.width, canvas.height);

        // Compute buddhabrot
        var buddha = new Buddhabrot({
            width: width,
            height: height,
            batched: true
        });

        var redraw = function() {
            if (!buddha.complete) {
                requestAnimationFrame(redraw);
            } else {
                console.log('complete');
            }
            var image = buddha.getImage();

            if (image) {
                var pixels = imageData.data;
                var len = imageData.width * imageData.height;

                for (var i = 0; i < len; i++) {
                    var idx = i * 4;
                    // pixels[idx] = 255 * image[i];
                    pixels[idx+1] = 255 * image[i];
                    pixels[idx+2] = 255 * image[i];
                    pixels[idx+3] = 255;
                }

                ctx.putImageData(imageData, 0, 0);
            }
        };

        buddha.run();
        requestAnimationFrame(redraw);
    };
})();
