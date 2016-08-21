'use strict';

module.exports = {
    getFormattedRange: getFormattedRange,
    getOneRandom: getOneRandom,
    getRandomBetween: getRandomBetween,
    getRangesFromOptions: getRangesFromOptions,
    validateRequiredOptions: validateRequiredOptions
};

///////////////////////

/**
 * Get a normalized range with a min & max value from the params received
 *
 * @param {Array | object | number} obj - An array, object, value from which to create the range.
 * @param {[bool]} ignoreValidation  - Whether or not we want to ignore the validation.
 * Will make the function throw if this is 'false' & the min or max is missing.
 * @returns {object} A normalized range object. ({ min : .., max : .. })
 */
function getFormattedRange(obj, ignoreValidation) {
    let formattedRange = {};

    if (Array.isArray(obj)) {
        formattedRange.min = obj[0];
        formattedRange.max = obj[1];
    } else if (typeof obj === 'object') {
        // Takes the other value if one is missing
        formattedRange.min = obj.min;
        formattedRange.max = obj.max;
    } else {
        // If only 1 value was passed, there is no random
        formattedRange.min = formattedRange.max = obj;
    }

    // Only throws an error if we want to validate the object has both a min & a max
    if (!ignoreValidation && (isNaN(formattedRange.min) || isNaN(formattedRange.max))) {
        throw new Error('Missing or invalid parameters. Supported : { min : .., max : .. }, value, [ min, max ].');
    }

    return formattedRange;
}


/**
 * Return a random element from an array.
 *
 * @param {Array} items - The list of elements from which to return one.
 * @returns {?Any} An element from the list. Note : Returns null if the list is null or contains 0 elements.
 */
function getOneRandom(items) {

    if (!items || !items.length) {
        return null;
    }

    let max = items.length - 1;
    let pos = Math.floor(Math.random() * (max + 1));

    return items[pos];
}

/**
 * Returns a number between the ranges passed (both inclusive)
 *
 * @param {Array | object | number} min - An array with 2 values OR an object with a min & max property OR a minimum value.
 * @param {[number]} max - The maximum value (only used if the min is a number)
 * @returns {number} A value between the min and max received (both inclusive)
 */
function getRandomBetween(min, max) {

    // if an array was passed
    //  ex: getRandomBetween([1, 5], null)
    if (Array.isArray(min) && min.length > 1) {
        max = min[1];
        min = min[0];
    }

    // if an object with a range was received instead
    // ex: getRandomBetween( { min : 1, max : 5}, null)
    if (typeof min === 'object') {
        max = min.max;
        min = min.min;
    }

    if (isNaN(min) || isNaN(max)) {
        throw new Error('Missing or invalid parameters. Supported : { min : .., max : .. }, (min, max), [ min, max ].');
    }

    max = Math.max(max, min);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate an object of ranges from defaults and values passed. Will only use the default when the values are missing,
 * but the default ranges are required to know which properties are used.
 *
 * @param {object} defaultRanges - The ranges to use by default.
 * @param {[object]} options - The options which override the defaults. If null, will use the defaults.
 * @returns {object} - Return a modified defaultRanges object in which the ranges provided in options were used instead.
 */
function getRangesFromOptions(defaultRanges, options) {

    let ranges = defaultRanges;
    if (!ranges || typeof ranges !== 'object') {
        throw new Error('The defaultRanges must be an object.');
    }

    // Get the random ranges from the options
    for (let range in ranges) {

        let defaults = getFormattedRange(defaultRanges[range]);
        if (options && options[range]) {
            ranges[range] = getFormattedRange(options[range], true);

            // Makes sure there will be a min and max value (uses the default one if missing)
            if (isNaN(ranges[range].min)) ranges[range].min = defaults.min;
            if (isNaN(ranges[range].max)) ranges[range].max = defaults.max;

        } else {
            ranges[range] = defaults;
        }

        // Validates that the max >= min
        ranges[range].max = Math.max(ranges[range].max, ranges[range].min);
    }

    return ranges;
}

/**
 * Check if all the required fields are provided in the options passed, throws an Error otherwise.
 *
 * @param {Array | string} fields - The required fields in a array or a string separated by ; or ,
 * @param {object} options - The options to validate
 */
function validateRequiredOptions(fields, options) {

    if (!options) {
        throw new Error('The generator requires options to work.');
    }

    // Supports ; or , separated array
    if (typeof fields === 'string') {

        // removes all white spaces
        fields = fields.replace(/ /g, '');

        if (fields.indexOf(';') > -1) {
            fields = fields.split(';');
        } else {
            fields = fields.split(',');
        }
    }

    if (!Array.isArray(fields)) {
        throw new Error('The params array is not of a valid format. Supported formats : [\'param1\', \'param2\'], "param1;param2", "param1,param2"');
    }

    let missingFields = fields.reduce(function(required, curr) {

        // TODO : Add support for sub fields. 
        // Ex : 
        // required = 'author.id' OR required = 'object.[field1,field2,field4]'
        // 'object[id,name]' OR 'object.[id,name]' ? (with or without the .)
        // Also : required = 'author.name.firstName'. (set the author & author.name & author.name.firstName as being required).
        // Which would check recursivly for each properties

        if (!options[curr]) {
            required.push(curr);
        }
        return required;
    }, []);

    if (missingFields && missingFields.length > 0) {
        throw new Error('The missing options "' + missingFields.toString().replace(/,/g, ', ') + '" are required for the generator to work.');
    }

}
