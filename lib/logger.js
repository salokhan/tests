'use strict';

const path = require('path');
const winston = require('winston');

const env = process.env.NODE_ENV || 'development';

let transports;
switch (env) {
  case 'production':
    transports = new (winston.transports.File)({
      'level'   : 'info',
      'filename': path.resolve(__dirname, '../logs/application.log'),
      'maxsize' : 1024 * 1024, // 1 MB
      'json'    : false
    });
    break;
  case 'test':
    transports = new (winston.transports.Console)({
      'level' : 'silly',
      'silent': true
    });
    break;
  default:
    transports = new (winston.transports.Console)({'level': 'debug'});
    break;
}

module.exports = new (winston.Logger)({'transports': [transports]});

