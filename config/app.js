'use strict';

const async = require('async');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;
const models = require('../models');
const logger = require('../lib/logger');

module.exports.start = (done) => {
  async.series([
    (cb) => {
      logger.info('Initializing Sequelize and connecting to database');
      models.sequelize.sync().then(() => cb());
    },
    (cb) => {
      logger.info('Initializing server response compression');
      require('./compression')(app, cb);
    },
    (cb) => {
      logger.info('Initializing DB');
      require('./initDB')(app, cb);
    },
    (cb) => {
      logger.info('Initializing swagger middleware');
      require('./swagger')(app, cb);
    },
    (cb) => {
      logger.info('Initializing express middleware');
      require('./express')(app, cb);
    }
  ], (err) => {
    if (err) {
      logger.error('Could not start app', err);
      throw new Error('Could not start app');
    }
    exports.countries = require('../tests/e2e/utils/countries');
    app.listen(port);
    logger.info('API listening on port', port);
    done();
  });
};
