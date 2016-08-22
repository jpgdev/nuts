'use strict';

const StorageStrategy = require('../storage-strategy.js');


class SequelizeDBStrategy extends StorageStrategy {
    constructor(options) {
        super(options);

        this._db = options && options.db || this._db;
        if (!this._db) {
            throw new Error('The options.db cannot be null.');
        }

        this._sessionModelName = options.sessionModelName || 'Sessions';
    }

    clearSessions(done) {
        this.clearTable(this._sessionModelName, done);
    }

    _getModel(name) {
        return this._db[name] || this._db.sequelize.models[name];
    }

    clearTable(modelName, done) {

        let model = this._getModel(modelName);
        if (!model) {
            return done(new Error('The model "' + modelName + '" does not exist in the database.'));
        }

        model
            .destroy({
                where: {}
            })
            .then(function(nbRows) {
                done();
            })
            .catch(done);
    }

    saveModel(type, data, done) {

        let model = this._getModel(type);
        if (!model) {
            return done(new Error('The model ' + type + ' does not exist in the database.'));
        }

        if (!data) {
            return done();
        }

        model
            .create(data)
            .then(function(result) {
                done(null, result);
            })
            .catch(done);

    }

    saveModels(type, data, done) {

        let model = this._getModel(type);
        if (!model) {
            return done(new Error('The model ' + type + ' does not exist in the database.'));
        }

        if (!data || !data.length) {
            return done();
        }

        model
            .bulkCreate(data, {
                returning: true
            })
            .then(function(result) {
                done(null, result);
            })
            .catch(done);

    }
}

module.exports = SequelizeDBStrategy;
