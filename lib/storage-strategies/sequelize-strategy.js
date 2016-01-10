'use strict';

var StorageStrategy = require('./tests-helper-storage-strategy.js'),
	util = require('util');

function SequelizeDBStrategy(options) {
	this._db = options && options.db || this._db;

	this._sessionModelName = options.sessionModelName || 'Sessions';

	if(!this._db){
		throw new Error('The options.db cannot be null.');
	}

	StorageStrategy.call(this);
}

util.inherits(SequelizeDBStrategy, StorageStrategy);

SequelizeDBStrategy.prototype.clearSessions = function clearSessions(done) {
	this.clearTable(this._sessionModelName, done);
};

SequelizeDBStrategy.prototype._getModel = function _getModel(name) {
	return this._db[name] || this._db.sequelize.models[name];
};

SequelizeDBStrategy.prototype.clearTable = function clearTable(modelName, done) {
	var model = this._getModel(modelName);
	if (!model) {
		return done(new Error('The model "' + modelName + '" does not exist in the database.'));
	}

	model.destroy({ where: {} }).then(function (nbRows) {
		done();
	}).catch(done);
};

SequelizeDBStrategy.prototype.saveModel = function saveModel(type, data, done) {

	var model = this._getModel(type);
	if (!model) {
		return done(new Error('The model ' + type + ' does not exist in the database.'));
	}

	if (!data) {
		return done();
	}

	model.create(data).then(function (result) {
		done(null, result);
	}).catch(done);
};

SequelizeDBStrategy.prototype.saveModels = function saveModels(type, data, done) {

	var model = this._getModel(type);
	if (!model) {
		return done(new Error('The model ' + type + ' does not exist in the database.'));
	}

	if (!data || !data.length) {
		return done();
	}

	model.bulkCreate(data, { returning: true }).then(function (result) {
		done(null, result);
	}).catch(done);
};

exports = module.exports = SequelizeDBStrategy; 
