var expect = require('chai').expect,
    Complex = require('../brot');

describe('Complex', function() {
    it('should account for missing "new"', function() {
        expect(new Complex()).to.be.an.instanceof(Complex);
        expect(Complex()).to.be.an.instanceof(Complex);
    });

    it('should have reasonable defaults', function() {
        var c = Complex();
        expect(c.real).to.equal(0);
        expect(c.imag).to.equal(0);
    });

    it('should take constructor arguments', function() {
        var c = Complex(2, 5);
        expect(c.real).to.equal(2);
        expect(c.imag).to.equal(5);
    });

    it('should support cloning', function() {
        var c = Complex(2, 5),
            clone = c.clone();

        expect(clone.real).to.equal(2);
        expect(clone.imag).to.equal(5);
        expect(clone).to.not.equal(c);
    });

    it('should support conversion to Complex', function() {
        var c = Complex.toComplex(5),
            tc = Complex.toComplex(c);

        expect(c).to.be.an.instanceof(Complex);
        expect(c.real).to.equal(5);
        expect(c.imag).to.equal(0);
        expect(tc).to.equal(c);
    });

    it('should support addition', function() {
        var c = Complex(2, 5),
            add1 = c.add(3),
            add2 = c.add(Complex(1, 1));

        expect(add1).to.be.an.instanceof(Complex);
        expect(add2).to.be.an.instanceof(Complex);
        expect(add1.real).to.equal(2+3);
        expect(add1.imag).to.equal(5);
        expect(add2.real).to.equal(2+1);
        expect(add2.imag).to.equal(5+1);
    });

    it('should support subtraction', function() {
        var c = Complex(2, 5),
            sub1 = c.sub(5),
            sub2 = c.sub(Complex(1, 1));

        expect(sub1).to.be.an.instanceof(Complex);
        expect(sub2).to.be.an.instanceof(Complex);
        expect(sub1.real).to.equal(-3);
        expect(sub1.imag).to.equal(5);
        expect(sub2.real).to.equal(1);
        expect(sub2.imag).to.equal(4);
    });

    it('should support multiplication', function() {
        var c = Complex(2, 5),
            mult1 = c.mult(2),
            mult2 = c.mult(Complex(3, 2));

        expect(mult1).to.be.an.instanceof(Complex);
        expect(mult2).to.be.an.instanceof(Complex);
        expect(mult1.real).to.equal(4);
        expect(mult1.imag).to.equal(10);
        expect(mult2.real).to.equal(-4);
        expect(mult2.imag).to.equal(19);
    });

    it('should support division', function() {
        var c = Complex(2, 5),
            div1 = c.div(2),
            div2 = c.div(Complex(3, 2));

        expect(div1).to.be.an.instanceof(Complex);
        expect(div2).to.be.an.instanceof(Complex);
        expect(div1.real).to.equal(1);
        expect(div1.imag).to.equal(2.5);
        expect(div2.real).to.equal(16/13);
        expect(div2.imag).to.equal(11/13);
    });

    it('should allow retrieval of the conjugate', function() {
        var c = Complex(2, 5),
            conj = c.conjugate();

        expect(conj).to.be.an.instanceof(Complex);
        expect(conj.real).to.equal(2);
        expect(conj.imag).to.equal(-5);
    });

    it('should support an in-place API', function() {
        var c = Complex(2, 5),
            c2 = c.iadd(Complex(3, 2));
        expect(c.real).to.equal(5);
        expect(c.imag).to.equal(7);
        expect(c).to.equal(c2);
    });
});
