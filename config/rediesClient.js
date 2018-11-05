/* eslint-disable no-console */
'use strict';

const redis = require('redis');

module.exports = (app, done) => {
  const port = '6379';
  const host = '127.0.0.1';
  const client = redis.createClient(port, host); // creates a new client
  client.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('connected ****************************************');
  });
  client.set('framework', 'AngularJS');
  // eslint-disable-next-line handle-callback-err
  client.get('framework', (err, reply) => {
    // eslint-disable-next-line no-console
    console.log(reply);
  });
  client.on('error', (err) => {
    console.log(`Something went wrong ${  err}`);
  });
  done();
};
