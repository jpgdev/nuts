'use strict';

const StorageStrategy = require('../lib/storage-strategy.js'),
    should = require('should');

describe('Storage Strategy', function() {
    const storateStrategy = new StorageStrategy();

    describe('#clearSessions()', () => {
        it('should throw an error since it is not implemented', () => {
            should.throws(() => storateStrategy.clearSessions());
        });
    });

    describe('#clearTable()', () => {
        it('should throw an error since it is not implemented', () => {
            should.throws(() => storateStrategy.clearTable());
        });

    });

    describe('#saveModel()', () => {
        it('should throw an error since it is not implemented', () => {
            should.throws(() => storateStrategy.saveModel());
        });

    });

    describe('#saveModels()', () => {
        it('should throw an error since it is not implemented', () => {
            should.throws(() => storateStrategy.saveModels());
        });

    });
});
