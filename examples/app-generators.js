'use strict';

/*
 * Basic Models generators for the test helper app
 */

/*
 * Dependencies
 */
const async = require('async'),
    genUtils = require('../index.js').Utils,
    faker = require('faker');

module.exports = {

    User(nb, options, cb) {

        // If there was no options, but only a callback
        if (typeof options === 'function') {
            cb = options;
            options = null;
        }

        let ranges = {
            passwordLength: [8, 20]
        };

        let defaultPassword;
        if (options) {
            genUtils.getRangesFromOptions(ranges, options);
            defaultPassword = options.password;
        }

        // Runs this in parallel to be faster when nb is high
        async.times(nb, function(i, next) {
            let fName = faker.name.firstName();
            let lName = faker.name.lastName();

            let password = defaultPassword;
            // If there is no global password, generate one
            if (!password) {
                let pwLength = genUtils.getRandomBetween(ranges.passwordLength);
                password = faker.internet.password(pwLength);
            }

            let user = {
                firstName: fName,
                lastName: lName,
                displayName: fName + ' ' + lName,
                email: faker.internet.email(fName, lName),
                username: faker.internet.userName(fName, lName),
                avatar: faker.image.avatar(),
                password: password
            };

            next(null, user);
        }, cb);
    },
    Note(nb, options, cb) {

        // If there was no options, but only a callback
        if (typeof options === 'function') {
            cb = options;
            options = null;
        }

        try {
            genUtils.validateRequiredOptions(['authorId', 'mediaId'], options);
        } catch (err) {
            return cb(err);
        }

        let ranges = {
            sizeX: [0, 10],
            sizeY: [0, 10],
            posX: [0, 10],
            posY: [0, 10]
        };

        genUtils.getRangesFromOptions(ranges, options);

        let type = options.type || 'Text';

        async.times(nb, function(i, next) {

            let posX = genUtils.getRandomBetween(ranges.posX);
            let posY = genUtils.getRandomBetween(ranges.posY);
            let sizeX = genUtils.getRandomBetween(ranges.sizeX);
            let sizeY = genUtils.getRandomBetween(ranges.sizeY);

            let note = {
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

            next(null, note);
        }, cb);
    },
    Movie(nb, options, cb) {

        // If there was no options, but only a callback
        if (typeof options === 'function') {
            cb = options;
            options = null;
        }

        // Init random ranges for options
        let ranges = {
            imdbRating: [0, 10],
            imdbCount: [0, 10000],
            images: [0, 5],
            runtime: [2, 200],
            cast: [2, 5],
            genres: [1, 3],
        };

        if (options) {
            genUtils.getRangesFromOptions(ranges, options);
        }

        // Runs this in parallel to be faster when nb is high
        async.times(nb, function(i, next) {

            // Get random values within the specified range
            let imdbRating = genUtils.getRandomBetween(ranges.imdbRating);
            let imdbCount = genUtils.getRandomBetween(ranges.imdbCount);
            let nbImages = genUtils.getRandomBetween(ranges.images);
            let runtime = genUtils.getRandomBetween(ranges.runtime);
            let nbCast = genUtils.getRandomBetween(ranges.cast);
            let nbGenres = genUtils.getRandomBetween(ranges.genres);

            let images = [];
            for (let i = 0; i < nbImages; i++) {
                images.push(faker.image.image());
            }

            let cast = [];
            for (let i = 0; i < nbCast; i++) {
                cast.push(faker.fake('{{name.lastName}} {{name.firstName}}'));
            }

            let imdbId = 'tt' + (Math.floor(Math.random() * 800000) + 100000);
            let releaseDate = faker.date.past();
            let genres = faker.lorem.words(Math.max(0, nbGenres));

            let media = {
                title: faker.commerce.productName() + ' : The movie',
                desc: faker.lorem.sentences(),
                releaseDate: releaseDate,
                cast: cast,
                genres: genres,
                imdbId: imdbId,
                imdbRating: imdbRating,
                imdbCount: imdbCount,
                years: releaseDate.getFullYear().toString(),
                images: images,
                runtime: runtime
            };

            next(null, media);
        }, cb);
    }
};
