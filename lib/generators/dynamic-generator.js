'use strict';

/*
 * Basic Models generators for the test helper app
 *
 */

/*
 * Dependencies
 */
var async = require('async'),
	path = require('path'),
	genUtils = require('./tests-helper-generators-utils'),
	faker = require('faker'),
	utils = require(path.resolve('./app/utilities.server'));


// Fields users can create
var customFields = {};

function createCustomField(data) {
	//TODO ....
}

var defaultFields = {

	// User related
	Username: function (firstName, lastName) {
		return faker.internet.userName(firstName, lastName);
	},
	Name: function () {
		return faker.name.firstName();
	},
	FirstName: function () {
		return faker.name.firstName();
	},
	LastName: function () {
		return faker.name.lastName();
	},
	Email: function (firstName, lastName) {
		return faker.internet.email(firstName, lastName);
	},
	Avatar: function () {
		return faker.image.avatar();
	},
	Password: function (nbChars) {
		return faker.internet.password(nbChars);
	},

	// Text related
	Words: function (nb, range) {
		return faker.lorem.words(nb);
	},
	Sentences: function (nb) {
		return faker.lorem.sentences(nb);
	},
	Paragraph: function (nb) {
		return faker.lorem.paragraph(nb);
	},
};

function ModelGenerator(fields, options) {

	var requiredFields = [];
	var additionalRanges = {};

	// Supports ; or , separated array
	if (typeof options === 'string') {

		// removes all white spaces
		options = options.replace(/ /g, '');

		// Split the string into an array
		if (options.indexOf(';') > -1) {
			options = options.split(';');
		}
		else {
			options = options.split(',');
		}

		requiredFields = options;
	}
	else if (Array.isArray(options)) {
		requiredFields = options;
	}
	else if (typeof options === 'object') {
		additionalRanges = options.additionalRanges || additionalRanges;
		requiredFields = options.requiredFields || requiredFields;
	}

	if (typeof additionalRanges !== 'object' || !Array.isArray(requiredFields)) {
		throw new Error('The options are invalid.');
		// throw new Error('The options array is not of a valid format. Supported formats : [\'model1\', \'model2\'], "model1;model2", "model1,model2"');
	}
	// TODO : Validate additionalRanges & requiredFields


	// IDEA : Save individual types? ex. privacy
	// IDEA : Generate model from a populated object

	this._fields = fields;
	this._requiredFields = requiredFields;
	this._ranges = additionalRanges;

	this.calculateFieldsOrder();
}

