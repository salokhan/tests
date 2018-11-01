'use strict';

const _ = require('lodash');
const fs = require('fs');
const initializeSwagger = require('swagger-tools').initializeMiddleware;
const jsonRefs = require('json-refs');
const path = require('path');
const swaggerui = require('swagger-ui-express');
const yaml = require('js-yaml');

const logger = require('../lib/logger');

module.exports = (app, done) => {
  const swaggerObject = {};

  // Read and combine the swagger yaml files into one swagger object
  fs.readdirSync(path.resolve(__dirname, '../swagger'))
    .filter((file) => _.endsWith(file, '.yaml')).forEach((file) => {
      const subObject = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '../swagger', file)));
      _.merge(swaggerObject, subObject);
      logger.info('Swagger Loaded', file);
    });

  initializeSwagger(swaggerObject, (swaggerMiddleware) => {
    app.use(swaggerMiddleware.swaggerMetadata());
    app.use(swaggerMiddleware.swaggerValidator());
    app.use(swaggerMiddleware.swaggerRouter({
      'controllers': path.resolve(__dirname, '../controllers'),
      'useStubs'   : false // Do not use mock stubs
    }));

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
      jsonRefs.resolveRefs(swaggerObject, {
        'filter'       : ['relative'],
        'loaderOptions': {'processContent': (res, cb) => cb(undefined, yaml.safeLoad(res.text))}
      }).then((result) => {
        app.use('/api-docs', swaggerui.serve, swaggerui.setup(result.resolved));
        logger.info('Swagger UI generated');
        done();
      }).catch((err) => {
        logger.info('Swagger UI failed to generate');
        done(err);
      });
    } else {
      done();
    }
  });
};
