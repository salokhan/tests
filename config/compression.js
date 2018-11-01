'use strict';

const compression = require('compression');

module.exports = (app, done) => {
  app.use(compression({
    'filter': (req, res) => {
      // We dont want to compress any responses with this header
      if (req.headers['x-no-compression']) {
        return false;
      }

      // fallback to standard filter function
      return compression.filter(req, res);
    }
  }));

  done();
};
