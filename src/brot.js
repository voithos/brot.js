(function($) {
    'use strict';

    /**
     * requestAnimationFrame polyfill
     */
    (function() {
        var lastTime = 0,
            vendors = ['ms', 'moz', 'webkit', 'o'],
            i;

        for (i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
            window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] ||
                                          window[vendors[i] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    })();

    var Buddhabrot = require('./buddhabrot');

    $(document).ready(function() {
        // Setup the canvas
        var canvas = document.getElementById('main');
        canvas.width = (window.innerWidth * 0.8) | 0;
        canvas.height = (window.innerHeight * 0.8) | 0;

        var width = canvas.width,
            height = canvas.height;

        // Extract 2d context
        var ctx = canvas.getContext('2d');

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
                var imageData = ctx.createImageData(canvas.width, canvas.height);
                var pixels = imageData.data;
                var length = imageData.width * imageData.height;

                for (var i = 0; i < length; i++) {
                    var idx = i * 4;
                    // pixels[idx] = 255 * image[i];
                    pixels[idx+1] = 255 * image[i];
                    pixels[idx+2] = 255 * image[i];
                    pixels[idx+3] = 255;
                }

                ctx.putImageData(imageData, 0, 0);
            }
        };

        buddha.run(redraw);
        requestAnimationFrame(redraw);
    });
})(jQuery);
