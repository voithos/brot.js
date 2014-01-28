(function() {
    'use strict';

    var BuddhaData = function(config) {
        if (!(this instanceof BuddhaData)) {
            return new BuddhaData(config);
        }

        this.config = config;

        // Keep track of max hit count
        this.normalizer = 0;
    };

    /**
     * Allocate the required data arrays using the provided configuration.
     */
    BuddhaData.prototype.allocate = function() {
        if (!this.config.initialized) {
            throw new Error('BuddhaConfig has not been initialized');
        }

        // Setup buffer and buffer views
        this.buf = new ArrayBuffer(this.config.bufLength);

        this.image = new Int32Array(
            this.buf, this.config.imageStart, this.config.imageLength);
        this.normedImage = new Float64Array(
            this.buf, this.config.normedImageStart, this.config.normedImageLength);
        this.cache = new Float64Array(
            this.buf, this.config.cacheStart, this.config.cacheLength);
    };

    /**
     * Reset the image data
     */
    BuddhaData.prototype.resetImage = function() {
        var i, l;
        for (i = 0, l = this.config.pixels; i < l; i++) {
            this.image[i] = 0;
        }

        // Reset normalizer
        this.normalizer = 0;
    };

    /**
     * Normalize the image hit counts by dividing by the recorded normalizer
     */
    BuddhaData.prototype.normalizeImage = function() {
        var normalizer = this.normalizer || 1,
            i, l;

        for (i = 0, l = this.config.pixels; i < l; i++) {
            this.normedImage[i] = this.image[i] / normalizer;
        }
    };

    /**
     * Retain the real and imaginary parts of a complex point
     * within the cache
     */
    BuddhaData.prototype.cacheTrajectory = function(real, imag, i) {
        // Offset is 2 * i, because each complex number requires 2 floats
        var offset = 2 * i;
        this.cache[offset] = real;
        this.cache[offset + 1] = imag;
    };

    /**
     * Loop through the trajectory cache and increment the hit count
     * of each corresponding grid pixel
     */
    BuddhaData.prototype.saveTrajectory = function(iterationCount) {
        var xstart = this.config.xstart,
            xend = this.config.xend,
            ystart = this.config.ystart,
            yend = this.config.yend,
            dx = this.config.dx,
            dy = this.config.dy,
            width = this.config.width,
            i, offset, x, y, row, col, index, hits;

        for (i = 0; i < iterationCount; i++) {
            offset = 2 * i;

            // y axis is real, x is imaginary
            y = this.cache[offset];
            x = this.cache[offset + 1];

            // Only process points that are within range
            if (x < xstart || x > xend ||
                y < ystart || y > yend) {
                continue;
            }

            // Compute row and column indices
            row = ((y - ystart) / dy) | 0;
            col = ((x - xstart) / dx) | 0;

            // Compute scanline index
            index = row * width + col;

            // Increment image section
            hits = ++this.image[index];

            // Reassign normalizer
            if (this.normalizer < hits) {
                this.normalizer = hits;
            }
        }
    };

    module.exports = BuddhaData;
})();
