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


    /**
     * BrotJS - the primary controller object
     */
    var BrotJS = function(canvas) {
        this.canvas = canvas;
        this.count = 0;

        this.buddhas = [];
        this.states = [];

        this.setupGUI();
    };

    /**
     * Run the image generation procedure, and begin animations
     */
    BrotJS.prototype.run = function() {
        this.addBuddhabrot();

        this.draw = this.createDrawHandler();
        this.draw();
    };

    /**
     * Add a Buddhabrot layer, with controls
     */
    BrotJS.prototype.addBuddhabrot = function() {
        this.count++;

        var buddha = new Buddhabrot({
            width: this.canvas.width,
            height: this.canvas.height,
            batched: true,
            infinite: true
        });
        this.buddhas.push(buddha);

        var state = {
            paused: false,

            // 8.4 is roughly 1/2 * log[base2](20), which is the default maxIter
            // See the setupGUI function for the logarithm emulation function
            maxEscapeIter: 8.6,

            // Default color
            red: 0,
            green: 255,
            blue: 255,
            alpha: 1
        };
        this.states.push(state);

        this.addToGUI(buddha, state);
        buddha.run();
    };

    BrotJS.prototype.setupGUI = function() {
        this.gui = new dat.GUI();
        this.gui.add(this, 'addBuddhabrot');
    };

    BrotJS.prototype.addToGUI = function(buddha, state) {
        var coreFolder = this.gui.addFolder('Config ' + this.count);

        // Create a 'paused' control on the state that toggles the
        // actual paused status on the Buddhabrot itself
        var pausedCtrl = coreFolder.add(state, 'paused');
        pausedCtrl.onChange(function(paused) {
            if (paused) {
                buddha.pause();
            } else {
                buddha.resume();
            }
        });

        coreFolder.add(buddha, 'resetImage');

        // Create fake listener on local state object to simulate
        // a logarithmic scale for the purposes of maxEscapeIter
        var escapeCtrl = coreFolder.add(state, 'maxEscapeIter', 1, 30);
        escapeCtrl.onChange(function(value) {
            value = (Math.pow(2, value / 2) + 2) | 0;
            buddha.config.maxEscapeIter = value;
        });

        coreFolder.add(buddha.config, 'batchSize', 1000, 100000);
        coreFolder.add(buddha.config, 'anti');
        coreFolder.open();

        var colorFolder = this.gui.addFolder('Color ' + this.count);
        colorFolder.add(state, 'red', 0, 255);
        colorFolder.add(state, 'green', 0, 255);
        colorFolder.add(state, 'blue', 0, 255);
        colorFolder.add(state, 'alpha', 0, 1);
    };

    /**
     * Create and return the draw handler
     */
    BrotJS.prototype.createDrawHandler = function() {
        var self = this;
        var canvas = self.canvas;
        var ctx = canvas.getContext('2d');
        var imageData = ctx.createImageData(canvas.width, canvas.height);

        var getImages = function() {
            var images = [],
                i, image;

            for (i = 0; i < self.count; i++) {
                image = self.buddhas[i].getImage();
                if (image) {
                    images.push(image);
                }
            }
            return images;
        };

        var draw = function() {
            self.requestID = requestAnimationFrame(draw);

            var images = getImages(),
                pixels = imageData.data,
                states = self.states,
                red, green, blue,
                pixLen = imageData.width * imageData.height,
                imgLen = images.length,
                i, j, image, state, alpha;

            // Set each pixel to the current color
            for (i = 0; i < pixLen; i++) {
                var idx = i * 4;
                red = green = blue = 0;

                // Evenly mix the pixel's color from the multiple Buddhabrot images
                for (j = 0; j < imgLen; j++) {
                    image = images[j];
                    state = states[j];
                    alpha = state.alpha;

                    red += state.red * image[i] * alpha;
                    green += state.green * image[i] * alpha;
                    blue += state.blue * image[i] * alpha;
                }

                pixels[idx] = red / imgLen;
                pixels[idx+1] = green / imgLen;
                pixels[idx+2] = blue / imgLen;
                pixels[idx+3] = 255;
            }

            ctx.putImageData(imageData, 0, 0);
        };

        return draw;
    };


    window.onload = function() {
        var canvas = setupCanvas();
        var brot = new BrotJS(canvas);
        brot.run();
    };
})();
                
