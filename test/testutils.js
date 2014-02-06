module.exports = {
    /**
     * Repeat a function n times
     */
    repeat: function(n, fn) {
        while (n--) {
            fn();
        }
    },

    /**
     * Return an integer in the interval [start, end),
     * where start < end. If start is not provided,
     * it defaults to 0
     */
    randrange: function(start, end) {
        if (!end) {
            end = start;
            start = 0;
        }

        return Math.random() * (end - start) + start | 0;
    }
};
