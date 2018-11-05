'use strict';

const Promise = require('bluebird');
const models = require('../models');
const logger = require('../lib/logger');

module.exports = {
  // get countries
  'getCountries': (req, response) => {
    logger.log('Get called for counrtries');
    const result = {'results': [], 'message': '', 'total': ''};
    const query = req.query;

    const countryQuery = query.name ? {'name': {'$iLike': query.name}} : '';
    const countryAttribute = selectAttributes('Countries', query.field);
    return Promise.props({
      'count': models.Countries.count(),
      'rows' : models.Countries.findAll(
        {
          'where'     : countryQuery,
          'attributes': countryAttribute,
          'order'     : [
            createSortQuery(query.sort, query.order)
          ]
        }
      )
    })
      .then((Countries) => {
        result.total = Countries.count;
        return Promise.map(Countries.rows, (country) => {
          const data = {
            'code': country.code,
            'name': country.name
          };
          return data;
        });
      })
      .then((resData) => {
        result.total = 2;
        result.results = resData;
        result.message = 'Successfully Retrieved Countries';
        return response.status(200).send(result);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(invalidInputError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  }
};
const selectAttributes = (modelName, fields) => {
  switch (modelName) {
    case 'Countries': {
      if (fields.length > 0 && fields.split(',').indexOf('*') === -1) {
        return fields.split(',').map((val) => {
          if (val === 'code') {
            return 'code';
          } else if (val === 'name') {
            return val;
          }
          return undefined;
        }).filter((n) => n !== undefined);
      }
      return ['name', 'code'];
    }
    default: {
      return 1;
    }
  }
};
const createSortQuery = (key, order) => {
  switch (key) {
    case 'code': {
      return [key, order];
    }
    case 'name': {
      return [key, order];
    }
    default: {
      return ['name', order];
    }
  }
};
const invalidInputError = () => {
  const error = new Error('Invalid Input');
  error.name = 'InvalidInputError';
  return error;
};

// return status body
const invalidData = (err, status) => ({
  'status' : status,
  'code'   : err.code,
  'message': 'Invalid Input',
  'error'  : err
});
