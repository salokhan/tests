'use strict';

const jwt = require('jsonwebtoken');
const issuer = 'localhost';
const subject = 'salman';
const audience = 'salman';
const fs = require('fs');
const path = require('path');
const publicKey = fs.readFileSync(path.resolve(__dirname, './public.key'), 'utf8');
const privateKey = fs.readFileSync(path.resolve(__dirname, './private.key'), 'utf8');

const loggedOutToken = [];

// Here we setup the security checks for the endpoints
// that need it (in our case, only /protected). This
// function will be called every time a request to a protected
// endpoint is received
exports.verifyToken = (req, authOrSecDef, token, cb) => {
  // these are the scopes/roles defined for the current endpoint
  const currentScopes = req.swagger.operation['x-security-scopes'];

  function sendError() {
    return req.res.status(403).json({'message': 'Error: Access Denied'});
  }
  // validate the 'Authorization' header. it should have the following format:
  // 'Bearer tokenString'
  if (token && token.indexOf('Bearer ') === 0) {
    const tokenString = token.split(' ')[1];

    jwt.verify(tokenString, publicKey, (verificationError, decodedToken) => {
      // check if the JWT was verified correctly
      if (verificationError === null && Array.isArray(currentScopes) && decodedToken && decodedToken.role) {
        // check if the role is valid for this endpoint
        const roleMatch = currentScopes.indexOf(decodedToken.role) !== -1;
        // check if the issuer matches
        const issuerMatch = decodedToken.iss === issuer;

        // you can add more verification checks for the
        // token here if necessary, such as checking if
        // the username belongs to an active user

        if (roleMatch && issuerMatch) {
          // add the token to the request so that we
          // can access it in the endpoint code if necessary
          req.auth = decodedToken;
          // if there is no error, just return null in the callback
          return cb();
        }
        // return the error in the callback if there is one
        return sendError();
      }
      // return the error in the callback if the JWT was not verified
      return sendError();
    });
  } else {
  // return the error in the callback if the Authorization header doesn't have the correct format
    sendError();
  }
};
exports.logOutToken = (username, token) => {
  loggedOutToken.push({'username': username, 'token': token});
};

exports.issueToken = (username, role, iss) => {
  const token = jwt.sign({
    // payload
    'user': username,
    'role': role
  },
  // key 
  privateKey,
  {
    // signoptions
    'issuer'   : iss,
    'subject'  : subject,
    'audience' : audience,
    'algorithm': 'RS256',
    'expiresIn': '2h'
  });
  return token;
};
