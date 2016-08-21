'use strict';

const generators = require('../examples/app-generators.js'),
    should = require('should');


describe('Examples Generators', () => {

    describe('#User', () => {

        it('should return the right amount of entities', (done) => {

            const nbUsers = 5;
            generators.User(nbUsers, {}, (err, users) => {
                should.equal(users.length, nbUsers);
                done();
            });
        });

        it('should use the global password when provided', (done) => {

            const globalPassword = 'Th3_Sup3r_S3cr3t_P4$$word';
            generators.User(1, {
                password: globalPassword
            }, (err, users) => {
                should.equal(users[0].password, globalPassword);
                done();
            });
        });

        it('should have all the required field', (done) => {

            generators.User(1, {}, (err, users) => {
                let user = users[0];

                should.exist(user.avatar);
                should.exist(user.displayName);
                should.exist(user.email);
                should.exist(user.firstName);
                should.exist(user.lastName);
                should.exist(user.password);
                should.exist(user.username);

                done();
            });
        });

        it('should have a password with a valid length', (done) => {
            let passwordOptions = {
                min: 4,
                max: 24
            };

            generators.User(1, {
                passwordLength: passwordOptions
            }, (err, users) => {
                let user = users[0];

                user.password.length.should.be.aboveOrEqual(passwordOptions.min);
                user.password.length.should.be.belowOrEqual(passwordOptions.max);
                done();
            });
        });
    });

    describe('#Note', () => {

        it('should return the right amount of entities', (done) => {

            const nbNotes = 50;
            generators.Movie(nbNotes, {}, (err, notes) => {
                should.equal(notes.length, nbNotes);
                done();
            });
        });

        it('should return an error when required fields are missing', (done) => {
            generators.Note(1, (err) => {
                should.exist(err);
                err.message.should.match(/options/);
                done();
            });
        });

        it('should be able to set ranges options', (done) => {
            let options = {
                authorId: 1,
                mediaId: 5,
                sizeX: 5,
                sizeY: [0, 3],
                posX: [0, 25],
                posY: [0, 30]
            };

            generators.Note(1, options, (err, notes) => {
                let note = notes[0];

                // sizeX
                note.sizeX.should.be.equal(options.sizeX);

                // sizeY
                note.sizeY.should.be.aboveOrEqual(options.sizeY[0]);
                note.sizeY.should.be.belowOrEqual(options.sizeY[1]);

                // posX
                note.posX.should.be.aboveOrEqual(options.posX[0]);
                note.posX.should.be.belowOrEqual(options.posX[1]);

                // posY
                note.posY.should.be.aboveOrEqual(options.posY[0]);
                note.posY.should.be.belowOrEqual(options.posY[1]);

                done();
            });
        });
    });

    describe('#Movie', () => {
        it('should return the right amount of entities', (done) => {

            const nbMovies = 26;
            generators.Movie(nbMovies, {}, (err, movies) => {
                should.equal(movies.length, nbMovies);
                done();
            });
        });

    });
});
