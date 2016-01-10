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
	util = require('util'),
	genUtils = require('./tests-helper-generators-utils'),
	faker = require('faker'),
	utils = require(path.resolve('./app/utilities.server'));

var generators = module.exports = {

	User: function userGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		var ranges = {
			passwordLength: [8, 20]
		};

		var globalPass;
		if (options) {

			genUtils.getRangesFromOptions(ranges, options);

			globalPass = options.password;
			
			// TODO : Multiple providers, options.providers = ['local', 'facebook'];
			// Randomize between all the providers
			// if (provider !== 'local'){ // do not set the password and other fields}
			// Also, add a providerNb, ex providerNb = 3: provider = local, additionnalProvider : { google : {}, facebook : {}, twitter : {}}
			// max of provider nb = options.providers + 1
			// if (nbProviders === (options.providers + 1)) the provider must be local and set addtionnal ones to all the others
			// NOTE: This would also require providerData
		}
	
		// Runs this in parallel to be faster when nb is high
		async.times(nb, function (i, next) {
			var fName = faker.name.firstName();
			var lName = faker.name.lastName();

			var password = globalPass;
			// If there is no global password, generate one
			if (!password) {
				var pwLength = utils.getRandomBetween(ranges.passwordLength);
				password = faker.internet.password(pwLength);
			}

			var user = {
				firstName: fName,
				lastName: lName,
				displayName: fName + ' ' + lName,
				email: faker.internet.email(fName, lName),
				username: faker.internet.userName(fName, lName),
				avatar: faker.image.avatar(),
				password: password,
				provider: 'local'
			};

			next(null, user);
		}, cb);
	},
	BasicActivity: function basicActivityGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		// Init random ranges for certain params
		// var ranges = {
		// 	likes: [0, 100],
		// 	dislikes: [0, 100]
		// };
		
		// TODO: 
		// To make this generator Viable, we need: A range of types, with authors, ids, verbs for each
		/*
		ex: options: {
			types : {
				list : {
					ids : [...],
					authorIds : [...],
					verbs : [...],
					data : [...],
					privacies : [...] // This ovverides the global privacies if available
				},
				review : {
					ids : [...],
					authorIds : [...],
					verbs : [...],
					data : [...],
					privacies : [...] // This ovverides the global privacies if available
				},
				...
			},
			privacies : [...]
		}
		
		An array of types will be generated from this.
		
		ex : var types : [{
			type : 'list',
			ids : [1, 4, 6],
			authorsIds : [ 2 ],
			verbs : [ 'added', 'updated' ],
			data : ?,
			privacies : ['public']
		},
		{
			....
		}];
		
		*/

		genUtils.validateRequiredOptions(['authorId', 'objectId', 'type'], options);

		var authorId = options.authorId;
		var objectId = options.objectId;
		var type = options.type;
		var privacy = options.privacy || 'Public';

		// genUtils.getRangesFromOptions(ranges, options);

		async.times(nb, function (i, next) {

			// var nbLikes = utils.getRandomBetween(ranges.likes);
			// var nbDislikes = utils.getRandomBetween(ranges.dislikes);

			var act = {
				type: type,
				// likes: nbLikes,
				// dislikes: nbDislikes,
				authorId: authorId,
				privacy: privacy
			};

			act[type + 'Id'] = objectId;

			next(null, act);

		}, cb);
	},
	MultipleListsActitity: function (nb, options, cb) {
		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		genUtils.validateRequiredOptions(['authorId', 'lists'], options);
		
		//Validate options.lists = { id, privacy, etc...}
		options.lists.forEach(function (elem) {
			if (isNaN(elem.id)) {
				throw new Error('The options.lists object requires an id.');
			}
		});

		async.times(nb, function (i, next) {

			var list = options.lists[i];

			var listOptions = util._extend({}, options);
			listOptions.privacy = list.privacy || options.privacy;
			listOptions.objectId = list.id;
			listOptions.type = 'list';

			try {
				generators.BasicActivity(1, listOptions, next);
			}
			catch (err) {
				next(err);
			}
		}, function (err, results) {
			if(err){
				return cb(err);
			}
			
			// Flattens all the arrays into one
			cb(err, Array.prototype.concat.apply([], results));
		});


	},
	Comment: function commentGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		genUtils.validateRequiredOptions(['authorId', 'activityId'], options);

		var authorId = options.authorId;
		var activityId = options.activityId;

		async.times(nb, function (i, next) {

			var comment = {
				authorId: authorId,
				activityId: activityId,
				message: faker.lorem.sentences()
			};

			next(null, comment);

		}, cb);
	},
	Note: function noteGenerator(nb, options, cb) {


		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		genUtils.validateRequiredOptions(['authorId', 'mediaId'], options);

		var ranges = {
			sizeX: [0, 10],
			sizeY: [0, 10],
			posX: [0, 10],
			posY: [0, 10]
		};

		genUtils.getRangesFromOptions(ranges, options);

		var type = options.type || 'Text';


		async.times(nb, function (i, next) {

			var posX = utils.getRandomBetween(ranges.posX);
			var posY = utils.getRandomBetween(ranges.posY);
			var sizeX = utils.getRandomBetween(ranges.sizeX);
			var sizeY = utils.getRandomBetween(ranges.sizeY);

			var note = {
				title: faker.lorem.sentence(),
				content: faker.lorem.paragraphs(),
				type: type,
				authorId: options.authorId,
				mediaId: options.mediaId,
				posX: posX,
				posY: posY,
				sizeX: sizeX,
				sizeY: sizeY,
			};

			if (type === 'Video' || type === 'Link') {
				note.noteUrl = faker.internet.url();
			}

			next(null, note);

		}, cb);

	},
	Review: function reviewGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		genUtils.validateRequiredOptions(['authorId', 'mediaId'], options);

		var ranges = {
			score: [0, 5],
		};

		genUtils.getRangesFromOptions(ranges, options);

		var privacy = options.privacy || 'Public';
		var hasSpoiler = options.hasSpoiler || false;

		async.times(nb, function (i, next) {

			var score = utils.getRandomBetween(ranges.score);

			var review = {
				title: faker.lorem.sentence(),
				score: score,
				text: faker.lorem.paragraphs(),
				privacy: privacy,
				hasSpoiler: hasSpoiler,
				authorId: options.authorId,
				mediaId: options.mediaId
			};

			next(null, review);

		}, cb);

	},
	Progress: function progressGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		genUtils.validateRequiredOptions(['userId', 'showId', 'episodeId'], options);

		var possibleTypes = ['inProgress', 'completed', 'suspended'];

		async.times(nb, function (i, next) {
			var type = options.type || genUtils.getOneRandom(possibleTypes);

			var progress = {
				type: type,
				userId: options.userId,
				showId: options.showId,
				episodeId: options.episodeId,
			};

			next(null, progress);

		}, cb);
	},
	Recommendation: function recommendationGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		genUtils.validateRequiredOptions(['fromId', 'toId', 'mediaId'], options);

		async.times(nb, function (i, next) {

			var recommendation = {
				text: faker.lorem.sentences(),
				fromId: options.fromId,
				toId: options.toId,
				mediaId: options.mediaId
			};

			next(null, recommendation);
		}, cb);

	},
	CalendarEvent: function calendarEventGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		genUtils.validateRequiredOptions(['authorId', 'mediaId'], options);

		// Setup default startDate range
		var defaultDate = [new Date(), new Date()];
		defaultDate[0].setDate(defaultDate[0].getDate() - 1);
		defaultDate[1].setDate(defaultDate[1].getDate() + 1);

		var ranges = {
			startDate: defaultDate
		};
		
		// ranges.startDate.min.setDate(ranges.startDate.min.getDate() - 1);
		// ranges.startDate.max.setDate(ranges.startDate.max.getDate() + 1);

		genUtils.getRangesFromOptions(ranges, options);

		if (typeof ranges.startDate.min !== 'object' && !isNaN(ranges.startDate.min)) {
			ranges.startDate.min = new Date(ranges.startDate.min);
		}

		if (typeof ranges.startDate.max !== 'object' && !isNaN(ranges.startDate.max)) {
			ranges.startDate.max = new Date(ranges.startDate.max);
		}

		var authorId = options.authorId;
		var mediaId = options.mediaId;
		var isVisible = options.isVisible || true;

		async.times(nb, function (i, next) {

			var startDate = faker.date.between(
				ranges.startDate.min,
				ranges.startDate.max);

			var calendarEvent = {
				title: faker.lorem.sentence(),
				authorId: authorId,
				mediaId: mediaId,
				isVisible: isVisible,
				startDate: startDate
			};

			next(null, calendarEvent);
		}, cb);
	},
	List: function listGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		genUtils.validateRequiredOptions(['authorId'], options);

		var authorId = options.authorId;
		var privacy = options.privacy || 'Public';
		var type = options.type || 'Custom';

		async.times(nb, function (i, next) {

			var list = {
				name: faker.lorem.sentence(),
				desc: faker.lorem.paragraph(),
				authorId: authorId,
				privacy: privacy,
				type: type
			};

			next(null, list);

		}, cb);
	},
	/*
		// Default values
		options : {
			imdbRating: [0, 10],
			imdbCount: [0, 10000],
			images: [0, 5],
			runtime: [2, 200],
			cast: [2, 5],
			genres: [1, 3],
			episodesPerSeason: [10, 25],
			type : 'movie',
			showId : null
		}
	*/
	Media: function mediaGenerator(nb, options, cb) {

		// If there was no options, but only a callback
		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		// Init random ranges for certain params
		var ranges = {
			imdbRating: [0, 10],
			imdbCount: [0, 10000],
			images: [0, 5],
			runtime: [2, 200],
			cast: [2, 5],
			genres: [1, 3],
			episodesPerSeason: [10, 25],
		};
		
		// TODO : Add a seasons array : options.seasons = [5, 7, 12, 6]
		// For TV Shows to set the number of episodes
		// If nb > sum of options.seasons, add an additonnal season for the rest
		// ex. nb = 40, options.seasons = [12, 10, 11], then add a 4th seasons of 7 episodes

		var type = 'movie';

		if (options) {
			if (options.type) {
				type = options.type;
			}

			switch (type) {
				case 'episode':
					genUtils.validateRequiredOptions(['showId'], options);

					break;

				case 'movie':
				case 'show':
					break;

				default:
					return cb('The media type "' + type + '" is not a valid type for the generator.');
			}

			genUtils.getRangesFromOptions(ranges, options);
		}


		// For episodes
		var episodesPerSeason = utils.getRandomBetween(ranges.episodesPerSeason);
	
		// Runs this in parallel to be faster when nb is high
		async.times(nb, function (i, next) {
		
			// Get random values within the specified range
			var imdbRating = utils.getRandomBetween(ranges.imdbRating);
			var imdbCount = utils.getRandomBetween(ranges.imdbCount);
			var nbImages = utils.getRandomBetween(ranges.images);
			var runtime = utils.getRandomBetween(ranges.runtime);
			var nbCast = utils.getRandomBetween(ranges.cast);
			var nbGenres = utils.getRandomBetween(ranges.genres);

			var images = [];
			for (var j = 0; j < nbImages; j++) {
				images.push(faker.image.image());
			}

			var cast = [];
			for (var k = 0; k < nbCast; k++) {
				cast.push(faker.fake('{{name.lastName}} {{name.firstName}}'));
			}

			var imdbId = 'tt' + (Math.floor(Math.random() * 800000) + 100000);
			var tvdbId = (Math.floor(Math.random() * 900000) + 100000).toString();
			var releaseDate = faker.date.past();

			var genres = faker.lorem.words(Math.max(0, nbGenres));

			var media = {
				title: faker.commerce.productName() + ' : The ' + type,
				desc: faker.lorem.sentences(),
				releaseDate: releaseDate,
				cast: cast,
				genres: genres,
				imdbId: imdbId,
				tvdbId: tvdbId,
				imdbRating: imdbRating,
				imdbCount: imdbCount,
				years: releaseDate.getFullYear().toString(),
				images: images,
				runtime: runtime,
				type: type
			};

			// Additonnal data for episode
			if (type === 'episode') {
				media.episodeNumber = (i % episodesPerSeason) + 1;
				media.episodeSeason = Math.floor(i / episodesPerSeason) + 1;
				media.showId = options.showId;
			}

			next(null, media);
		}, cb);
	}
	// // A Jack-of-all-trades generator, that automatically generate data from the fields provided
	// _basic : function basicGenerator(nb, options, done) {

	// 	if (!options || typeof options === 'function') {
	// 		var e = new Error('Missing required options to generate the model stub.');
	// 		if (done) {
	// 			return done(e);
	// 		}
	// 		throw e;
	// 	}

	// 	if (!options.fields || !Array.isArray(options.fields)) {
	// 		if (!options.modelName) {
	// 			var e = new Error('Missing required options.modelName to generate the model stub.');
	// 			if (done) {
	// 				return done(e);
	// 			}
	// 			throw e;
	// 		}
		
	// 		// Get fields from the model
	// 		var model = this._db[options.modelName];
		
	// 		// TODO : For each fields, get the type & generate a valid value for that type
	// 		// Exemple : fields.push({ name : 'firstName', type : 'string'});
		
	// 	}

	// 	var models = [];
	
	// 	var fields = [];
	
	// 	// var fields = [
	// 	// 	'firstName',
	// 	// 	'lastName',
	// 	// 	'displayName',
	// 	// 	'email',
	// 	// 	'username',
	// 	// 	'password',
	// 	// 	'provider'
	// 	// ];

	// 	for (var i = 0; i < nb; i++) {
	// 		var obj = {};
	// 		for (var f in fields) {
	// 			obj[f] = f + i;
	// 		}
	// 		models.push(obj);
	// 	}

	// 	done && done(null, models);
	// 	return models;
	// }
};