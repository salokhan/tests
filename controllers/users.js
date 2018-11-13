'use strict';

const models = require('../models');
const logger = require('../lib/logger');
const bcrypt = require('bcrypt');
const auth = require('../config/helper/auth');

module.exports = {
  'signup': (req, response) => {
    const userBody = req.body;
    logger.log('Post signup call for user');
    return models.Users.create({
      'userName' : userBody.userName.trim(),
      'firstName': userBody.firstName.trim(),
      'lastName' : userBody.firstName.trim(),
      'email'    : userBody.email.trim(),
      'password' : userBody.password,
      'where'    : {'userName': userBody.userName.trim()}

    })
      .then((user) => {
        const responseObj = {
          'data':
          {
            'userName' : user.userName,
            'firstName': user.firstName,
            'lastName' : user.lastName,
            'email'    : user.email
          },
          'message': 'Successfully Created User'
        };
        return response.status(200).send(responseObj);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  'login': (req, response) => {
    const userBody = req.body;
    const userName = userBody.userName;
    const userPassword = userBody.password;
    logger.log('Post login call for user');

    return models.Users.findOne({'where': {'userName': userName.trim()}, 'rejectOnEmpty': true})
      .then((user) =>
        bcrypt.compareSync(userPassword, user.password)
      )
      .then((validUser) => {
        if (validUser) {
          const tokenString = auth.issueToken(userName, 'user', req.hostname);
          const responseObj = {
            'data':
              {'apiKey': tokenString},
            'message': 'Successfully logged in User'
          };
          return response.status(200).send(responseObj);
        }
        throw invalidUsernameOrPasswordError();
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(404).send(InvalidUser(err, 404));
      })
      .catch(invalidUsernameOrPasswordError, (err) => {
        response.status(404).send(InvalidUser(err, 404));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  'updateGeneralDetails': (req, response) => {
    const userBody = req.body;
    const currentUser = req.auth.user;
    logger.log('Post login call for user general detail');
    return models.Users.findOne({'where': {'userName': currentUser.trim()}, 'rejectOnEmpty': true})
      .then((user) =>
        user.update({
          'firstName'  : userBody && userBody.firstName ? userBody.firstName : user.firstName,
          'lastName'   : userBody && userBody.lastName ? userBody.lastName : user.lastName,
          'displayName': userBody && userBody.displayName ? userBody.displayName : '',
          'email'      : userBody && userBody.email ? userBody.email : '',
          'about'      : userBody && userBody.about ? userBody.about : '',
          'gender'     : userBody && userBody.gender ? userBody.gender : user.gender,
          'title'      : userBody && userBody.title ? userBody.title : user.title
        }))
      .then((user) => {
        const responseObj = {
          'data': {
            'title'      : user.title,
            'gender'     : user.gender,
            'firstName'  : user.firstName,
            'lastName'   : user.lastName,
            'displayName': user.displayName,
            'email'      : user.email,
            'about'      : user.about
          },
          'message': 'Successfully Updated User General Details'
        };
        return response.status(200).send(responseObj);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(404).send(InvalidUser(err, 404));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  'logout': (req, response) => {
    const userBody = req.body;
    logger.log('Post logout call for user');
    return models.Users.findOne({'where': {'userName': userBody.userName.trim()}})
      .then(() => {
        const responseObj = {
          'data':
            {'apiKey': ''},
          'message': 'Successfully logged out user'
        };
        return response.status(200).send(responseObj);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(404).send(invalidData(err, 404));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  }
};

// return status body
const invalidData = (err, status) => ({
  'status' : status,
  'code'   : err.code,
  'message': 'Invalid Input',
  'error'  : err
});

// return status body
const InvalidUser = (err, status) => ({
  'status' : status,
  'code'   : err.code,
  'message': 'Username or password is incorrect',
  'error'  : err
});

const invalidUsernameOrPasswordError = () => {
  const error = new Error('Username or password is incorrect');
  error.name = 'invalidUsernameOrPasswordError';
  return error;
};
