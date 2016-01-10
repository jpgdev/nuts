'use strict';

function StorageStrategy(options) {}

StorageStrategy.prototype.clearSessions = function clearSessions(done) {
	throw new Error('The clearSessions() function needs to be implemented.');
};

StorageStrategy.prototype.clearTable = function clearTable(model, done) {
	throw new Error('The clearTable() function needs to be implemented.');
};

StorageStrategy.prototype.saveModel = function saveModel(model, data, done) {
	throw new Error('The saveModel() function needs to be implemented.');
};

StorageStrategy.prototype.saveModels = function saveModels(model, data, done) {
	throw new Error('The saveModels() function needs to be implemented.');
};


exports = module.exports = StorageStrategy;

exports.Strategy = StorageStrategy;
