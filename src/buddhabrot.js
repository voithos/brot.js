(function() {
    'use strict';

    var BuddhaConfig = require('./buddhaconfig');
    var BuddhaData = require('./buddhadata');
    var Complex = require('./complex');

    var Buddhabrot = function(options) {
        if (!(this instanceof Buddhabrot)) {
            return new Buddhabrot(options);
        }

        this.config = new BuddhaConfig(options);
        this.config.computeConfig();
        this.data = new BuddhaData(this.config);
    };

    /**
     * Run the fractal sampler and return the generated image data
     */
    Buddhabrot.prototype.run = function() {
        this.data.allocate();
        this._computeTrajectories();
        return this.data.normedImage;
    };

    /**
     * Compute and save the trajectories of random samplings
     * within the bounded range, then normalize them
     */
    Buddhabrot.prototype._computeTrajectories = function() {
        var l = this.config.iterations,
            xstart = this.config.xstart,
            xlength = this.config.xlength,
            ystart = this.config.ystart,
            ylength = this.config.ylength,
            cx, cy, i;

        for (i = 0; i < l; i++) {
            cx = xstart + Math.random() * xlength;
            cy = ystart + Math.random() * ylength;
            this._traceTrajectory(cx, cy);
        }

        this.data.normalizeImage();
    };

    /**
     * Trace through and save the trajectory of a given point
     */
    Buddhabrot.prototype._traceTrajectory = function(cx, cy) {
        // y is the real axis, x is the imaginary
        var z = Complex(cy, cx),
            z0 = z.clone(),
            i = 0,
            maxEscapeIter = this.config.maxEscapeIter,
            data = this.data;

        // Repeat until escape, or maximum iteration count is reached
        while (this._isBounded(z) && i < maxEscapeIter) {
            data.cacheTrajectory(z, i);

            // Mandelbrot function
            z = z.isquared().iadd(z0);

            i++;
        }

        // Check if the value meets the criteria
        if (this._checkCriteria(i)) {
            data.saveTrajectory(i);
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
