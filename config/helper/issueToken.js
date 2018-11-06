'use strict';

const jwt = require('jsonwebtoken');
const issuer = 'my-awesome-website.com';
const sharedSecret = 'shh';

exports.issueToken = (username, role) => {
  const token = jwt.sign({
    'sub' : username,
    'iss' : issuer,
    'role': role
  }, sharedSecret);
  return token;
};
