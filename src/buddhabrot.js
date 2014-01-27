(function() {
    'use strict';

    var BuddhaConfig = require('./buddhaconfig');
    var BuddhaData = require('./buddhadata');

    var Buddhabrot = function(options) {
        if (!(this instanceof Buddhabrot)) {
            return new Buddhabrot(options);
        }

        this.config = new BuddhaConfig(options);
        this.config.computeConfig();
        this.data = new BuddhaData(this.config);

        this.callback = options.callback || function() {};
        this.i = 0;

        // Flags
        this.allocated = false;
        this.complete = false;

        // Cached objects, to avoid garbage collector hits
        this._scheduleBatchBound = this._scheduleBatch.bind(this);
    };

    /**
     * Run the fractal sampler
     */
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

    /**
     * Return the current view of the image
     */
    Buddhabrot.prototype.getImage = function() {
        if (!this.allocated) {
            return undefined;
        }
        return this.data.normedImage;
    };

    /**
     * Schedule a batch run of computations (batches are required
     * because redraws require a context switch)
     */
    Buddhabrot.prototype._scheduleBatch = function() {
        this._computeTrajectories();

        if (!this.complete) {
            setTimeout(this._scheduleBatchBound);
        } else {
            this.callback(this.getImage());
        }
    };

    /**
     * Compute and save the trajectories of random samplings
     * within the bounded range, then normalize them
     */
    Buddhabrot.prototype._computeTrajectories = function() {
        var i = this.i,
            l = this.config.iterations,
            batchend = i + this.config.batchSize,
            end = batchend < l || this.config.infinite ? batchend : l,
            xstart = this.config.xstart,
            xlength = this.config.xlength,
            ystart = this.config.ystart,
            ylength = this.config.ylength,
            cx, cy;

        for (; i < end; i++) {
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

    /**
     * Trace through and save the trajectory of a given point
     */
    Buddhabrot.prototype._traceTrajectory = function(cx, cy) {
        // y is the real axis, x is the imaginary
        var real = cy,
            imag = cx,
            real0 = real,
            imag0 = imag,
            i = 0,
            maxEscapeIter = this.config.maxEscapeIter,
            data = this.data,
            realPrime, imagPrime;

        // Repeat until escape, or maximum iteration count is reached
        while (this._isBounded(real, imag) && i < maxEscapeIter) {
            data.cacheTrajectory(real, imag, i);

            // Mandelbrot function
            // z' = z^2 + z0
            realPrime = (real * real - imag * imag) + real0;
            imagPrime = (2 * imag * real) + imag0;
            real = realPrime;
            imag = imagPrime;

            i++;
        }

        // Check if the value meets the criteria
        if (this._checkCriteria(i)) {
            data.saveTrajectory(i);
        }
    };

    /**
     * Return a value indicating whether the complex number is bounded
     * within the viewable area
     */
    Buddhabrot.prototype._isBounded = function(real, imag) {
        return !(real < this.config.ystart || real > this.config.yend ||
                 imag < this.config.xstart || imag > this.config.xend);
    };

    /**
     * Check the appropriate criteria as configured, to see if a point
     * with the given iteration count should be included
     */
    Buddhabrot.prototype._checkCriteria = function(iteration) {
        // Standard Buddhabrot traces escaped points,
        // anti-Buddhabrot traces points that are in the set
        if (this.config.anti) {
            return iteration === this.config.maxEscapeIter;
        } else {
            return iteration < this.config.maxEscapeIter;
        }
    };

    module.exports = Buddhabrot;
})();
