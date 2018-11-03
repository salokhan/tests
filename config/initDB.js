'use strict';
const initDB = require('../tests/e2e/utils/countries');

module.exports = (app, done) => {
    initDB.initCounrtiesDB();
    done();
}
