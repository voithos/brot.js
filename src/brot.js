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

    var featureDetection = {};
    featureDetection.downloadAttribute = (function() {
        var a = document.createElement('a');
        return typeof a.download === 'string';
    })();


    /**
     * BrotJS - the primary controller object
     */
    var BrotJS = function(canvas) {
        this.canvas = canvas;
        this.count = 0;

        this.buddhas = [];
        this.states = [];

        this.smooth = false;
        this.windowSize = 3;

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
            autoNormalize: true,

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

        this.addToGUI(buddha, state, this.count);
        buddha.run();
    };

    BrotJS.prototype.setupGUI = function() {
        var self = this;
        self.gui = new dat.GUI();
        self.gui.add(self, 'addBuddhabrot');

        // The 'download' attribute is needed in order to provide a filename
        if (featureDetection.downloadAttribute) {
            self.gui.add(self, 'saveImage');
        }

        // Setup parameter controls
        var smoothCtrl = self.gui.add(self, 'smooth');
        var windowSizeCtrl = self.gui.add(self, 'windowSize').min(3).max(15).step(2);

        windowSizeCtrl.domElement.style.display = "none";
        smoothCtrl.onChange(function(smooth) {
            if (!smooth) {
                windowSizeCtrl.domElement.style.display = "none";
            } else {
                windowSizeCtrl.domElement.style.display = "";
            }
        });
    };

    BrotJS.prototype.addToGUI = function(buddha, state, n) {
        var self = this;
        var coreFolder = self.gui.addFolder('Config ' + n);

        var setConfigChanged = function() {
            self.configChanged = true;
        };

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

        coreFolder.add(buddha, 'resetImage').onChange(setConfigChanged);

        // Create fake listener on local state object to simulate
        // a logarithmic scale for the purposes of maxEscapeIter
        var escapeCtrl = coreFolder.add(state, 'maxEscapeIter', 1, 30);
        escapeCtrl.onChange(function(value) {
            value = (Math.pow(2, value / 2) + 2) | 0;
            buddha.config.maxEscapeIter = value;
        });

        coreFolder.add(buddha.config, 'batchSize', 1000, 100000);
        coreFolder.add(buddha.config, 'anti');

        var autoNormalizeCtrl = coreFolder.add(state, 'autoNormalize');
        autoNormalizeCtrl.onChange(function(autoNormalize) {
            setConfigChanged();

            if (autoNormalize && coreFolder.normalizerCtrl) {
                coreFolder.normalizerCtrl.remove();
                buddha.data.userNormalizer = null;
                buddha.data.normalizeImage();
            } else {
                buddha.data.userNormalizer = buddha.data.maxHits || 1;
                coreFolder.normalizerCtrl = coreFolder.add(buddha.data, 'userNormalizer').min(1);
                coreFolder.normalizerCtrl.onChange(function(normalizer) {
                    setConfigChanged();
                    buddha.data.normalizeImage();
                });
            }
        });

        coreFolder.open();

        var colorFolder = self.gui.addFolder('Color ' + n);
        colorFolder.add(state, 'red', 0, 255).onChange(setConfigChanged);
        colorFolder.add(state, 'green', 0, 255).onChange(setConfigChanged);
        colorFolder.add(state, 'blue', 0, 255).onChange(setConfigChanged);
        colorFolder.add(state, 'alpha', 0, 1).onChange(setConfigChanged);
    };

    BrotJS.prototype.saveImage = function() {
        var data = this.canvas.toDataURL('image/png');

        var a = document.createElement('a');
        a.style.display = 'none';

        // To get the browser to download the image with a filename, we
        // have to use the anchor tag's 'download' attribute
        document.body.appendChild(a);
        a.download = 'buddhabrot.png';
        a.href = data;
        a.click();
        document.body.removeChild(a);
    };

    /**
     * Create and return the draw handler
     */
    BrotJS.prototype.createDrawHandler = function() {
        var self = this;
        var canvas = self.canvas;
        var ctx = canvas.getContext('2d');
        var imageData = ctx.createImageData(canvas.width, canvas.height);
        var pixels = imageData.data;
        var states = self.states;
        var pixLen = imageData.width * imageData.height;

        // Initialize the alpha for all pixels so we don't have to do it
        // in the draw function
        (function() {
            for (var i = 0; i < pixLen; i++) {
                var idx = i * 4;
                pixels[idx+3] = 255;
            }
        })();

        var smoother = (function() {
            // Store buffers to avoid GC hits
            var filterBufs = [];
            var filterImages = [];

            // JavaScript sorts lexicographically by default, even with numbers
            var numericSorter = function(a, b) {
                return a - b;
            };

            return function(image, i) {
                // Append to buffers if needed
                if (filterImages.length < self.count) {
                    filterBufs.push(new ArrayBuffer(8 * pixLen));
                    filterImages.push(new Float32Array(filterBufs[filterImages.length]));
                }

                var filtered = filterImages[i],
                    width = self.canvas.width,
                    height = self.canvas.height,
                    length = width * height,
                    windowSize = self.windowSize,
                    windowMargin = windowSize / 2 | 0,
                    x, y, xl, yl, fx, fy, idx, colors;

                // Perform median filter
                for (y = windowMargin, yl = height - windowMargin; y < yl; y++) {
                    for (x = windowMargin, xl = width - windowMargin; x < xl; x++) {
                        idx = y * width + x;

                        // Group window colors
                        colors = [];

                        for (fy = 0; fy < windowSize; fy++) {
                            for (fx = 0; fx < windowSize; fx++) {
                                colors.push(image[idx + (fy - windowMargin) * width + (fx - windowMargin)]);
                            }
                        }

                        // Set median
                        colors.sort(numericSorter);
                        filtered[idx] = colors[colors.length / 2 | 0];
                    }
                }

                return filtered;
            };
        })();

        var batchAvailable = function() {
            var res = false,
                i, buddha;
            for (i = 0; i < self.count; i++) {
                buddha = self.buddhas[i];
                if (buddha.batchAvailable) {
                    res = true;
                    buddha.batchAvailable = false;
                }
            }

            return res;
        };

        var getImages = function() {
            var images = [],
                i, image;

            for (i = 0; i < self.count; i++) {
                image = self.buddhas[i].getImage();
                if (image) {
                    // Filter the image if smoothing is enabled
                    if (self.smooth) {
                        images.push(smoother(image, i));
                    } else {
                        images.push(image);
                    }
                }
            }
            return images;
        };

        var draw = function() {
            if (!batchAvailable() && !self.configChanged) {
                self.requestID = requestAnimationFrame(draw);
                return;
            }
            self.configChanged = false;

            var images = getImages(),
                imgLen = images.length,
                red, green, blue,
                i, j, idx, image, state, alpha, alphaImgLen = 1;

            // Pre calculate cumulative alpha between all images, to use
            // in normalization (if there are more than 1 image - otherwise,
            // the single image's alpha value should simply mute its own colors)
            if (imgLen > 1) {
                alphaImgLen = 0;
                for (j = 0; j < imgLen; j++) {
                    alphaImgLen += states[j].alpha;
                }
            }

            // Unroll first iteration, for performance reasons, as well as
            // allowing for a nice place to reset the last frame's color
            image = images[0];
            state = states[0];
            alpha = state.alpha;

            for (i = 0; i < pixLen; i++) {
                idx = i * 4;

                pixels[idx] = state.red * image[i] * alpha / alphaImgLen;
                pixels[idx+1] = state.green * image[i] * alpha / alphaImgLen;
                pixels[idx+2] = state.blue * image[i] * alpha / alphaImgLen;
            }

            // Loop through the rest of the images and assign the proper color
            for (j = 1; j < imgLen; j++) {
                image = images[j];
                state = states[j];
                alpha = state.alpha;

                for (i = 0; i < pixLen; i++) {
                    idx = i * 4;

                    pixels[idx] += state.red * image[i] * alpha / alphaImgLen;
                    pixels[idx+1] += state.green * image[i] * alpha / alphaImgLen;
                    pixels[idx+2] += state.blue * image[i] * alpha / alphaImgLen;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            self.requestID = requestAnimationFrame(draw);
        };

        return draw;
    };


    window.onload = function() {
        var canvas = setupCanvas();
        var brot = new BrotJS(canvas);
        brot.run();
    };
})();
