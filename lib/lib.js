'use strict';

/*
 * Helper for the tests with routing
 *
 */

/*
* 	TODO :
*	- Add more functions for DB operations
		- getStorageStrategy()
		- findOne/findAll(query, done)
		- deleteOne()/deleteAll()
		 So the tests won't need to get the DB when they want to validate the DB state (ex. models tests).
*/

/*
 * Dependencies
 */
const async = require('async');

class TestHelper {

    constructor(storageStrategy, agent) {
        this._storageStrategy = storageStrategy || this._storageStrategy;
        this._agent = agent || this._agent;

        this._generators = {};
    }

    login(verb, route, credentials, done) {
        // TODO : Need to change this function to a 2 parameter function & set the verb & route in the options? login : { verb, route } ?
        // FIX THIS

        this.makeApiCall(
            verb,
            route,
            credentials,
            (err, res) => {
                if (err) {
                    return done(err, res);
                }

                if (res.error) {
                    return done(res.body && res.body.message || res.error, res);
                }

                done(null, res);
            });
    }

    /*
     * By default this clears ALL sessions
     * 	Override it to change the behavior (using _agent instead for example)
     */
    logout(done) {
        this.clearSessions(done);
    }

    clearSessions(done) {
        if (!this._storageStrategy) {
            return done(new Error('The storageStrategy has not been set.'));
        }

        this._storageStrategy.clearSessions(done);
    }

    cleanUpDB(models, done) {
        let self = this;

        if (!self._storageStrategy) {
            return done(new Error('The storageStrategy has not been set.'));
        }

        // Supports ; or , separated array
        if (typeof models === 'string') {
            // removes all whitespaces
            models = models.replace(/ /g, '');

            if (models.indexOf(';') > -1) {
                models = models.split(';');
            } else {
                models = models.split(',');
            }
        }

        if (!Array.isArray(models)) {
            return done(new Error('The models array is not of a valid format. Supported formats : [\'model1\', \'model2\'], "model1;model2", "model1,model2"'));
        }

        async.each(models, function(modelName, cb) {
            // NOTE : This is important to not just give the function to async.each,
            // since the 'this' in the strategy.clearTable() function will be null otherwise.
            self._storageStrategy.clearTable(modelName, cb);
        }, done);
    }

    addGenerator(name, gen) {
        if (!name || typeof name !== 'string') {
            throw new Error('The generator name provided "' + name + '" is not a valid string.');
        }

        if (!gen || typeof gen !== 'function') {
            throw new Error('The generator provided in not a function.');
        }

        if (gen.length < 2 || gen.length > 3) {
            throw new Error('The generator "' + name + '" should expect either 2 or 3 parameters, but it expects ' + gen.length + '.');
        }

        this._generators[name] = gen;
    }

    addGenerators(generators) {
        let self = this;

        if (typeof generators !== 'object') {
            throw new Error('The generators instance provided is not an object.');
        }

        for (let gen in generators) {
            self.addGenerator(gen, generators[gen]);
        }
    }

    generate(name, nb, options, done) {
        let generator = this._generators[name];
        if (!generator) {
            return done(new Error('There is no generator with the name "' + name + '" available.'));
        }

        generator(nb, options, done);
    }

    saveToDB(type, models, done) {
        if (!this._storageStrategy) {
            return done(Error('The storageStrategy has not been set.'));
        }

        // Saves the models to the database
        // if (!Array.isArray(models) || models && models.length === 1) {
        // 	let model = Array.isArray(models) ? models[0] : models;
        // 	this._storageStrategy.saveModel(type, model, done);
        // }
        // else {
        this._storageStrategy.saveModels(type, models, done);
        // }
    }

    generateAndSave(name, nb, options, done) {
        let self = this;

        if (!self._storageStrategy) {
            return done(Error('The storageStrategy has not been set.'));
        }

        if (typeof options === 'function') {
            done = options;
            options = null;
        }

        // Validate that there is a name for the generator (and Model)
        if (!name) {
            return done(new Error('There was no generator name provided.'));
        }

        nb = Math.max(1, nb);

        self.generate(name, nb, options, (err, result) => {
            if (err) {
                return done(err);
            }

            let modelName = options && options.modelName || name;
            self.saveToDB(modelName, result, done);
        });
    }

    loginAndCall(verb, route, credentials, data, done) {
            let self = this;

            if (typeof data === 'function') {
                done = data;
                data = null;
            }

            // FIXME : Will crash if login as not been overriden with a 2 parameter function

            self.login(credentials, (err) => {
                if (err) {
                    return done(err);
                }

                self.makeApiCall(verb, route, data, done);
            });
        }
        /*	
        	Logs out then call the api with the route
        */
    logoutAndCall(verb, route, data, done) {
        let self = this;

        if (typeof data === 'function') {
            done = data;
            data = null;
        }

        self.logout((err) => {
            if (err) {
                return done(err);
            }

            self.makeApiCall(verb, route, data, done);
        });
    }

    _getValidHTTPVerb(verb) {
        let possibleVerbs = ['get', 'put', 'post', 'delete'];

        if (typeof verb !== 'string') {
            return null;
        }

        verb = verb.toLowerCase();

        let pos = possibleVerbs.indexOf(verb);

        return (pos >= -1 ? possibleVerbs[pos] : null);
    }

    makeApiCall(verb, route, data, done) {
        let self = this;

        if (typeof data === 'function') {
            done = data;
            data = null;
        }

        if (typeof done !== 'function') {
            throw new Error('The done callback object received is not a function.');
        }

        if (!self._agent) {
            return done(new Error('The superagent has not been set.'));
        }

        let httpVerb = self._getValidHTTPVerb(verb);
        if (!httpVerb || !self._agent[httpVerb]) {
            return done(new Error('The verb provided (' + verb + ') is invalid or not supported.'));
        }

        let apiCall = self._agent[httpVerb](route);
        if (data) {
            apiCall = apiCall.send(data);
        }

        apiCall.end(done);
    }
}

module.exports = TestHelper;
