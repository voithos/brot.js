var expect = require('chai').expect,
    utils = require('./testutils'),
    BuddhaConfig = require('../src/buddhaconfig');

describe('BuddhaConfig', function() {
    var createConfig = function(options) {
        return new BuddhaConfig(options);
    };

    var createWithInit = function(options) {
        var buddhaconfig = createConfig(options);
        buddhaconfig.computeConfig();
        return buddhaconfig;
    };

    it('should disallow non-batched infinite configs', function() {
        expect(function() {
            var bc = createConfig({ infinite: true, batched: false });
        }).to.throw(Error, /infinite.*must.*batched/);
    });

    it('should default the batch size to be the iterations if unbatched', function() {
        var bc = createConfig({ batched: false, iterations: 1000 });
        expect(bc.batchSize).to.equal(1000);
    });

    it('should compute total pixel count', function() {
        var bc = createWithInit({ width: 100, height: 100 });
        expect(bc.pixels).to.equal(10000);
    });

    it('should compute correct buffer length', function() {
        var bc = createWithInit({ width: 100, height: 100, maxEscapeIter: 100 });
        expect(bc.bufLength).to.equal(160000);
    });

    it('should compute lengths and offsets for buffer parts', function() {
        var bc = createWithInit({ width: 100, height: 100, maxEscapeIter: 100 });
        expect(bc.imageStart).to.equal(0);
        expect(bc.imageLength).to.equal(10000);
        expect(bc.normedImageStart).to.equal(40000);
        expect(bc.normedImageLength).to.equal(10000);
        expect(bc.cacheStart).to.equal(80000);
        expect(bc.cacheLength).to.equal(20000);
    });

    it('should compute offsets that are proper multiples of the array types', function() {
        function divisibleBy(n) {
            return function(x) {
                return x % n === 0;
            };
        }

        utils.repeat(10, function() {
            var bc = createWithInit({ width: utils.randrange(100, 1000), height: utils.randrange(100, 1000) });
            expect(bc.normedImageStart).to.satisfy(divisibleBy(4)); // Int32
            expect(bc.cacheStart).to.satisfy(divisibleBy(4)); // Float32
        });
    });

    it('should compute start/end coordinates of the image on the complex plane', function() {
        // Constrain by height
        var bc1 = createWithInit({ width: 100, height: 100 });
        expect(bc1.xstart).to.equal(-1.75);
        expect(bc1.xlength).to.equal(3.5);
        expect(bc1.ystart).to.equal(-2.5);
        expect(bc1.ylength).to.equal(3.5);

        // Constrain by width
        var bc2 = createWithInit({ width: 50, height: 100 });
        expect(bc2.xstart).to.equal(-1);
        expect(bc2.xlength).to.equal(2);
        expect(bc2.ystart).to.equal(-2.75);
        expect(bc2.ylength).to.equal(4);
    });
});
