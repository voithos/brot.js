(function($) {
    'use strict';

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
        var buddha = new Buddhabrot(width, height);
        var image = buddha.run();

        var imageData = ctx.createImageData(canvas.width, canvas.height);
        var pixels = imageData.data;
        var length = imageData.width * imageData.height;

        for (var i = 0; i < length; i++) {
            var idx = i * 4;
            pixels[idx] = 255 * image[i];
            pixels[idx+1] = 255 * image[i];
            pixels[idx+2] = 255 * image[i];
            pixels[idx+3] = 255;
        }

        // Redraw
        ctx.putImageData(imageData, 0, 0);
    });
})(jQuery);
