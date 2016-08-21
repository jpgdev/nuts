'use strict';

var Sequelize = require('sequelize');

var config = {
    db: {
        name: process.env.PG_BD_NAME || 'test',
        username: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'password123',
        host: process.env.PG_HOST || 'localhost',
        post: process.env.PG_PORT || '5432'
    }
};

var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres'
});

// TODO : Sync database

module.exports = {
    sequelize: sequelize
};
