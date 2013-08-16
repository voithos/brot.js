(function() {
    'use strict';

    /**
     * Function.bind polyfill
     */
    (function() {
        if (!('bind' in Function.prototype)) {
            Function.prototype.bind = function(to) {
                var splice = Array.prototype.splice,
                    partialArgs = splice.call(arguments, 1),
                    fn = this;

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

        this.callback = options.callback || function() {};
        this.i = 0;

        // Flags
        this.allocated = false;
        this.complete = false;
    };

    /**
     * Run the fractal sampler
     */
    Buddhabrot.prototype.run = function(callback) {
        this.callback = callback || this.callback;
        this.data.allocate();
        this.allocated = true;

        if (this.config.batched) {
            setTimeout(this._scheduleBatch.bind(this));
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
            setTimeout(this._scheduleBatch.bind(this));
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
            end = batchend < l ? batchend : l,
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

        if (this.i === l) {
            this.complete = true;
        }
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
     * Return a value indicating whether the complex number is bounded
     * within the viewable area
     */
    Buddhabrot.prototype._isBounded = function(z) {
        return !(z.real < this.config.ystart || z.real > this.config.yend ||
                 z.imag < this.config.xstart || z.imag > this.config.xend);
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
