(function() {
    'use strict';

    var BuddhaConfig = function(options) {
        if (!(this instanceof BuddhaConfig)) {
            return new BuddhaConfig(options);
        }

        this.width = options.width || options.w;
        this.height = options.height || options.h;
        this.iterations = options.iterations || 1e5;
        this.maxEscapeIter = options.maxEscapeIter || options.max || 20;
        this.anti = options.anti || false;
    };

    /**
     * Setup required parameters and boundaries for the computation,
     * and calculate the needed buffer size
     */
    BuddhaConfig.prototype.computeConfig = function() {
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

        // Compute offsets and lengths of the views into the buffer
        this.imageStart = 0;
        this.imageLength = this.pixels;

        this.normedImageStart = this.imageLength * INT_BYTES;
        this.normedImageLength = this.pixels;

        this.cacheStart = this.imageLength * INT_BYTES +
                          this.normedImageLength * FLOAT_BYTES;
        this.cacheLength = (this.bufLength - this.cacheStart) / FLOAT_BYTES;

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

        this.initialized = true;
    };

    module.exports = BuddhaConfig;
})();
