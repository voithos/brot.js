(function() {
    'use strict';

    var _ = require('./polyfills');
    var Buddhabrot = require('./buddhabrot');

    var setupCanvas = function() {
        var canvas = document.getElementById('main');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        return canvas;
    };

    var setupGUI = function(buddha, config) {
        var gui = new dat.GUI();

        var coreFolder = gui.addFolder('Core');

        // Create fake listener on local config object to simulate
        // a logarithmic scale for the purposes of maxEscapeIter
        var escapeCtrl = coreFolder.add(config, 'maxEscapeIter', 1, 30);
        escapeCtrl.onChange(function(value) {
            value = (Math.pow(2, value / 2) + 2) | 0;
            buddha.config.maxEscapeIter = value;
        });

        coreFolder.add(buddha.config, 'batchSize', 1000, 100000);
        coreFolder.add(buddha.config, 'anti');
        coreFolder.add(buddha, 'resetImage');
        coreFolder.open();

        var colorFolder = gui.addFolder('Color');
        colorFolder.add(config, 'red', 0, 255);
        colorFolder.add(config, 'green', 0, 255);
        colorFolder.add(config, 'blue', 0, 255);
        colorFolder.add(config, 'alpha', 0, 255);

        return gui;
    };

    var createDrawHandler = function(canvas, buddha, config) {
        var ctx = canvas.getContext('2d');
        var imageData = ctx.createImageData(canvas.width, canvas.height);

        var draw = function() {
            if (!buddha.complete) {
                requestAnimationFrame(draw);
            } else {
                console.log('complete');
            }
            var image = buddha.getImage();

            if (image) {
                var pixels = imageData.data;
                var len = imageData.width * imageData.height;

                for (var i = 0; i < len; i++) {
                    var idx = i * 4;
                    pixels[idx] = config.red * image[i];
                    pixels[idx+1] = config.green * image[i];
                    pixels[idx+2] = config.blue * image[i];
                    pixels[idx+3] = config.alpha;
                }

                ctx.putImageData(imageData, 0, 0);
            }
        };

        return draw;
    };

    window.onload = function() {
        var canvas = setupCanvas();

        var buddha = new Buddhabrot({
            width: canvas.width,
            height: canvas.height,
            batched: true,
            infinite: true
        });

        var config = {
            // 8.4 is roughly 1/2 * log[base2](20), which is the default maxIter
            // See the setupGUI function for the logarithm emulation function
            maxEscapeIter: 8.6,

            // Cyan
            red: 0,
            green: 255,
            blue: 255,
            alpha: 255
        };

        var gui = setupGUI(buddha, config);

        var draw = createDrawHandler(canvas, buddha, config);

        // Begin animations
        buddha.run();
        requestAnimationFrame(draw);
    };
})();
