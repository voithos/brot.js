(function() {
    'use strict';

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
        var real = this.real * other.real - this.imag * other.imag,
            imag = this.imag * other.real + this.real * other.imag;
        this.real = real;
        this.imag = imag;
        return this;
    };

    Complex.prototype.div = function(other) {
        return this.clone().idiv(other);
    };

    Complex.prototype.idiv = function(other) {
        other = Complex.toComplex(other);
        var denom = other.real * other.real + other.imag * other.imag,
            real = (this.real * other.real + this.imag * other.imag) / denom,
            imag = (this.imag * other.real - this.real * other.imag) / denom;
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
            // Negative exponent
            n = -n;
            c = this.clone();
            for (i = 1; i < n; i++) {
                c.imult(this);
            }
            this.real = 1;
            this.imag = 0;
            this.idiv(c);
        } else {
            // Normal exponent
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

    // Export library
    module.exports = Complex;
})();
