'use strict';

const bodyParser = require('body-parser');
const morgan = require('morgan');
module.exports = (app, cb) => {
  // Configure the request logger middleware
  //  Only if we're not in a test environment
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({'extended': false}));

  // Disallow robots from indexing api
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  });

  // 404 if none of the routes were hit
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Error Response
  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = err || {};

    res.statusCode = err.status || 500;
    res.send('error');
    next();
  });

  cb();
};
