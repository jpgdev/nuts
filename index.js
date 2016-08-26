'use strict';

/*
 * Module dependencies
 */

var StorageStrategy = require('./lib/storage-strategy.js'),
	TestHelper = require('./lib/lib.js'),
	Utils = require('./lib/generators/generators-utils.js');

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

/*
 * Expose the individuals storages strategies available
 *  NOTE : Could/Should be made into a separate plugin?
 */
exports.Strategies = {
    SequelizeStrategy : require('./lib/storage-strategies/sequelize-strategy.js')
};

/*
 * Expose the generators utils
 */
exports.Utils = Utils;