ModelGenerator.prototype.calculateFieldsOrder = function generateOrder() {
	// TODO : Generate the order in which the fields are generated HERE, not on each generation
	var self = this;


	// The order array contains the function to generate it?
	/*
	   { 
	   name : '', 
	   fn : function (generator){

	   }
	   }, 
	   { ... }
	   */

	var order = [];


	var dynamicFields = self._fields.__dynamicFields;

	var specialFields = {};

	// Add the required field in the field list, if not present
	self._requiredFields.forEach(function (name, pos) {

		var field = self._fields[name];
		if (field) {
			return;
		}

		self._fields[name] = 'OPTIONS';
	});

	// First take all fields that aren't dynamic fields and does not require any other field

	Object.keys(self._fields).forEach(function (key, pos) {
		// Skips dynamicFields which are done at the end
		if (key === '__dynamicFields') {
			return;
		}

		var field = self._fields[key];

		// If this field requires other fields, it will be ran after
		if (field.requires) {
			specialFields[key] = field;
			// Skip it for now
			return;
		}


		// Basic object to generate the field
		var fieldGenerator = {
			name: key
		};

		// { key : [0, 5] }
		if (Array.isArray(field)) {
			self._ranges[key] = field;

			fieldGenerator.type = 'RANGE';
			fieldGenerator.fn = function (range) {
				return utils.getRandomBetween(range);
			};
		}
		// { lastname : 'LastName'}
		else if (typeof field === 'string') {

			//Note : this is only for fields which does not require any params
			// Ex : LastName vs Email, otherwise we don't know which fields are needed? 
			// OR try to parse arguments names? fn(model[argName1], ... )

			if (field === 'OPTIONS') {
				fieldGenerator.type = 'OPTIONS';
				fieldGenerator.fn = function (optionValue) {
					return optionValue || field.default;
				};
			}
			else {
				// TODO : validate the fn.length?
				// if fn.length > 0 ERROR?
				fieldGenerator.type = 'SIMPLE';
				fieldGenerator.fn = customFields[field];
				// Check in the custom fields (user made fields)
				if (!fieldGenerator.fn) {
					// Check in the default fields
					fieldGenerator.fn = defaultFields[field];
					if (!fieldGenerator.fn) {
						throw new Error('The field "' + field + '" does not exist.');
					}
				}
			}
		}
		// If a function was passed directly
		// ex: { myField : function() { return 2; } }
		else if (typeof field === 'function') {

			// TODO : Either this 
			// OR calls the function with the generatorOBJ
			// ex. fn({ model, faker, ranges, options})...
			if (field.length > 0) {
				console.warn('The function for "' + key + '" expects parameters, it will be called parameter-less.');
				// throw new Error('The function expect parameters, and this is not currently supported.');
			}

			fieldGenerator.type = 'SIMPLE';
			fieldGenerator.fn = field;
		}
		else if (typeof field === 'object') {
			if (!field.type) {
				throw new Error('The field "' + key + '" does not have a type.');
			}


			// // If this field requires other fields, it will be ran after
			// if (field.requires) {
			// 	specialFields.push(field);
			// 	// Skip it for now
			// 	return;
			// }

			/*
			   ex : { 
			   fieldName : { 
			   type : 'OPTIONS' ,
			   ... 
			   } 
			   }
			   */
			// A field which can be set from the options sent to the generator
			if (field.type === 'OPTIONS') {
				fieldGenerator.type = 'OPTIONS';
				// fieldGenerator.defaultValue = field.default;

				/*
				   ex : { 
				   fieldName : { 
				   type : 'OPTIONS' ,
				   default : ''  || null
				   } 
				   }
				   */

				if (field.default && !field.choices) {
					fieldGenerator.fn = function (optionValue) {
						return optionValue || field.default;
					};
				}
				/*
				   ex : { 
				   fieldName : { 
				   type : 'OPTIONS' ,
				   choices : [...],
				   default : '' || null
				   } 
				   }
				   */
				else {
					// fieldGenerator.choices = field.choices;

					fieldGenerator.fn = function (optionValue) {

						// Validate the option value
						if (optionValue) {
							if (field.choices.indexOf(optionValue) <= -1) {
								// Choice invalid
								throw new Error('' + optionValue + ' is not a valid choice for a "' + key + '" field. Valid choices : "' + field.choices + '".');
							}

							return optionValue;
						}

						// No value in the options, but there is a default value
						if (field.default) {
							return field.default;
						}

						// Find one from the field.choices
						return genUtils.getOneRandom(field.choices);
					};
				}
			}
			else {
				fieldGenerator.type = 'SIMPLE';
				// Get the corresponding function
				fieldGenerator.fn = customFields[field.type];
				if (!fieldGenerator.fn) {
					// Check in the default fields
					fieldGenerator.fn = defaultFields[field.type];
					if (!fieldGenerator.fn) {
						throw new Error('The field "' + field.type + '" does not exist.');
					}
				}
			}
		}
		else {
			throw new Error('The field "' + key + '" is not a valid supported field.');
		}

		order.push(fieldGenerator);
	});

	// Second all fields that are requiredFields (create fields with them with type = 'OPTIONS')

	// Object.keys(specialFields).forEach(function (key, pos) {
	// 	// ....
	// 	var field = specialFields[key];

	// 	// Basic object to generate the field
	// 	var fieldGenerator = {
	// 		type: 'COMPLICATED',
	// 		name: key
	// 	};
	// });

	// Third ...

	this._fieldsOrder = order;
};


