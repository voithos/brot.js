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
        (function($) {
            "use strict";
            var Buddhabrot = require("./buddhabrot");
            $(document).ready(function() {
                var canvas = document.getElementById("main");
                canvas.width = window.innerWidth * .8 | 0;
                canvas.height = window.innerHeight * .8 | 0;
                var width = canvas.width, height = canvas.height;
                var ctx = canvas.getContext("2d");
                var buddha = new Buddhabrot(width, height);
                var image = buddha.run();
                var imageData = ctx.createImageData(canvas.width, canvas.height);
                var pixels = imageData.data;
                var length = imageData.width * imageData.height;
                for (var i = 0; i < length; i++) {
                    var idx = i * 4;
                    pixels[idx] = 255 * image[i];
                    pixels[idx + 1] = 255 * image[i];
                    pixels[idx + 2] = 255 * image[i];
                    pixels[idx + 3] = 255;
                }
                ctx.putImageData(imageData, 0, 0);
            });
        })(jQuery);
    }, {
        "./buddhabrot": 2
    } ],
    2: [ function(require, module, exports) {
        (function() {
            (function() {
                "use strict";
                var Complex = require("./complex");
                var Buddhabrot = function(w, h, iterations, maxEscapeIter, anti) {
                    if (!(this instanceof Buddhabrot)) {
                        return new Buddhabrot(w, h);
                    }
                    this.width = w;
                    this.height = h;
                    this.iterations = iterations || 1e5;
                    this.maxEscapeIter = maxEscapeIter || 20;
                    this.anti = anti || false;
                };
                Buddhabrot.prototype.run = function() {
                    this._setup();
                    this._execute();
                    return this.normedImage;
                };
                Buddhabrot.prototype._setup = function() {
                    var INT_BYTES = 4, FLOAT_BYTES = 8;
                    this.pixels = this.width * this.height;
                    this.imageProcBytes = this.pixels * INT_BYTES + this.pixels * FLOAT_BYTES;
                    this.bufLength = (this.pixels * INT_BYTES + this.pixels * FLOAT_BYTES) * 2;
                    var remainder = this.bufLength - this.imageProcBytes;
                    while (remainder < this.maxEscapeIter * FLOAT_BYTES * 2) {
                        this.bufLength = this.bufLength * 2;
                        remainder = this.bufLength - this.imageProcBytes;
                    }
                    this.buf = new ArrayBuffer(this.bufLength);
                    this.imageStart = 0;
                    this.imageLength = this.pixels;
                    this.image = new Int32Array(this.buf, this.imageStart, this.imageLength);
                    this.normedImageStart = this.imageLength * INT_BYTES;
                    this.normedImageLength = this.pixels;
                    this.normedImage = new Float64Array(this.buf, this.normedImageStart, this.normedImageLength);
                    this.cacheStart = this.imageLength * INT_BYTES + this.normedImageLength * FLOAT_BYTES;
                    this.cacheLength = (this.bufLength - this.cacheStart) / FLOAT_BYTES;
                    this.cache = new Float64Array(this.buf, this.cacheStart, this.cacheLength);
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
                    this.normalizer = 0;
                };
                Buddhabrot.prototype._execute = function() {
                    var cx, cy, i;
                    for (i = 0; i < this.iterations; i++) {
                        cx = this.xstart + Math.random() * this.xlength;
                        cy = this.ystart + Math.random() * this.ylength;
                        this._traceTrajectory(cx, cy);
                    }
                    this._normalizeImage();
                };
                Buddhabrot.prototype._traceTrajectory = function(cx, cy) {
                    var z = Complex(cy, cx), z0 = z.clone(), i = 0;
                    while (this._isBounded(z) && i < this.maxEscapeIter) {
                        this._cache(z, i);
                        z = z.isquared().iadd(z0);
                        i++;
                    }
                    if (this._checkCriteria(i)) {
                        this._saveTrajectory(i);
                    }
                };
                Buddhabrot.prototype._normalizeImage = function() {
                    var normalizer = this.normalizer || 1;
                    for (var i = 0; i < this.pixels; i++) {
                        this.normedImage[i] = this.image[i] / normalizer;
                    }
                };
                Buddhabrot.prototype._isBounded = function(z) {
                    var ESCAPE_LIMIT = 4;
                    return z.real * z.real + z.imag * z.imag < ESCAPE_LIMIT;
                };
                Buddhabrot.prototype._cache = function(z, i) {
                    var offset = 2 * i;
                    this.cache[offset] = z.real;
                    this.cache[offset + 1] = z.imag;
                };
                Buddhabrot.prototype._checkCriteria = function(iteration) {
                    if (this.anti) {
                        return iteration === this.maxEscapeIter;
                    } else {
                        return iteration < this.maxEscapeIter;
                    }
                };
                Buddhabrot.prototype._saveTrajectory = function(iterationCount) {
                    var i, offset, x, y, row, col, index, hits;
                    for (i = 0; i < iterationCount; i++) {
                        offset = 2 * i;
                        y = this.cache[offset];
                        x = this.cache[offset + 1];
                        if (x < this.xstart || x > this.xend || y < this.ystart || y > this.yend) {
                            continue;
                        }
                        row = (y - this.ystart) / this.dy | 0;
                        col = (x - this.xstart) / this.dx | 0;
                        index = row * this.width + col;
                        hits = ++this.image[index];
                        if (this.normalizer < hits) {
                            this.normalizer = hits;
                        }
                    }
                };
                module.exports = Buddhabrot;
            })();
        })();
    }, {
        "./complex": 3
    } ],
    3: [ function(require, module, exports) {
        (function() {
            "use strict";
            var Complex = function(real, imag) {
                if (!(this instanceof Complex)) {
                    return new Complex(real, imag);
                }
                this.real = Number(real) || 0;
                this.imag = Number(imag) || 0;
            };
            Complex.prototype.clone = function() {
                return new Complex(this.real, this.imag);
            };
            Complex.toComplex = function(other) {
                if (other instanceof Complex) {
                    return other;
                } else {
                    return new Complex(Number(other) || 0, 0);
                }
            };
            Complex.prototype.add = function(other) {
                return this.clone().iadd(other);
            };
            Complex.prototype.iadd = function(other) {
                other = Complex.toComplex(other);
                this.real = this.real + other.real;
                this.imag = this.imag + other.imag;
                return this;
            };
            Complex.prototype.sub = function(other) {
                return this.clone().isub(other);
            };
            Complex.prototype.isub = function(other) {
                other = Complex.toComplex(other);
                this.real = this.real - other.real;
                this.imag = this.imag - other.imag;
                return this;
            };
            Complex.prototype.mult = function(other) {
                return this.clone().imult(other);
            };
            Complex.prototype.imult = function(other) {
                other = Complex.toComplex(other);
                var real = this.real * other.real - this.imag * other.imag, imag = this.imag * other.real + this.real * other.imag;
                this.real = real;
                this.imag = imag;
                return this;
            };
            Complex.prototype.div = function(other) {
                return this.clone().idiv(other);
            };
            Complex.prototype.idiv = function(other) {
                other = Complex.toComplex(other);
                var denom = other.real * other.real + other.imag * other.imag, real = (this.real * other.real + this.imag * other.imag) / denom, imag = (this.imag * other.real - this.real * other.imag) / denom;
                this.real = real;
                this.imag = imag;
                return this;
            };
            Complex.prototype.conjugate = function() {
                return this.clone().iconjugate();
            };
            Complex.prototype.iconjugate = function() {
                this.imag = -this.imag;
                return this;
            };
            Complex.prototype.abs = function() {
                return Math.sqrt(this.real * this.real + this.imag * this.imag);
            };
            Complex.prototype.pow = function(n) {
                return this.clone().ipow(n);
            };
            Complex.prototype.ipow = function(n) {
                var i, c;
                n = Number(n) || 0;
                if (n === 0) {
                    this.real = 1;
                    this.imag = 0;
                } else if (n < 0) {
                    n = -n;
                    c = this.clone();
                    for (i = 1; i < n; i++) {
                        c.imult(this);
                    }
                    this.real = 1;
                    this.imag = 0;
                    this.idiv(c);
                } else {
                    c = this.clone();
                    for (i = 1; i < n; i++) {
                        c.imult(this);
                    }
                    this.real = c.real;
                    this.imag = c.imag;
                }
                return this;
            };
            Complex.prototype.squared = function() {
                return this.clone().ipow(2);
            };
            Complex.prototype.isquared = function() {
                return this.ipow(2);
            };
            module.exports = Complex;
        })();
    }, {} ]
}, {}, [ 1 ]);