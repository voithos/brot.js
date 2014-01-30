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

        var draw = this.createDrawHandler();
        requestAnimationFrame(draw);
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
            // 8.4 is roughly 1/2 * log[base2](20), which is the default maxIter
            // See the setupGUI function for the logarithm emulation function
            maxEscapeIter: 8.6,

            // Default color
            red: 0,
            green: 255,
            blue: 255,
            alpha: 255
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
        coreFolder.add(buddha, 'pause');
        coreFolder.add(buddha, 'resume');
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
        colorFolder.add(state, 'alpha', 0, 255);
    };

    /**
     * Create and return the draw handler
     */
    BrotJS.prototype.createDrawHandler = function() {
        var self = this;
        var canvas = self.canvas;
        var ctx = canvas.getContext('2d');
        var imageData = ctx.createImageData(canvas.width, canvas.height);

        var components = ['red', 'green', 'blue', 'alpha'];

        var areComplete = function() {
            var complete = true;
            for (var i = 0; i < self.count; i++) {
                if (!self.buddhas[i].complete) {
                    complete = false;
                }
            }
            return complete;
        };

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

        var combinePixels = function(pixels, idx, images, i) {
            var red = 0, green = 0, blue = 0,
                len = images.length,
                j, image, state, alpha;

            for (j = 0; j < len; j++) {
                image = images[j];
                state = self.states[j];
                alpha = state.alpha / 255;

                red += state.red * image[i] * alpha;
                green += state.green * image[i] * alpha;
                blue += state.blue * image[i] * alpha;
            }

            pixels[idx] = red / len;
            pixels[idx+1] = green / len;
            pixels[idx+2] = blue / len;
            pixels[idx+3] = 255;
        };

        var draw = function() {
            if (!areComplete()) {
                requestAnimationFrame(draw);
            } else {
                console.log('all complete');
            }

            var images = getImages(),
                pixels = imageData.data,
                len = imageData.width * imageData.height,
                i;

            for (i = 0; i < len; i++) {
                var idx = i * 4;
                combinePixels(pixels, idx, images, i);
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
                
