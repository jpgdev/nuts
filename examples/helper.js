'use strict';

// FIXME : This example is still coupled with the original application, fix this

var util = require('util'),
    should = require('should'),
    async = require('async'),
    TestHelper = require('../index.js').TestHelper,
    SequelizeStrategy = require('../lib/storage-strategies/sequelize-strategy.js');

function AppTestStrategy() {

    var databaseStrategy = new SequelizeStrategy({
        db: require('./database.js')
    });

    // Note : The `express.js` file does not currently exist for this example
    var agent = require('supertest').agent(require('./express.js'));

    // Setup the test helper for our use with the right DB Strategy
    TestHelper.call(this, databaseStrategy, agent);

    // Add the custom generators for the models
    this.addGenerators(require('./app-generators.js'));
}

// Inherits the functions from the TestHelper
util.inherits(AppTestStrategy, TestHelper);

AppTestStrategy.prototype.login = function(credentials, done) {

    TestHelper.prototype.login.apply(this, [
        'post',
        '/api/auth/signin', {
            username: credentials.username || credentials.email,
            password: credentials.password
        },
        done
    ]);
};

AppTestStrategy.prototype.logOut =
    AppTestStrategy.prototype.logout =
    AppTestStrategy.prototype.logout = function(done) {
        // Keeps the same behavior
        this.clearSessions(done);
    };

AppTestStrategy.prototype.tests = {
    notLoggedIn: function notLoggedIn(verb, route, data, done) {
        var self = _instance;

        if (typeof data === 'function') {
            done = data;
            data = null;
        }

        self.logoutAndCall(verb, route, data, function(err, res) {
            try {
                should.not.exist(err);
                should.notEqual(res.error, false);

                res.error.text.should.match(/logged in/);
            } catch (e) {
                if (res.error) {
                    return done(res.error, res);
                }

                return done(e, res);
            }

            done(null, res);
        });
    },
    notAuthorized: function notAuthorized(verb, route, credentials, data, done) {
        var self = _instance;

        if (typeof data === 'function') {
            done = data;
            data = null;
        }

        self.loginAndCall(verb, route, credentials, data, function(err, res) {

            try {
                should.not.exist(err);
                should.notEqual(res.error, false);

                res.error.text.should.match(/not authorized/);
            } catch (e) {
                if (res.error) {
                    return done(res.error, res);
                }

                return done(e, res);
            }

            done(null, res);
        });
    },
    validateRequiredParams: function validateRequiredParams(type, params, options, done) {
        var self = _instance;

        if (typeof options === 'function') {
            done = options;
            options = null;
        }

        // Supports ; or , separated array
        if (typeof params === 'string') {

            // removes all white spaces
            params = params.replace(/ /g, '');

            if (params.indexOf(';') > -1) {
                params = params.split(';');
            } else {
                params = params.split(',');
            }
        }

        if (!Array.isArray(params)) {
            return done(new Error('The params array is not of a valid format. Supported formats : [\'param1\', \'param2\'], "param1;param2", "param1,param2"'));
        }

        async.each(params, function(param, next) {
            self.generate(type, 1, options, function(err, result) {
                try {
                    should.not.exist(err);
                    should.exist(result);
                    should.equal(result.length, 1);
                } catch (e) {
                    return next(e);
                }

                var obj = result[0];

                delete obj[param];

                self.saveToDB(type, [obj], function(err, result) {
                    try {
                        should.exist(err);
                        // err.name.should.match(/Sequelize[a-zA-Z]+Error/);
                        err.name.should.match(/Error/);
                        err.message.should.match(new RegExp(param));
                    } catch (e) {
                        return next(e);
                    }

                    next();
                });

            });
        }, done);
    }
};

// NOTE: Ignore the fact that it is used before is was defined (in tests functions)
/*jshint latedef: false */
// To be sure there is only one instance of the helper
var _instance = new AppTestStrategy();
/*jshint latedef: true */

exports = module.exports = _instance;
