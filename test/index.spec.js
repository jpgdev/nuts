'use strict';

const should = require('should'),
    TestHelper = require('../.');

describe('Package Index', () => {

    it('should expose the basic singleton instance', () => {
        TestHelper.should.be.an.instanceOf(TestHelper.TestHelper);
    });

    it('should expose the constructor', () => {
        TestHelper.TestHelper.should.be.a.Function();
    });

    it('should expose the basic StorageStrategy', () => {
        TestHelper.StorageStrategy.should.be.a.Function();
    });

    it('should expose the Utilities', () => {
        TestHelper.Utils.should.be.an.Object();
    });
});