ModelGenerator.prototype.generate = function generate(nb, options, cb) {
	var self = this;

	// If there was no options, but only a callback
	if (typeof options === 'function') {
		cb = options;
		options = null;
	}

	if (self._requiredFields.length) {
		genUtils.validateRequiredOptions(self._requiredFields, options);
	}

	genUtils.getRangesFromOptions(self._ranges, options);


	async.times(nb, function (i, next) {

		var model = {};

		// Call all field generator functions in order
		try {
			// TODO : SIMPLE fields in parallel?
			self._fieldsOrder.forEach(function (obj, i) {
				switch (obj.type) {
					case 'SIMPLE':
						model[obj.name] = obj.fn();
						break;
					case 'RANGE':
						model[obj.name] = obj.fn(self._ranges[obj.name]);
						break;
					case 'OPTIONS':
						model[obj.name] = obj.fn(options[obj.name]);
						break;
					default:
						throw new Error('Unknown type "' + obj.type + '".');
				}
			});
		} catch (e) {
			return next(e, model);
		}

		next(null, model);
	}, cb);



	// NOTE : If required field is missing from the definition, AUTOMATICALLY take it from the options
	// NOTE: In multiple choices, if default is missing = choose randomly

};


//function afterFn(requiredField1, ..., requiredFieldX, generator) {
/*
   requiredField1,
   ...requiredFieldX,
   generator {
   model = current model
   faker
   ranges
   options = CANNOT BE NULL, at least {}
   }		
   */


//POSSIBLE RETURNS VALUES
/* 
   - NULL = will use the generator.model,
   Will be a problem if the user want to put null in the field
   - value = returns a new value for the field (the same as changing generator.model manually)
   */
//}

/*
   __dynamicFields : [
   {
   depends : '',
   afterFn : func(generator){

   }
   },
   function (generator) {
   ....
   RETURNS : null
   }
   ]

*/


var resultCB = function (err, result) {
	console.log('err', err);
	console.log('result', result);
};

var simpleModel = new ModelGenerator({
	firstName: defaultFields.FirstName,
	lastName: 'LastName',
	name: {
		type: 'Name'
	},
	email: {
		requires: ['firstName', 'lastName'],
		fn: defaultFields.Email
	},
	email2: {
		type: 'Email',
		requires: ['firstName', 'lastName']
	},
	type: {
		type: 'OPTIONS',
		choices: ['A', 'B', 'C'],
		default: 'B'
	},
	type2: {
		type: 'OPTIONS',
		choices: ['A', 'B', 'C'],
	},
	type3: {
		type: 'OPTIONS',
		choices: ['A', 'B', 'C'],
	},
	type4: {
		type: 'OPTIONS',
		default: 'Z',
	},
	// username: {
	// 	type: 'Username'
	// 	requires: ['firstName', 'lastName'],
	// },
	__dynamicFields: [
	{
		// Password 1
		after: function (generator) {
			var pw = generator.options.password;
			if (!pw) {
				var pwLength = utils.getRandomBetween(generator.ranges.passwordLength);
				pw = faker.internet.password(pwLength);
			}
			generator.model.password = pw;
		}
	},
	{
		// Password 2
		fn : defaultFields.Password,
		name : 'password'
	}
	],
	score: [0, 5]
}, 'type5');

simpleModel.generate(25, { type2: 'C', type5: 6 }, resultCB);

var user = new ModelGenerator(
		{
			__dynamicFields: [
			{
				// displayName
				requires: ['firstName', 'lastName'],
				after: function (firstName, lastName, generator) {
					generator.model.displayName = firstName + ' ' + lastName;
				}
			},
			{
				//TEST : displayName2 REMOVE THIS
				requires: ['displayName'],
				after: function (displayName, generator) {
					generator.model.displayName2 = displayName + '2';
				}
			},
			{
				//TEST : email2 REMOVE THIS
				requires: ['firstName', 'lastName'],
				after: function (firstName, lastName, generator) {
					generator.model.email2 = generator.faker.internet.email(firstName, lastName);
				}
			},
			{
				after: function (generator) {
					var pw = generator.options.password;
					if (!pw) {
						var pwLength = utils.getRandomBetween(generator.ranges.passwordLength);
						pw = faker.internet.password(pwLength);
					}
					generator.model.password = pw;
				}
			}
			],
			firstName: 'FirstName',
			lastName: 'LastName',
			email: {
				requires: ['firstName', 'lastName'],
				type: 'Email'
			},
			username: {
				requires: ['firstName', 'lastName'],
				type: 'Username'
			},
			avatar: 'Avatar',
			provider: {
				default: 'local'
			}
			// password: {
			// 	type: 'OPTIONS',
			// 	// requires: '',
			// 	after: function (generator) {

			// 		if (generator.model.password) {
			// 			return generator.model.password;
			// 		}
			// 		else {
			// 			var pwLength = utils.getRandomBetween(generator.ranges.passwordLength);
			// 			generator.model.password = faker.internet.password(pwLength);

			// 			return generator.model.password;
			// 		}
			// 	}
			// }
		},
{
	additionalRanges: {
		passwordLength: [8, 20]
	}
});

