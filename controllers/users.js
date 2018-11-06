'use strict';

const models = require('../models');
const logger = require('../lib/logger');

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
    logger.log('Post signup call for user');
    return models.Users.create({
      'userName': userBody.userName.trim(),
      'pass'    : userBody.firstName.trim(),
      'lastName': userBody.firstName.trim(),
      'email'   : userBody.email.trim(),
      'password': userBody.password,
      'where'   : {'userName': userBody.userName.trim()}

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
  }
};

// return status body
const invalidData = (err, status) => ({
  'status' : status,
  'code'   : err.code,
  'message': 'Invalid Input',
  'error'  : err
});
