'use strict';

const TestHelper = require('../index.js').TestHelper,
    sinon = require('sinon'),
    should = require('should');

describe('TestHelper', () => {

    let testHelper;
    beforeEach(() => {
        testHelper = new TestHelper();
    });

    describe('#login()', () => {
        let loginVerb = 'GET',
            loginRoute = '/api/login',
            credentials = {
                username: 'username',
                password: 'mySuperPassword'
            },
            callback;

        beforeEach(() => {
            callback = sinon.spy();

            sinon.stub(testHelper, 'makeApiCall');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should call the makeApiCall function', () => {

            testHelper.login(loginVerb, loginRoute, credentials, () => {});

            should.equal(testHelper.makeApiCall.calledWith(loginVerb, loginRoute, credentials), true);
        });

        // TODO : This is so loginAndCall would work, since now it only works with the overriden function by a child class
        it('should work with only 2 params using configs');

        it('should return an error correctly', () => {
            let error = new Error();

            testHelper.login(loginVerb, loginRoute, credentials, callback);
            testHelper.makeApiCall.callArg(3, error);

            should.equal(callback.calledWith(error), true);
        });

        it('should return the error message from the response body', () => {
            let response = {
                error: true,
                body: {
                    message: 'An error occured'
                }
            };

            testHelper.login(loginVerb, loginRoute, credentials, callback);
            testHelper.makeApiCall.callArg(3, null, response);

            should.equal(callback.calledWith(response.body.message, response), true);
        });

        it('should return the error if no message is available', () => {
            let response = {
                error: 'An error message'
            };

            testHelper.login(loginVerb, loginRoute, credentials, callback);
            testHelper.makeApiCall.callArg(3, null, response);

            should.equal(callback.calledWith(response.error, response), true);
        });

        it('should return the makeApiCall call response correctly', () => {
            let response = {
                data: []
            };

            testHelper.login(loginVerb, loginRoute, credentials, callback);
            testHelper.makeApiCall.callArg(3, null, response);

            should.equal(callback.calledWith(null, response), true);
        });
    });

    describe('#logout()', () => {
        beforeEach(() => {
            sinon.stub(testHelper, 'clearSessions');
        });

        afterEach(()=> {
            sinon.restore();
        });

        it('should call the clearSessions function', () => {
            testHelper.logout(() => {});

            should.equal(testHelper.clearSessions.calledOnce, true);
        });
    });

    describe('#clearSessions()', () => {

        it('should return an error if no storagestrategy is set', (done) => {
            testHelper.clearSessions((err) => {
                err.should.be.an.Error;
                err.message.should.match(/storageStrategy/);

                done();
            });
        });

        it('should call clearSessions() on the storageStrategy', () => {
            let clearSessionsStub = sinon.spy();
            testHelper._storageStrategy = {
                clearSessions: clearSessionsStub
            };

            testHelper.clearSessions(() => {});

            should.equal(clearSessionsStub.calledOnce, true);

            sinon.restore();
        });

    });

    describe('#cleanUpDB()', () => {
        let clearTableSpy;

        beforeEach(() => {
            clearTableSpy = sinon.spy();

            testHelper._storageStrategy = {
                clearTable: clearTableSpy
            };
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should return an error if no storageStrategy is set', (done) => {
            testHelper._storageStrategy = null;

            testHelper.cleanUpDB(null, (err) => {
                err.should.be.an.Error;
                err.message.should.match(/storageStrategy/);

                done();
            });
        });

        it('should be able to parse an array for the models names', () => {
            let models = ['Users', 'Sessions'];

            testHelper.cleanUpDB(models, (err, result) => {});

            should.equal(clearTableSpy.calledTwice, true);
            should.equal(clearTableSpy.getCall(0).args[0], models[0]);
            should.equal(clearTableSpy.getCall(1).args[0], models[1]);

        });

        it('should be able to parse a comma separeted string for the models names', () => {
            let models = 'Users,Sessions';

            testHelper.cleanUpDB(models, (err, result) => {});

            should.equal(clearTableSpy.calledTwice, true);
            should.equal(clearTableSpy.getCall(0).args[0], 'Users');
            should.equal(clearTableSpy.getCall(1).args[0], 'Sessions');

        });

        it('should be able to parse a semi-colon separeted string for the models names', () => {
            let models = 'Users;Sessions';

            testHelper.cleanUpDB(models, (err, result) => {});

            should.equal(clearTableSpy.calledTwice, true);
            should.equal(clearTableSpy.getCall(0).args[0], 'Users');
            should.equal(clearTableSpy.getCall(1).args[0], 'Sessions');
        });

        it('should be able to parse a single model name', () => {
            let models = 'Users';

            testHelper.cleanUpDB(models, (err, result) => {});

            should.equal(clearTableSpy.calledOnce, true);
            should.equal(clearTableSpy.getCall(0).args[0], 'Users');
        });

        it('should return an error if the models are null', (done) => {
            testHelper.cleanUpDB(null, (err, result) => {
                err.should.be.an.Error;
                err.message.should.match(/format/);

                done();
            });
        });
    });

    describe('#addGenerator()', () => {

        beforeEach(() => {
            testHelper._generators = {};
        });

        it('should throw an error if the generator name is not a valid string', () => {
            should.throws(() => testHelper.addGenerator(null));
            should.throws(() => testHelper.addGenerator(5));
        });

        it('should throw an error if the generator is not a function', () => {
            should.throws(() => testHelper.addGenerator('myGenerator', null));
            should.throws(() => testHelper.addGenerator('myGenerator', {}));
        });

        it('should throw an error if the generator function does not expect 2 or 3 params', () => {
            should.throws(() => testHelper.addGenerator('myGenerator', () => {}));
            should.throws(() => testHelper.addGenerator('myGenerator', (a) => {}));
            should.throws(() => testHelper.addGenerator('myGenerator', (a, b, c, d) => {}));
        });

        it('should not throw an error if the generator function expects 2 or 3 params', () => {
            should.doesNotThrow(() => testHelper.addGenerator('myGenerator', (a, b) => {}));
            should.doesNotThrow(() => testHelper.addGenerator('myGenerator', (a, b, c) => {}));
        });

        it('should correctly add generators', () => {
            let genName = 'UserGenerator';
            let genFn = (nb, options, cb) => {};
            testHelper.addGenerator(genName, genFn);

            should.equal(testHelper._generators[genName], genFn);
        });
    });

    describe('#addGenerators()', () => {

        beforeEach(() => {
            sinon.stub(testHelper, 'addGenerator');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should throw an error if the generators param is not an object', () => {
            should.throws(() => testHelper.addGenerators(5));
        });

        it('should correctly add the generators', () => {
            testHelper.addGenerators({
                'UserGenerator': (a, b, c) => {},
                'ListGenerator': (a, b, c) => {},
            });

            should.equal(testHelper.addGenerator.calledTwice, true);
        });
    });

    describe('#generate()', () => {

        beforeEach(() => {
            testHelper._generators = {};
            sinon.stub(testHelper, 'addGenerator');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should return an error if there is no generator found with the name', (done) => {
            testHelper.generate('FakeGenerator', 0, {}, (err) => {
                err.should.be.an.Error;
                err.message.should.match(/name/);
                done();
            });
        });

        it('should call the right generator with the right parameters', () => {
            let genName = 'MyGenerator',
                nb = 5,
                options = {
                    param: 2
                },
                callback = sinon.spy();

            testHelper._generators[genName] = sinon.stub();

            testHelper.generate(genName, nb, options, callback);

            should.equal(testHelper._generators[genName].calledWith(nb, options, callback), true);
        });

    });

    describe('#saveToDB()', () => {
        beforeEach(() => {
            testHelper._storageStrategy = {
                saveModels: sinon.stub()
            };
        });

        afterEach(() => {
            delete testHelper._storageStrategy;
        });

        it('should return an error if there is no storageStrategy', (done) => {
            delete testHelper._storageStrategy;

            testHelper.saveToDB('', [], (err) => {
                err.should.be.an.Error;
                err.message.should.match(/storageStrategy/);

                done();
            });
        });

        it('should call the storageStrategy.saveModels function', () => {
            let modelName = 'Users',
                models = [{
                    name: 'Paul',
                    age: 35
                }],
                callback = (err, result) => {};

            testHelper.saveToDB(modelName, models, callback);

            should.equal(testHelper._storageStrategy.saveModels.calledWith(modelName, models, callback), true);
        });

    });

    describe('#generateAndSave()', () => {

        let generatorName = 'User',
            nb = 5,
            options = {
                passwordLength: [5, 25]
            },
            generatedElements = [{
                name: 'Paul',
                pasword: 'MyPassword'
            }],
            callback;

        beforeEach(() => {
            callback = sinon.spy();

            testHelper._generators = {};
            testHelper._storageStrategy = sinon.mock();

            sinon.stub(testHelper, 'generate');
            sinon.stub(testHelper, 'saveToDB');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should return an error if there is no storageStrategy', (done) => {
            delete testHelper._storageStrategy;

            testHelper.generateAndSave('', 1, {}, (err) => {
                err.should.be.an.Error;
                err.message.should.match(/storageStrategy/);

                should.equal(testHelper.generate.called, false);

                done();
            });
        });

        it('should throw an error if the callback is invalid', () => {
            should.throws(() => testHelper.generateAndSave('', 1, {}));
        });

        it('should return an error if the generator name is null', (done) => {
            testHelper.generateAndSave(null, 1, {}, (err) => {
                err.should.be.an.Error;
                err.message.should.match(/name/);

                should.equal(testHelper.generate.called, false);

                done();
            });
        });

        it('should return an error if the generator name is not a string', (done) => {
            testHelper.generateAndSave(2, 1, {}, (err) => {
                err.should.be.an.Error;
                err.message.should.match(/name/);

                should.equal(testHelper.generate.called, false);

                done();
            });
        });

        it('should work with 3 params', () => {
            testHelper.generateAndSave(generatorName, nb, callback);
            testHelper.generate.callArgWith(3, null, generatedElements);

            should.equal(testHelper.saveToDB.calledOnce, true);
            should.equal(testHelper.saveToDB.calledWith(generatorName, generatedElements, callback), true);
        });

        it('should work with 4 params', () => {
            testHelper.generateAndSave(generatorName, nb, options, callback);
            testHelper.generate.callArgWith(3, null, generatedElements);

            should.equal(testHelper.saveToDB.calledOnce, true);
            should.equal(testHelper.saveToDB.calledWith(generatorName, generatedElements, callback), true);
        });

        it('should return if there is a generation error', () => {
            let err = new Error();

            testHelper.generateAndSave(generatorName, nb, options, callback);
            testHelper.generate.callArgWith(3, err);

            should.equal(callback.calledWith(err), true);
            should.equal(testHelper.saveToDB.called, false);
        });

    });

    describe('#loginAndCall()', () => {

        let credentials = {
                username: 'User',
                password: 'password123'
            },
            verb = 'POST',
            route = '/api/posts',
            data = {
                author: 'Paul',
                content: 'This is a post'
            },
            callback;

        beforeEach(() => {
            callback = sinon.spy();

            sinon.stub(testHelper, 'login');
            sinon.stub(testHelper, 'makeApiCall');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should throw an error if the callback is invalid', () => {
            should.throws(() => testHelper.loginAndCall(verb, route, credentials, data));
        });

        it('should call the login & makeApiCall function', () => {
            testHelper.loginAndCall(verb, route, credentials, data, callback);
            testHelper.login.callArg(1);

            should.equal(testHelper.login.calledOnce, true);
            should.equal(testHelper.makeApiCall.calledOnce, true);
        });

        it('should work with 4 params', () => {
            testHelper.loginAndCall(verb, route, credentials, callback);
            testHelper.login.callArg(1);

            should.equal(testHelper.makeApiCall.calledWith(verb, route, null, callback), true);
        });

        it('should work with 5 params', () => {
            testHelper.loginAndCall(verb, route, credentials, data, callback);
            testHelper.login.callArg(1);

            should.equal(testHelper.makeApiCall.calledWith(verb, route, data, callback), true);
        });

        it('should return an error if the login fails', () => {
            let err = new Error();

            testHelper.loginAndCall(verb, route, credentials, data, callback);
            testHelper.login.callArgWith(1, err);

            should.equal(callback.calledWith(err), true);
            should.equal(testHelper.makeApiCall.called, false);
        });

    });

    describe('#logoutAndCall()', () => {
        let verb = 'POST',
            route = '/api/posts',
            data = {
                author: 'Paul',
                content: 'This is a post'
            },
            callback;

        beforeEach(() => {
            callback = sinon.spy();

            sinon.stub(testHelper, 'logout');
            sinon.stub(testHelper, 'makeApiCall');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should throw an error if the callback is invalid', () => {
            should.throws(() => testHelper.logoutAndCall(verb, route, data));
        });

        it('should call the logout & makeApiCall function', () => {
            testHelper.logoutAndCall(verb, route, data, callback);
            testHelper.logout.callArg(0);

            should.equal(testHelper.logout.calledOnce, true);
            should.equal(testHelper.makeApiCall.calledOnce, true);
        });

        it('should work with 4 params', () => {
            testHelper.logoutAndCall(verb, route, callback);
            testHelper.logout.callArg(0);

            should.equal(testHelper.makeApiCall.calledWith(verb, route, null, callback), true);
        });

        it('should work with 5 params', () => {
            testHelper.logoutAndCall(verb, route, data, callback);
            testHelper.logout.callArg(0);

            should.equal(testHelper.makeApiCall.calledWith(verb, route, data, callback), true);
        });

        it('should return an error if the logout fails', () => {
            let err = new Error();

            testHelper.logoutAndCall(verb, route, data, callback);
            testHelper.logout.callArgWith(0, err);

            should.equal(callback.calledWith(err), true);
            should.equal(testHelper.makeApiCall.called, false);
        });
    });

    describe('#_getValidHTTPVerb()', () => {

        it('should return null if the verb is not a string', () => {
            should.equal(testHelper._getValidHTTPVerb(5), null);
        });

        it('should return null if the verb is not valid', () => {
            should.equal(testHelper._getValidHTTPVerb('HELP'), null);
        });

        it('should work when the verb is not in the correct case', () => {
            should.equal(testHelper._getValidHTTPVerb('GET'), 'get');
        });

        it('should support GET, PUT, POST & DELETE', () => {
            should.equal(testHelper._getValidHTTPVerb('GET'), 'get');
            should.equal(testHelper._getValidHTTPVerb('PUT'), 'put');
            should.equal(testHelper._getValidHTTPVerb('POST'), 'post');
            should.equal(testHelper._getValidHTTPVerb('DELETE'), 'delete');
        });
    });

    describe('#makeApiCall()', () => {
        let _getValidHTTPVerbStub,
            fakeAgent,
            endFnStub,
            sendFnStub,
            callback;

        beforeEach(() => {
            callback = sinon.spy();

            sinon.stub(testHelper, '_getValidHTTPVerb')
                .returns('get');

            endFnStub = sinon.stub();
            sendFnStub = sinon.stub();

            fakeAgent = {
                get: sinon.stub()
                    .returns({
                        send: sendFnStub,
                        end: endFnStub
                    })
            };

            sendFnStub.returns(fakeAgent.get());

            testHelper._agent = fakeAgent;
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should work with 3 params', () => {
            testHelper.makeApiCall('GET', '/api/users', callback);
            endFnStub.callArg(0); // call the end callback

            should.equal(sendFnStub.called, false);
            should.equal(endFnStub.calledWith(callback), true);
            should.equal(callback.called, true);
        });

        it('should work with 4 params', () => {
            let data = {
                name: 'Paul'
            };

            testHelper.makeApiCall('GET', '/api/users', data, callback);
            endFnStub.callArg(0); // call the end callback

            should.equal(sendFnStub.calledWith(data), true);
            should.equal(endFnStub.calledWith(callback), true);
            should.equal(callback.calledOnce, true);
        });

        it('should throw an error if the callback is invalid', () => {
            should.throws(() => testHelper.makeApiCall('', '', {}));
        });

        it('should return an error if the agent is missing', (done) => {
            testHelper._agent = null;
            testHelper.makeApiCall('', '', {}, (err) => {
                err.should.be.an.Error;
                err.message.should.match(/agent/);
                done();
            });
        });

        it('should return an error if the verb is invalid', (done) => {
            testHelper._getValidHTTPVerb.returns(null);

            testHelper.makeApiCall('', '', {}, (err) => {
                err.should.be.an.Error;
                err.message.should.match(/verb/);

                done();
            });
        });

        it('should return an error if the verb is not supported', (done) => {
            testHelper._getValidHTTPVerb.returns('delete');

            testHelper.makeApiCall('DELETE', '', {}, (err) => {
                err.should.be.an.Error;
                err.message.should.match(/verb/);

                done();
            });
        });
    });
});
