var expect = require('chai').expect,
    BuddhaConfig = require('../src/buddhaconfig');

describe('BuddhaConfig', function() {
    var initConfig = function(options) {
        options = options || { width: 100, height: 100 };
        var buddhaconfig = new BuddhaConfig(options);
        buddhaconfig.computeConfig();
        return buddhaconfig;
    };

    it('should compute total pixel count', function() {
        var bc = initConfig();
        expect(bc.pixels).to.equal(10000);
    });
});
