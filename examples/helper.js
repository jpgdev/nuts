'use strict';

var path = require('path'),
	util = require('util'),
	should = require('should'),
	async = require('async'),
	// TODO : Remove this, this is connected to the app
	config = require('./../config/config.js'),
	TestHelper = require('../index.js').TestHelper,
	SequelizeStrategy = require('../lib/storage-strategies/sequelize-strategy.js'),
	// TODO : Remove this, this is connected to the app
	utils = require(path.resolve('./app/utilities.server'));

function AppTestStrategy() {

	// TODO :Change this to something less connected to the app
	var dbStrategy = new SequelizeStrategy({
		db: require('./../config/sequelize.js')
	});

	var agent = require('supertest').agent(require('../server'));

	// Setup the test helper for our use with the right DB Strategy
	TestHelper.call(this,
		dbStrategy,
		agent);

	// Add the custom generators for the models
	this.addGenerators(require('./tests-helper-app-generators.js'));
}

// Inherits the functions from the TestHelper
util.inherits(AppTestStrategy, TestHelper);

AppTestStrategy.prototype.login = function (credentials, done) {

	TestHelper.prototype.login.apply(this, [
		'post',
		config.app.apiPrefix + '/auth/signin',
		{
			username: credentials.username || credentials.email,
			password: credentials.password
		},
		done
	]);
};

AppTestStrategy.prototype.logOut =
AppTestStrategy.prototype.logout = function (done) {
	// Keeps the same behavior
	this.clearSessions(done);
};

AppTestStrategy.prototype.generateSync = function generateSync(name, nb, options) {
	return utils.callSync.bind(this)(this.generate, name, nb, options);
};

AppTestStrategy.prototype.tests = {
	// Calls a route 3 times (with a different user each times)
	//  1st time : Not Logged in & returns an error
	//  2nd time : Logged in as an invalid user and returns an error
	//  3rd time : Calls with a valid user and returns the callback
	// validatePrivateRoute: function validatePrivateRoute(verb, route, invalidUserCred, validUserCred, data, done) {
	// 	var self = _instance;

	// 	async.waterfall([
	// 		function (cb) {
	// 			self.tests.notLoggedIn(verb, route, data, function (err, r) {
	// 				cb(err);
	// 			});
	// 		},
	// 		function (cb) {
	// 			self.tests.notAuthorized(verb, route, invalidUserCred, data, function (err, r) {
	// 				cb(err);
	// 			});
	// 		},
	// 		function (cb) {
	// 			self.loginAndCall(verb, route, validUserCred, data, function (err, r) {
	// 				cb(err, r);
	// 			});
	// 		}
	// 	], function (err, res) {
	// 		if (err) {
	// 			return done(err);
	// 		}
	// 		done(err, res);
	// 	});
	// },
	notLoggedIn: function notLoggedIn(verb, route, data, done) {
		var self = _instance;

		if (typeof data === 'function') {
			done = data;
			data = null;
		}

		self.logoutAndCall(verb, route, data, function (err, res) {
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

		self.loginAndCall(verb, route, credentials, data, function (err, res) {

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
			}
			else {
				params = params.split(',');
			}
		}

		if (!Array.isArray(params)) {
			return done(new Error('The params array is not of a valid format. Supported formats : [\'param1\', \'param2\'], "param1;param2", "param1,param2"'));
		}

		async.each(params, function (param, next) {
			self.generate(type, 1, options, function (err, result) {
				try {
					should.not.exist(err);
					should.exist(result);
					should.equal(result.length, 1);
				} catch (e) {
					return next(e);
				}

				var obj = result[0];

				delete obj[param];

				self.saveToDB(type, [obj], function (err, result) {
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
