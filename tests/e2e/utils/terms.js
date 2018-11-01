'use strict';

const models = require('../../../models');

/**
  * Helper to Pre-Populate Test DB with Test data
  **/
exports.prePopulateDB = () => models.Terms.bulkCreate([
  {
    'name': 'test1',
    'days': '1'
  }
]);
