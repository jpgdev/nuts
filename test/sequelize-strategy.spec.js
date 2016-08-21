'use strict';

const SequelizeStrategy = require('../lib/storage-strategies/sequelize-strategy.js'),
    should = require('should'),
    sinon = require('sinon');

describe('Sequelize Strategy', () => {

    describe('SequelizeDBStrategy constructor', () => {

        it('should throw an error if there is no db object provided', () => {
            should.throws(() => new SequelizeStrategy());
        });

        it('should not throw if a db object is provided', () => {
            should.doesNotThrow(() => new SequelizeStrategy({
                db: {}
            }));
        });

        it('should use the options.sessionModelName if provided', () => {
            let sessionModelName = 'MySessionModelName';
            let ss = new SequelizeStrategy({
                db: {},
                sessionModelName: sessionModelName
            });

            should.equal(ss._sessionModelName, sessionModelName);
        });

        it('should have a default sessionModelName if none is provided', () => {
            let ss = new SequelizeStrategy({
                db: {}
            });

            should.equal(ss._sessionModelName, 'Sessions');
        });
    });

    describe('#_getModel()', () => {

        let sequelizeStrategy;
        beforeEach(() => {
            let options = {
                db: {
                    MyTable: {
                        name: 'MyTable'
                    },
                    sequelize: {
                        models: {
                            MyTable: {
                                name: 'MyTable'
                            },
                            MyOtherTable: {
                                name: 'MyOtherTable'
                            }

                        }
                    }
                }
            };
            sequelizeStrategy = new SequelizeStrategy(options);
        });

        it('should get the model from the db object', () => {
            let model = sequelizeStrategy._getModel('MyTable');

            should.equal(sequelizeStrategy._db.MyTable, model);
        });

        it('should check in the sequelize.models objects if the model can\'t be found at the root', () => {
            let model = sequelizeStrategy._getModel('MyOtherTable');

            should.equal(sequelizeStrategy._db.sequelize.models.MyOtherTable, model);
        });

    });

    describe('#clearSessions()', () => {
        let sequelizeStrategy;
        let sessionModelName = 'MySessionsTable';
        beforeEach(() => {
            sequelizeStrategy = new SequelizeStrategy({
                db: {},
                sessionModelName: sessionModelName
            });
        });

        it('should be able to clear all sessions', (done) => {

            // Replace the 'clearTable' function which should be called with a stub
            let clearTableStub = sinon.stub(sequelizeStrategy, 'clearTable', (modelName, cb) => {
                should.equal(modelName, sessionModelName);
                should.equal(clearTableStub.calledOnce, true);
                sinon.assert.calledWith(clearTableStub);

                cb();
            });

            sequelizeStrategy.clearSessions(() => done());
        });
    });

    describe('#clearTable()', () => {

        let sequelizeStrategy;
        beforeEach(() => {
            sequelizeStrategy = new SequelizeStrategy({
                db: {
                    sequelize: {
                        models: {}
                    }
                }
            });
        });

        it('should call the destroy function on the model', (done) => {

            let tableName = 'MyTable';
            let destroyStub = sinon.stub().returns(new Promise((cb) => cb()));

            sequelizeStrategy._db[tableName] = {
                destroy: destroyStub
            };

            sequelizeStrategy.clearTable(tableName, () => {
                should.equal(destroyStub.calledOnce, true);
                sinon.assert.calledWith(destroyStub, {
                    where: {}
                });
                done();
            });
        });

        it('should throw an error for a non-existing model', (done) => {
            sequelizeStrategy.clearTable('RandomModelName', (err) => {
                err.should.be.an.Error();
                err.message.should.match(/RandomModelName/);
                done();
            });

        });
    });

    describe('#saveModel()', () => {

        let sequelizeStrategy;
        beforeEach(() => {
            sequelizeStrategy = new SequelizeStrategy({
                db: {
                    sequelize: {
                        models: {}
                    }
                }
            });
        });

        it('should call the create function on the model', (done) => {

            let tableName = 'MyTable';
            let modelToSave = {
                name: 'Paul',
                age: 25
            };
            let createStub = sinon.stub().returns(new Promise((cb) => cb()));

            sequelizeStrategy._db[tableName] = {
                create: createStub
            };

            sequelizeStrategy
                .saveModel(tableName, modelToSave, () => {
                    should.equal(createStub.calledOnce, true);
                    sinon.assert.calledWith(createStub, modelToSave);
                    done();
                });
        });

        it('should not call the create function on the model if the date is empty', (done) => {

            let tableName = 'MyTable';
            let createStub = sinon.stub().returns(new Promise((cb) => cb()));

            sequelizeStrategy._db[tableName] = {
                create: createStub
            };

            sequelizeStrategy
                .saveModel(tableName, null, () => {
                    should.equal(createStub.callCount, 0);
                    done();
                });
        });

        it('should throw an error for a non-existing model', (done) => {
            sequelizeStrategy.saveModel('RandomModelName', {}, (err) => {
                err.should.be.an.Error();
                err.message.should.match(/RandomModelName/);
                done();
            });

        });
    });

    describe('#saveModels()', () => {

        let sequelizeStrategy;
        beforeEach(() => {
            sequelizeStrategy = new SequelizeStrategy({
                db: {
                    sequelize: {
                        models: {}
                    }
                }
            });
        });

        it('should call the bulkCreate function on the model', (done) => {

            let tableName = 'MyTable';
            let modelsToSave = [{
                name: 'Paul',
                age: 25
            }, {
                name: 'Roger',
                age: 35
            }];

            let bulkCreateStub = sinon.stub().returns(new Promise((cb) => cb()));

            sequelizeStrategy._db[tableName] = {
                bulkCreate: bulkCreateStub
            };

            sequelizeStrategy
                .saveModels(tableName, modelsToSave, () => {
                    should.equal(bulkCreateStub.calledOnce, true);
                    sinon.assert.calledWith(bulkCreateStub, modelsToSave);
                    done();
                });

        });

        it('should not call the bulkCreate function on the model if the data is empty', (done) => {

            let tableName = 'MyTable';

            let bulkCreateStub = sinon.stub().returns(new Promise((cb) => cb()));

            sequelizeStrategy._db[tableName] = {
                bulkCreate: bulkCreateStub
            };

            sequelizeStrategy
                .saveModels(tableName, [], () => {
                    should.equal(bulkCreateStub.callCount, 0);
                    done();
                });

        });

        it('should throw an error for a non-existing model', (done) => {
            sequelizeStrategy.saveModels('RandomModelName', [], (err) => {
                err.should.be.an.Error();
                err.message.should.match(/RandomModelName/);
                done();
            });

        });
    });
});
