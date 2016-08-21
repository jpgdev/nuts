'use strict';

const genUtils = require('../lib/generators/generators-utils.js'),
    should = require('should');

describe('Generator Utilities', () => {
    describe('#getOneRandom()', () => {
        it('should return a random item from a list', () => {
            let items = [1, 2, 3, 4];
            let item = genUtils.getOneRandom(items);

            should.exist(item);
            items.should.containEql(item);
        });

        it('should return a random item from a list of random types', () => {
            let items = [1, 2, 'str', 'another str', {
                    a: '2'
                },
                [1, 2, 3]
            ];

            let item = genUtils.getOneRandom(items);

            should.exist(item);
            items.should.containEql(item);
        });

        it('should return a random item from a list multiple times', () => {
            let items = [1, 2, 3, 4];

            for (let i = 0, nbRetry = 300; i < nbRetry; i++) {
                let item = genUtils.getOneRandom(items);

                should.exist(item);
                items.should.containEql(item);
            }
        });

        it('should return null when the list is null', () => {
            should.equal(genUtils.getOneRandom(null), null);
        });

        it('should return null when the list is empty', () => {
            should.equal(genUtils.getOneRandom([]), null);
        });
    });

    describe('#getRangesFromOptions()', () => {

        it('should throw an error if the default ranges are null', () => {
            should.throws(() => genUtils.getRangesFromOptions(null, {}));
        });

        it('should use the defaults if no options are used', () => {
            var defaultRanges = {
                value: {
                    min: 4,
                    max: 5
                }
            };

            var ranges = genUtils.getRangesFromOptions(defaultRanges, null);

            should.equal(ranges.value.min, defaultRanges.value.min);
            should.equal(ranges.value.max, defaultRanges.value.max);
        });

        it('should replace the default with the options', () => {

            var defaultRanges = {
                value: {
                    min: 4,
                    max: 5
                }
            };

            var options = {
                value: {
                    min: 3,
                    max: 8
                }
            };

            var ranges = genUtils.getRangesFromOptions(defaultRanges, options);

            should.equal(ranges.value.min, options.value.min);
            should.equal(ranges.value.max, options.value.max);
        });

        it('should work with arrays as ranges', () => {

            var defaultRanges = {
                value:  [4, 5]
            };

            var options = {
                value: [3, 8]
            };

            var ranges = genUtils.getRangesFromOptions(defaultRanges, options);

            should.equal(ranges.value.min, options.value[0]);
            should.equal(ranges.value.max, options.value[1]);
        });

        it('should work with single values as ranges', () => {

            var defaultRanges = {
                value:  [4, 5]
            };

            var options = {
                value: 3
            };

            var ranges = genUtils.getRangesFromOptions(defaultRanges, options);

            should.equal(ranges.value.min, options.value);
            should.equal(ranges.value.max, options.value);
        });

        it('should use the default max value if it is missing from the options', () => {

            var defaultRanges = {
                value: {
                    min: 4,
                    max: 5
                }
            };

            var options = {
                value: {
                    min: 3
                }
            };

            var ranges = genUtils.getRangesFromOptions(defaultRanges, options);

            should.equal(ranges.value.min, options.value.min);
            should.equal(ranges.value.max, defaultRanges.value.max);
        });

        it('should use the default min value if it is missing from the options', () => {

            var defaultRanges = {
                value: {
                    min: 4,
                    max: 5
                }
            };

            var options = {
                value: {
                    max: 10
                }
            };

            var ranges = genUtils.getRangesFromOptions(defaultRanges, options);

            should.equal(ranges.value.min, defaultRanges.value.min);
            should.equal(ranges.value.max, options.value.max);
        });

        it('should make sure the max value is higher or equal to the min value', () => {
            var defaultRanges = {
                value: {
                    min: 8,
                    max: 2
                }
            };

            var options = {
                value: {
                    min: 3
                }
            };

            var ranges = genUtils.getRangesFromOptions(defaultRanges, options);

            ranges.value.max.should.be.aboveOrEqual(ranges.value.min);
        });

        it('should work for multiple ranges', () => {
            var defaultRanges = {
                value: {
                    min: 4,
                    max: 5
                },
                value2: {
                    min: 2,
                    max: 10
                }
            };

            var options = {
                value: {
                    min: 3
                },
                value2: [0, 2]
            };

            var ranges = genUtils.getRangesFromOptions(defaultRanges, options);

            should.equal(ranges.value.min, options.value.min);
            should.equal(ranges.value.max, defaultRanges.value.max);

            should.equal(ranges.value2.min, options.value2[0]);
            should.equal(ranges.value2.max, options.value2[1]);
        });
    });

    describe('#getFormattedRange()', () => {

        it('should return an object from an array', () => {

            let values = [1, 5];

            let range = genUtils.getFormattedRange(values);

            should.equal(range.min, values[0]);
            should.equal(range.max, values[1]);
        });

        it('should return an object with the same min and max if the array only has one value', () => {
            should.throws(() => genUtils.getFormattedRange([1]));
        });

        it('should return an object which is already a valid object', () => {
            let values = {
                min: 0,
                max: 4
            };

            let range = genUtils.getFormattedRange(values);

            should.equal(range.min, values.min);
            should.equal(range.max, values.max);
        });

        it('should return an object with the same min and max if only min is passed', () => {
            should.throws(() => genUtils.getFormattedRange({
                min: 1
            }));
        });

        it('should return an object with the same min and max if only a single value is passed', () => {
            let value = 5;

            let range = genUtils.getFormattedRange(value);

            should.equal(range.min, value);
            should.equal(range.max, value);
        });

        it('should throw an error if the received object is not valid', function() {
            should.throws(() => genUtils.getFormattedRange({
                value: 5
            }));
        });

    });

    describe('#validateRequiredOptions()', () => {

        it('should throw an error if the required fields are invalid', () => {
            should.throws(() => genUtils.validateRequiredOptions(null, {}));
        });

        it('should throw an error if the options are missing', () => {
            should.throws(() => genUtils.validateRequiredOptions([], null));
        });

        it('should accept an array for the required fields', () => {

            let requiredFields = ['firstName', 'lastName'];

            should.doesNotThrow(() => genUtils.validateRequiredOptions(requiredFields, {
                firstName: 'firstName',
                lastName: 'lastName'
            }));
        });

        it('should accept a semi-colon separated string for the required fields', () => {

            let requiredFields = 'firstName;lastName';

            should.doesNotThrow(() => genUtils.validateRequiredOptions(requiredFields, {
                firstName: 'firstName',
                lastName: 'lastName'
            }));
        });

        it('should accept a comma separated string for the required fields', () => {

            let requiredFields = 'firstName,lastName';

            should.doesNotThrow(() => genUtils.validateRequiredOptions(requiredFields, {
                firstName: 'firstName',
                lastName: 'lastName'
            }));
        });

        it('should throw an error if a required field is missing (array as required fields)', () => {

            let requiredFields = ['firstName', 'lastName'];
            let options = {
                firstName: 'firstName'
            };

            should.throws(() => genUtils.validateRequiredOptions(requiredFields, options));
        });

        it('should throw an error if a required field is missing (string as required fields)', () => {

            let requiredFields = 'firstName;lastName';
            let options = {
                firstName: 'firstName'
            };

            should.throws(() => genUtils.validateRequiredOptions(requiredFields, options));
        });

        it('should not throw an error if no required fields are missing (array as required fields)', () => {

            let requiredFields = ['firstName', 'lastName'];
            let options = {
                firstName: 'firstName',
                lastName: 'lastName',
                surname: 'surname'
            };

            should.doesNotThrow(() => genUtils.validateRequiredOptions(requiredFields, options));
        });


        it('should not throw an error if no required field are missing (string as required fields)', () => {

            let requiredFields = 'firstName;lastName';
            let options = {
                firstName: 'firstName',
                lastName: 'lastName',
                surname: 'surname'
            };

            should.doesNotThrow(() => genUtils.validateRequiredOptions(requiredFields, options));
        });

    });

    describe('#getRandomBetween()', () => {

        it('should accept an array', () => {
            let range = [1, 4];

            let value = genUtils.getRandomBetween(range);

            value.should.be.within(range[0], range[1]);
        });

        it('should accept a min and max value', () => {
            let min = 1,
                max = 4;

            let value = genUtils.getRandomBetween(min, max);

            value.should.be.within(min, max);
        });

        it('should accept an object with a min and max property', () => {
            let range = {
                min: 1,
                max: 4
            };

            let value = genUtils.getRandomBetween(range);

            value.should.be.within(range.min, range.max);
        });

        it('should throw if the array passed is missing a value', () => {
            should.throws(() => genUtils.getRandomBetween([1]));
        });

        it('should throw if the object passed is missing a value', () => {
            should.throws(() => genUtils.getRandomBetween({
                min: 5
            }));
        });

        it('should throw if only one value is passed', () => {
            should.throws(() => genUtils.getRandomBetween(1));
        });

    });
});
