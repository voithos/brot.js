/*! brot.js - v0.0.1 */
(function(e, t, n) {
    function i(n, s) {
        if (!t[n]) {
            if (!e[n]) {
                var o = typeof require == "function" && require;
                if (!s && o) return o(n, !0);
                if (r) return r(n, !0);
                throw new Error("Cannot find module '" + n + "'");
            }
            var u = t[n] = {
                exports: {}
            };
            e[n][0].call(u.exports, function(t) {
                var r = e[n][1][t];
                return i(r ? r : t);
            }, u, u.exports);
        }
        return t[n].exports;
    }
    var r = typeof require == "function" && require;
    for (var s = 0; s < n.length; s++) i(n[s]);
    return i;
})({
    1: [ function(require, module, exports) {
        (function() {
            "use strict";
            var _ = require("./polyfills");
            var Buddhabrot = require("./buddhabrot");
            var setupCanvas = function() {
                var canvas = document.getElementById("main");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                return canvas;
            };
            var setupGUI = function(buddha, config) {
                var gui = new dat.GUI();
                var coreFolder = gui.addFolder("Core");
                var escapeCtrl = coreFolder.add(config, "maxEscapeIter", 1, 30);
                escapeCtrl.onFinishChange(function(value) {
                    value = Math.pow(2, value / 2) + 2 | 0;
                    buddha.config.maxEscapeIter = value;
                });
                coreFolder.add(buddha.config, "batchSize", 1e3, 1e5);
                coreFolder.add(buddha.config, "anti");
                coreFolder.open();
                var colorFolder = gui.addFolder("Color");
                colorFolder.add(config, "red", 0, 255);
                colorFolder.add(config, "green", 0, 255);
                colorFolder.add(config, "blue", 0, 255);
                colorFolder.add(config, "alpha", 0, 255);
                return gui;
            };
            var createDrawHandler = function(canvas, buddha, config) {
                var ctx = canvas.getContext("2d");
                var imageData = ctx.createImageData(canvas.width, canvas.height);
                var draw = function() {
                    if (!buddha.complete) {
                        requestAnimationFrame(draw);
                    } else {
                        console.log("complete");
                    }
                    var image = buddha.getImage();
                    if (image) {
                        var pixels = imageData.data;
                        var len = imageData.width * imageData.height;
                        for (var i = 0; i < len; i++) {
                            var idx = i * 4;
                            pixels[idx] = config.red * image[i];
                            pixels[idx + 1] = config.green * image[i];
                            pixels[idx + 2] = config.blue * image[i];
                            pixels[idx + 3] = config.alpha;
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
                    maxEscapeIter: 4,
                    red: 0,
                    green: 255,
                    blue: 255,
                    alpha: 255
                };
                var gui = setupGUI(buddha, config);
                var draw = createDrawHandler(canvas, buddha, config);
                buddha.run();
                requestAnimationFrame(draw);
            };
        })();
    }, {
        "./buddhabrot": 2,
        "./polyfills": 5
    } ],
    2: [ function(require, module, exports) {
        (function() {
            "use strict";
            var BuddhaConfig = require("./buddhaconfig");
            var BuddhaData = require("./buddhadata");
            var Buddhabrot = function(options) {
                if (!(this instanceof Buddhabrot)) {
                    return new Buddhabrot(options);
                }
                this.config = new BuddhaConfig(options);
                this.config.computeConfig();
                this.data = new BuddhaData(this.config);
                this.callback = options.callback || function() {};
                this.i = 0;
                this.allocated = false;
                this.complete = false;
                this._scheduleBatchBound = this._scheduleBatch.bind(this);
            };
            Buddhabrot.prototype.run = function(callback) {
                this.callback = callback || this.callback;
                this.data.allocate();
                this.allocated = true;
                if (this.config.batched) {
                    setTimeout(this._scheduleBatchBound);
                } else {
                    this._computeTrajectories();
                    this.callback(this.getImage());
                }
            };
            Buddhabrot.prototype.getImage = function() {
                if (!this.allocated) {
                    return undefined;
                }
                return this.data.normedImage;
            };
            Buddhabrot.prototype._scheduleBatch = function() {
                this._computeTrajectories();
                if (!this.complete) {
                    setTimeout(this._scheduleBatchBound);
                } else {
                    this.callback(this.getImage());
                }
            };
            Buddhabrot.prototype._computeTrajectories = function() {
                var i = this.i, l = this.config.iterations, batchend = i + this.config.batchSize, end = batchend < l || this.config.infinite ? batchend : l, xstart = this.config.xstart, xlength = this.config.xlength, ystart = this.config.ystart, ylength = this.config.ylength, cx, cy;
                for (;i < end; i++) {
                    cx = xstart + Math.random() * xlength;
                    cy = ystart + Math.random() * ylength;
                    this._traceTrajectory(cx, cy);
                }
                this.i = i;
                this.data.normalizeImage();
                if (this.i === l && !this.config.infinite) {
                    this.complete = true;
                }
            };
            Buddhabrot.prototype._traceTrajectory = function(cx, cy) {
                var real = cy, imag = cx, real0 = real, imag0 = imag, i = 0, maxEscapeIter = this.config.maxEscapeIter, data = this.data, realPrime, imagPrime;
                while (this._isBounded(real, imag) && i < maxEscapeIter) {
                    data.cacheTrajectory(real, imag, i);
                    realPrime = real * real - imag * imag + real0;
                    imagPrime = 2 * imag * real + imag0;
                    real = realPrime;
                    imag = imagPrime;
                    i++;
                }
                if (this._checkCriteria(i)) {
                    data.saveTrajectory(i);
                }
            };
            Buddhabrot.prototype._isBounded = function(real, imag) {
                return !(real < this.config.ystart || real > this.config.yend || imag < this.config.xstart || imag > this.config.xend);
            };
            Buddhabrot.prototype._checkCriteria = function(iteration) {
                if (this.config.anti) {
                    return iteration === this.config.maxEscapeIter;
                } else {
                    return iteration < this.config.maxEscapeIter;
                }
            };
            module.exports = Buddhabrot;
        })();
    }, {
        "./buddhaconfig": 3,
        "./buddhadata": 4
    } ],
    3: [ function(require, module, exports) {
        (function() {
            "use strict";
            var BuddhaConfig = function(options) {
                if (!(this instanceof BuddhaConfig)) {
                    return new BuddhaConfig(options);
                }
                this.width = options.width || options.w;
                this.height = options.height || options.h;
                if (options.infinite && !options.batched) {
                    throw new Error("An infinite BuddhaBrot must be batched");
                }
                this.infinite = options.infinite || false;
                this.iterations = options.iterations || 1e9;
                this.maxEscapeIter = options.maxEscapeIter || options.max || 20;
                this.batched = !options.batched ? false : true;
                this.batchSize = (options.batchSize < 0 ? null : options.batchSize) || 5e4;
                this.anti = options.anti || false;
                if (!this.batched) {
                    this.batchSize = this.iterations;
                }
            };
            BuddhaConfig.prototype.computeConfig = function() {
                var INT_BYTES = 4, FLOAT_BYTES = 8;
                this.pixels = this.width * this.height;
                this.imageProcBytes = this.pixels * INT_BYTES + this.pixels * FLOAT_BYTES;
                this.bufLength = (this.pixels * INT_BYTES + this.pixels * FLOAT_BYTES) * 2;
                var remainder = this.bufLength - this.imageProcBytes;
                while (remainder < this.maxEscapeIter * FLOAT_BYTES * 2) {
                    this.bufLength = this.bufLength * 2;
                    remainder = this.bufLength - this.imageProcBytes;
                }
                this.imageStart = 0;
                this.imageLength = this.pixels;
                this.normedImageStart = this.imageLength * INT_BYTES;
                this.normedImageLength = this.pixels;
                this.cacheStart = this.imageLength * INT_BYTES + this.normedImageLength * FLOAT_BYTES;
                this.cacheLength = (this.bufLength - this.cacheStart) / FLOAT_BYTES;
                var MANDEL_REAL_LOWER = -2.5, MANDEL_REAL_UPPER = 1, MANDEL_IMAG_LOWER = -1, MANDEL_IMAG_UPPER = 1, MANDEL_REAL_LENGTH = MANDEL_REAL_UPPER - MANDEL_REAL_LOWER, MANDEL_IMAG_LENGTH = MANDEL_IMAG_UPPER - MANDEL_IMAG_LOWER, MANDEL_REAL_IMAG_RATIO = MANDEL_REAL_LENGTH / MANDEL_IMAG_LENGTH;
                var heightToWidthRatio = this.height / this.width;
                if (heightToWidthRatio <= MANDEL_REAL_IMAG_RATIO) {
                    this.ystart = MANDEL_REAL_LOWER;
                    this.ylength = MANDEL_REAL_LENGTH;
                    this.xlength = this.ylength / heightToWidthRatio;
                    this.xstart = 0 - this.xlength / 2;
                } else {
                    this.xstart = MANDEL_IMAG_LOWER;
                    this.xlength = MANDEL_IMAG_LENGTH;
                    this.ylength = this.xlength * heightToWidthRatio;
                    this.ystart = MANDEL_REAL_LOWER + MANDEL_REAL_LENGTH / 2 - this.ylength / 2;
                }
                this.xend = this.xstart + this.xlength;
                this.yend = this.ystart + this.ylength;
                this.dx = this.xlength / this.width;
                this.dy = this.ylength / this.height;
                this.initialized = true;
            };
            module.exports = BuddhaConfig;
        })();
    }, {} ],
    4: [ function(require, module, exports) {
        (function() {
            (function() {
                "use strict";
                var BuddhaData = function(config) {
                    if (!(this instanceof BuddhaData)) {
                        return new BuddhaData(config);
                    }
                    this.config = config;
                    this.normalizer = 0;
                };
                BuddhaData.prototype.allocate = function() {
                    if (!this.config.initialized) {
                        throw new Error("BuddhaConfig has not been initialized");
                    }
                    this.buf = new ArrayBuffer(this.config.bufLength);
                    this.image = new Int32Array(this.buf, this.config.imageStart, this.config.imageLength);
                    this.normedImage = new Float64Array(this.buf, this.config.normedImageStart, this.config.normedImageLength);
                    this.cache = new Float64Array(this.buf, this.config.cacheStart, this.config.cacheLength);
                };
                BuddhaData.prototype.normalizeImage = function() {
                    var normalizer = this.normalizer || 1, i, l;
                    for (i = 0, l = this.config.pixels; i < l; i++) {
                        this.normedImage[i] = this.image[i] / normalizer;
                    }
                };
                BuddhaData.prototype.cacheTrajectory = function(real, imag, i) {
                    var offset = 2 * i;
                    this.cache[offset] = real;
                    this.cache[offset + 1] = imag;
                };
                BuddhaData.prototype.saveTrajectory = function(iterationCount) {
                    var xstart = this.config.xstart, xend = this.config.xend, ystart = this.config.ystart, yend = this.config.yend, dx = this.config.dx, dy = this.config.dy, width = this.config.width, i, offset, x, y, row, col, index, hits;
                    for (i = 0; i < iterationCount; i++) {
                        offset = 2 * i;
                        y = this.cache[offset];
                        x = this.cache[offset + 1];
                        if (x < xstart || x > xend || y < ystart || y > yend) {
                            continue;
                        }
                        row = (y - ystart) / dy | 0;
                        col = (x - xstart) / dx | 0;
                        index = row * width + col;
                        hits = ++this.image[index];
                        if (this.normalizer < hits) {
                            this.normalizer = hits;
                        }
                    }
                };
                module.exports = BuddhaData;
            })();
        })();
    }, {} ],
    5: [ function(require, module, exports) {
        (function() {
            "use strict";
            (function() {
                var lastTime = 0, vendors = [ "ms", "moz", "webkit", "o" ], i;
                for (i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
                    window.requestAnimationFrame = window[vendors[i] + "RequestAnimationFrame"];
                    window.cancelAnimationFrame = window[vendors[i] + "CancelAnimationFrame"] || window[vendors[i] + "CancelRequestAnimationFrame"];
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
            (function() {
                if (!("bind" in Function.prototype)) {
                    Function.prototype.bind = function(to) {
                        var splice = Array.prototype.splice, partialArgs = splice.call(arguments, 1), fn = this;
                        var bound = function() {
                            var args = partialArgs.concat(splice.call(arguments, 0));
                            if (!(this instanceof bound)) {
                                return fn.apply(to, args);
                            }
                            fn.apply(this, args);
                        };
                        bound.prototype = fn.prototype;
                        return bound;
                    };
                }
            })();
        })();
    }, {} ]
}, {}, [ 1 ]);