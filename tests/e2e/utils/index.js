'use strict';

const app = require('../../../config/app');
const models = require('../../../models');

/**
  * Helper to start server ONCE for a given test run
  **/
let appStarted;
exports.initTests = () => {
  before((done) => {
    if (appStarted) {
      return done();
    }
    return app.start(() => {
      appStarted = true;
      return done();
    });
  });
};

/**
  * Helper to drop and re-sync the test db's tables and re-initialize them
  **/
exports.cleanDB = () => models.sequelize.drop({'cascade': true})
  .then(() => models.sequelize.sync({'force': true}));


// Environment convenience variables
const port = process.env.PORT || 8080;
exports.apiUrl = process.env.API_URL || `http://localhost:${port}`;

// Controller test utils
exports.suppliers = require('./suppliers');
exports.currencies = require('./currencies');
exports.terms = require('./terms');
