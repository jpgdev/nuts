'use strict';

class StorageStrategy {

    constructor(options) {}

    clearSessions() {
        throw new Error('The clearSessions() function needs to be implemented.');
    }

    clearTable() {
        throw new Error('The clearTable() function needs to be implemented.');
    }

    saveModel() {
        throw new Error('The saveModel() function needs to be implemented.');
    }

    saveModels() {
        throw new Error('The saveModels() function needs to be implemented.');
    }
}

module.exports = StorageStrategy;

exports.Strategy = StorageStrategy;
