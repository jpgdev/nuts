'use strict';


var genUtils = module.exports = {
	
	getOneRandom: function getOneRandom(items) {
		
		if(!items || !items.length){
			return null;
		}
		
		var max = items.length - 1;
		var pos = Math.floor(Math.random() * (max + 1));
		
		return items[pos];
	},
	getRangesFromOptions: function getRangesFromOptions(defaultRanges, options) {

		function getFormattedRange(obj) {
			var tmp = {};

			if (Array.isArray(obj)) {
				tmp.min = obj[0];
				tmp.max = obj[1];
			} else if (typeof obj === 'object') {
				tmp.min = obj.min;
				tmp.max = obj.max;
			} else {
				// If only 1 value was passed, there is no random
				tmp.min = tmp.max = obj;
			}

			return tmp;
		}

		var tmp = defaultRanges;

		// Get the random ranges from the options
		for (var r in defaultRanges) {

			var defaults = getFormattedRange(defaultRanges[r]);
			if (options && options[r]) {
				tmp[r] = getFormattedRange(options[r]);

				// Replaces the min or max to default if there was none in the options
				for (var prop in ['min', 'max']) {
					if (!tmp[r][prop] && isNaN(tmp[r][prop])) {
						tmp[r][prop] = defaults[prop];
					}
				}
			}
			else {
				tmp[r] = defaults;
			}		
			
			// Validates that the max >= min (if they are not numbers)
			if (!isNaN(tmp[r].min) && !isNaN(tmp[r].max)) {
				tmp[r].max = Math.max(tmp[r].max, tmp[r].min);
			}
		}
		return tmp;
	},
	validateRequiredOptions: function validateRequiredOptions(fields, options) {

		if (!options) {
			throw new Error('The generator requires options to work.');
		}
		
		// Supports ; or , separated array
		if (typeof fields === 'string') {
			
			// removes all white spaces
			fields = fields.replace(/ /g, '');

			if (fields.indexOf(';') > -1) {
				fields = fields.split(';');
			}
			else {
				fields = fields.split(',');
			}
		}
		

		if (!Array.isArray(fields)) {
			throw new Error('The params array is not of a valid format. Supported formats : [\'param1\', \'param2\'], "param1;param2", "param1,param2"');
		}

		var missingFields = fields.reduce(function (required, curr) {
			
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
};