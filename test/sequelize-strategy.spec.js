'use strict';

const SequelizeStrategy = require('../index.js').Strategies.SequelizeStrategy,
    should = require('should'),
    sinon = require('sinon');

describe('Sequelize Strategy', () => {
    let tableName = 'MyTable',
        sequelizeStrategy,
        fakeModel;

    beforeEach(() => {
        sequelizeStrategy = new SequelizeStrategy({
            db: {}
        });

        fakeModel = {
            destroy: sinon.stub()
                .returns(new Promise((cb) => cb())),
            create: sinon.stub()
                .returns(new Promise((cb) => cb())),
            bulkCreate: sinon.stub()
                .returns(new Promise((cb) => cb())),
        };

        sinon.stub(sequelizeStrategy, '_getModel')
            .withArgs(tableName)
            .returns(fakeModel);
    });

    afterEach(() => {
        sinon.restore();
    });

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
            let sessionModelName = 'MySessionModelName',
                ss = new SequelizeStrategy({
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

        let sequelizeStrategy,
            firstTableName = 'FirstTable',
            secondTableName = 'SecondTable';

        beforeEach(() => {

            let fakeDb = {
                    [firstTableName]: {
                        name: firstTableName
                    },
                    sequelize: {
                        models: {
                            [secondTableName]: {
                                name: secondTableName
                            }

                        }
                    }
                },
                options = {
                    db: fakeDb
                };

            sequelizeStrategy = new SequelizeStrategy(options);
        });

        it('should get the model from the db object', () => {
            let model = sequelizeStrategy._getModel(firstTableName);

            should.equal(sequelizeStrategy._db[firstTableName], model);
        });


        it('should check in the sequelize.models objects if the model can\'t be found at the root', () => {
            let model = sequelizeStrategy._getModel(secondTableName);

            should.equal(sequelizeStrategy._db.sequelize.models[secondTableName], model);
        });

    });

    describe('#clearSessions()', () => {
        let sessionModelName = 'MySessionsTable';

        beforeEach(() => {
            sequelizeStrategy._sessionModelName = sessionModelName;
        });

        it('should be able to clear all sessions', () => {

            let callback = () => {},
                clearTableStub = sinon.stub(sequelizeStrategy, 'clearTable');

            sequelizeStrategy.clearSessions(callback);

            should.equal(clearTableStub.calledOnce, true);
            should.equal(clearTableStub.calledWith(sessionModelName, callback), true);
        });
    });

    describe('#clearTable()', () => {

        it('should call the destroy function on the model', () => {
            sequelizeStrategy.clearTable(tableName, () => {});

            should.equal(fakeModel.destroy.calledOnce, true);
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

        it('should call the create function on the model', () => {
            let modelToSave = {
                name: 'Paul',
                age: 25
            };

            sequelizeStrategy.saveModel(tableName, modelToSave, () => {});

            should.equal(fakeModel.create.calledOnce, true);
            should.equal(fakeModel.create.calledWith(modelToSave), true);
        });

        it('should not call the create function on the model if the data is empty', () => {
            sequelizeStrategy.saveModel(tableName, null, () => {});

            should.equal(fakeModel.create.callCount, 0);
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

        it('should call the bulkCreate function on the model', () => {
            let modelsToSave = [{
                name: 'Paul',
                age: 25
            }, {
                name: 'Roger',
                age: 35
            }];

            sequelizeStrategy.saveModels(tableName, modelsToSave, () => {});

            should.equal(fakeModel.bulkCreate.calledOnce, true);
            should.equal(fakeModel.bulkCreate.calledWith(modelsToSave), true);
        });

        it('should not call the bulkCreate function on the model if the data is empty', () => {
            sequelizeStrategy.saveModels(tableName, [], () => {});

            should.equal(fakeModel.bulkCreate.callCount, 0);
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
