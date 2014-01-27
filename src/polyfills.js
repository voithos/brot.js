(function() {
    'use strict';

    /**
     * requestAnimationFrame polyfill
     */
    (function() {
        var lastTime = 0,
            vendors = ['ms', 'moz', 'webkit', 'o'],
            i;

        for (i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
            window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] ||
                                          window[vendors[i] + 'CancelRequestAnimationFrame'];
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

})();
