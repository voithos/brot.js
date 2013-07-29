(function() {
    /**
     * Complex prototype for computation with complex numbers
     */
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
        other = Complex.toComplex(other);
        return new Complex(this.real + other.real, this.imag + other.imag);
    };

    Complex.prototype.sub = function(other) {
        other = Complex.toComplex(other);
        return new Complex(this.real - other.real, this.imag - other.imag);
    };

    Complex.prototype.mult = function(other) {
        other = Complex.toComplex(other);
        return new Complex(
            this.real * other.real - this.imag * other.imag,
            this.imag * other.real + this.real * other.imag
        );
    };

    Complex.prototype.div = function(other) {
        other = Complex.toComplex(other);
        var denom = other.real * other.real + other.imag * other.imag;
        return new Complex(
            (this.real * other.real + this.imag * other.imag) / denom,
            (this.imag * other.real - this.real * other.imag) / denom
        );
    };

    // Export library
    // Supports Node.js module, AMD, and browser
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Complex;
    } else {
        if (typeof define === 'function' && define.amd) {
            define([], function() {
                return Complex;
            });
        } else {
            window.Complex = Complex;
        }
    }
})();
