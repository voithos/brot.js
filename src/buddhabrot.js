(function() {
    'use strict';

    var Complex = require('complex');

    var Buddhabrot = function(w, h, numIter, maxEscapeIter, anti) {
        if (!(this instanceof Buddhabrot)) {
            return new Buddhabrot(w, h);
        }

        this.width = w;
        this.height = h;
        this.numIter = numIter || 1000000;
        this.maxEscapeIter = maxEscapeIter || 20;
        this.anti = anti || false;
    };

    /**
     * Run the fractal sampler and return the generated image data
     */
    Buddhabrot.prototype.run = function() {
        this._setup();
        this._execute();
        return this.normedImage;
    };

    /**
     * Setup required parameters and boundaries for the computation,
     * and allocate the needed buffer size
     */
    Buddhabrot.prototype._setup = function() {
        // Initialize required data structures
        var INT_BYTES = 4,
            FLOAT_BYTES = 8;

        // Set buffer length to the number of pixels required,
        // times number of bytes per pixel for ints, plus the same amount
        // in bytes for floats (for conversion at the end), plus some extra
        // space for caching trajectories (keep it a power of 2, because
        // asm.js requires such buffers)
        this.pixels = this.width * this.height;
        this.imageProcBytes = this.pixels * INT_BYTES +
                              this.pixels * FLOAT_BYTES;

        this.bufLength = (this.pixels * INT_BYTES +
                          this.pixels * FLOAT_BYTES) * 2;

        // Increase buffer length for caching if the maximum iteration limit
        // calls for a larger number of bytes (bytes per float times 2 floats
        // per complex number) than that which will be available for the cache
        var remainder = this.bufLength - this.imageProcBytes;
        while (remainder < (this.maxEscapeIter * FLOAT_BYTES * 2)) {
            this.bufLength = this.bufLength * 2;
            remainder = this.bufLength - this.imageProcBytes;
        }

        this.buf = new ArrayBuffer(this.bufLength);

        this.imageStart = 0;
        this.imageLength = this.pixels;
        this.image = new Int32Array(
            this.buf, this.imageStart, this.imageLength);

        this.normedImageStart = this.imageLength * INT_BYTES;
        this.normedImageLength = this.pixels;
        this.normedImage = new Float64Array(
            this.buf, this.normedImageStart, this.normedImageLength);

        this.cacheStart = this.imageLength * INT_BYTES +
                          this.normedImageLength * FLOAT_BYTES;
        this.cacheLength = (this.bufLength - this.cacheStart) / FLOAT_BYTES;
        this.cache = new Float64Array(
            this.buf, this.cacheStart, this.cacheLength);

        // Compute boundaries of the image
        // The image is rotated 90 degrees, so that the Mandelbrot set
        // is upright (in other words, the axes are swapped)
        var MANDEL_REAL_LOWER = -2.5,
            MANDEL_REAL_UPPER = 1,
            MANDEL_IMAG_LOWER = -1,
            MANDEL_IMAG_UPPER = 1,
            MANDEL_REAL_LENGTH = MANDEL_REAL_UPPER - MANDEL_REAL_LOWER,
            MANDEL_IMAG_LENGTH = MANDEL_IMAG_UPPER - MANDEL_IMAG_LOWER,
            MANDEL_REAL_IMAG_RATIO = MANDEL_REAL_LENGTH / MANDEL_IMAG_LENGTH;

        var heightToWidthRatio = this.height / this.width;

        // To avoid stretching, we choose a single axis to bound the
        // image by (the axis that is most constrained), and fill the other
        // part of the axis with empty space
        if (heightToWidthRatio <= MANDEL_REAL_IMAG_RATIO) {
            // Bounded by the height
            this.ystart = MANDEL_REAL_LOWER;
            this.ylength = MANDEL_REAL_LENGTH;
            this.xlength = this.ylength / heightToWidthRatio;
            this.xstart = 0 - (this.xlength / 2);
        } else {
            // Bounded by the width
            this.xstart = MANDEL_IMAG_LOWER;
            this.xlength = MANDEL_IMAG_LENGTH;
            this.ylength = this.xlength * heightToWidthRatio;
            // Account for the non-symmetry of the set on the real axis
            this.ystart = (MANDEL_REAL_LOWER + MANDEL_REAL_LENGTH / 2) -
                (this.ylength / 2);
        }

        // Compute end points on the axes
        this.xend = this.xstart + this.xlength;
        this.yend = this.ystart + this.ylength;

        // Compute the delta x/y between grid pixels
        this.dx = this.xlength / this.width;
        this.dy = this.ylength / this.height;

        // Keep track of max hit count
        this.normalizer = 0;
    };

    /**
     * Compute and save the trajectories of random samplings
     * within the bounded range, then normalize them
     */
    Buddhabrot.prototype._execute = function() {
        var cx, cy, i;

        for (i = 0; i < this.numIter; i++) {
            cx = this.xstart + Math.random() * this.xlength;
            cy = this.ystart + Math.random() * this.ylength;
            this._traceTrajectory(cx, cy);
        }

        this._normalizeImage();
    };

    /**
     * Trace through and save the trajectory of a given point
     */
    Buddhabrot.prototype._traceTrajectory = function(cx, cy) {
        // y is the real axis, x is the imaginary
        var z = Complex(0, 0),
            z0 = Complex(cy, cx),
            iteration = 0;

        // Repeat until escape, or maximum iteration count is reached
        while (this._isBounded(z) && iteration < this.maxEscapeIter) {
            this._cache(z, iteration);

            // Mandelbrot function
            z = z.isquared().iadd(z0);

            iteration++;
        }

        // Check if the value meets the criteria
        if (this._checkCriteria(iteration)) {
            // Since iterations start at 0, the count is (iteration + 1)
            this._saveTrajectory(iteration + 1);
        }
    };

    /**
     * Normalize the image hit counts by dividing by the recorded normalizer
     */
    Buddhabrot.prototype._normalizeImage = function() {
        var normalizer = this.normalizer || 1;

        for (var i = 0; i < this.pixels; i++) {
            this.normedImage[i] = this.image[i] / normalizer;
        }
    };

    /**
     * Return a value indicating whether the unnormalized (non-sqrt) absolute
     * value of the given complex number is below the escape limit
     */
    Buddhabrot.prototype._isBounded = function(z) {
        var ESCAPE_LIMIT = 4;
        return (z.real * z.real + z.imag * z.imag) < ESCAPE_LIMIT;
    };

    /**
     * Retain the real and imaginary parts of a complex point
     * within the cache
     */
    Buddhabrot.prototype._cache = function(z, i) {
        // Offset is 2 * i, because each complex number requires 2 floats
        var offset = 2 * i;
        this.cache[offset] = z.real;
        this.cache[offset + 1] = z.imag;
    };

    /**
     * Check the appropriate criteria as configured, to see if a point
     * with the given iteration count should be included
     */
    Buddhabrot.prototype._checkCriteria = function(iteration) {
        // Standard Buddhabrot traces escaped points,
        // anti-Buddhabrot traces points that are in the set
        if (this.anti) {
            return iteration < this.maxEscapeIter;
        } else {
            return iteration === this.maxEscapeIter;
        }
    };

    /**
     * Loop through the trajectory cache and increment the hit count
     * of each corresponding grid pixel
     */
    Buddhabrot.prototype._saveTrajectory = function(iterationCount) {
        var i, offset, x, y, row, col, index, hits;

        for (i = 0; i < iterationCount; i++) {
            offset = 2 * i;

            // y axis is real, x is imaginary
            y = this.cache[offset];
            x = this.cache[offset + 1];

            // Only process points that are within range
            if (x < this.xstart || x > this.xend ||
                y < this.ystart || y > this.yend) {
                continue;
            }

            // Compute row and column indices
            row = (y - this.ystart) / this.dy | 0;
            col = (x - this.xstart) / this.dx | 0;

            // Compute scanline index
            index = row * this.width + col;

            // Increment image section
            hits = ++this.image[index];

            // Reassign normalizer
            if (this.normalizer < hits) {
                this.normalizer = hits;
            }
        }
    };

    module.exports = Buddhabrot;
})();
