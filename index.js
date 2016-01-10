/*
 * Module dependencies
 */

'use strict';

var StorageStrategy = require('./lib/storage-strategy.js'),
	TestHelper = require('./lib/nuts.js'),
	Utils = require('./lib/generators/utils.js');
/*
 * Default singleton instance
 */
exports = module.exports = new TestHelper();

/*
 * Expose the constructor
 */
exports.TestHelper = TestHelper;

/*
 * Expose the base storage strategy to implement
 */
exports.StorageStrategy = StorageStrategy;

// TODO - JP : Add the storage strategies implementations?

/*
 * Expose the generators utils
 */
exports.Utils = Utils;