user.generate(1, { password: 'password' });


var activity = new ModelGenerator(
		{
			type: 'OPTIONS',
			authorId: 'OPTIONS',
			__dynamicFields: [
			{
				// ObjectId
				requires: ['type'],
				afterFn: function (type, generator) {
					generator.model[type + 'Id'] = generator.model.objectId;
				}
			},
			],
			// This will check the options with getRangesFromOptions, then get one random number in the range
			likes: [0, 100],
			dislikes: [0, 100]
		},
		{
			requiredFields: ['type', 'authorId', 'objectId']
		});

activity.generate(1, { authorid: 1, objectId: 1, type: 'list' }, resultCB);


var comment = new ModelGenerator({
	authorId: 'OPTIONS',
	activityId: 'OPTIONS',
	message: 'faker.lorem.sentences'
}, 'authorId,activityId');
comment.generate(1, { authorid: 1, activityId: 1 }, resultCB);


var note = new ModelGenerator({
	sizeX: [0, 10],
	sizeY: {
		range: [0, 10]
	},
	posX: [0, 10],
	posY: {
		range: [0, 10]
	},
	type: {
		type: 'OPTIONS',
		choices: ['Video', 'Link', 'Text'],
		default: 'Text'
	},
	title: 'faker.lorem.sentence',
	content: 'faker.lorem.paragraphs',
	// authorId: 'OPTIONS',
	// mediaId: 'OPTIONS'
}, 'authorId, mediaId');

note.generate(1, { authorid: 1, mediaId: 1 }, resultCB);

var review = new ModelGenerator({
	title: 'faker.lorem.sentence',
	score: [0, 5],
	text: 'faker.lorem.paragraphs',
	privacy: {
		type: 'OPTIONS',
		choices: ['Public', 'Private', 'Friends'],
		default: 'Public'
	},
	hasSpoiler: {
		type: 'OPTIONS',
		default: false
	},
	// authorId: 'OPTIONS',
	// mediaId: 'OPTIONS'
}, 'authorId, mediaId');

review.generate(1, { authorid: 1, mediaId: 1 }, resultCB);

var progress = new ModelGenerator({
	type: {
		type: 'OPTIONS',
		choices: ['inProgress', 'completed', 'suspended'],
		// default missing = choose randomly
	},
	// userId: 'OPTIONS',
	// showId: 'OPTIONS',
	// episodeId: 'OPTIONS'
}, 'userId, showId, episodeId');

review.generate(1, { userId: 1, showId: 1, episodeId: 1 }, resultCB);


var recommendation = new ModelGenerator({
	text: 'faker.lorem.sentences',
	// fromId: 'OPTIONS',
	// toId: 'OPTIONS',
	// mediaId : 'OPTIONS'
}, 'fromId, toId, mediaId');

recommendation.generate(1, { fromId: 1, toId: 1, mediaId: 1 }, resultCB);

var defaultDate = [new Date(), new Date()];
defaultDate[0].setDate(defaultDate[0].getDate() - 1);
defaultDate[1].setDate(defaultDate[1].getDate() + 1);

var calendarEvent = new ModelGenerator({
	title: 'faker.lorem.sentences',
	isVisible: {
		type: 'OPTIONS',
		default: true
	},
	startDate: {
		type: 'faker.date.between',
		range: defaultDate
	}
}, ['authorId', 'mediaId']);

calendarEvent.generate(1, { authorId: 1, mediaId: 1 }, resultCB);


var list = new ModelGenerator({
	name: 'faker.lorem.sentence',
	desc: 'faker.lorem.paragraph',
	privacy: {
		type: 'OPTIONS',
		choices: ['Public', 'Private', 'Friends'],
		default: 'Public'
	},
	type: {
		default: 'Custom'
	}
}, 'authorId');

list.generate(1, { authorId: 1 }, resultCB);


var movie = new ModelGenerator({
	title: {

	}
}, {});
