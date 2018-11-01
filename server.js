'use strict';

const app = require('./config/app');
const logger = require('./lib/logger');

app.start(() => {
  logger.info('API Started');
});
