'use strict';
const Promise = require('bluebird');
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
    const state = userBody.addressPersonal && userBody.addressPersonal.state;
    const city = userBody.addressPersonal && userBody.addressPersonal.city;
    const countryCode = userBody.addressPersonal && userBody.addressPersonal.country;
    const contacts = userBody.contactsPersonal;
    const Op = models.sequelize.Op;
    logger.log('Post login call for user general detail');

    return models.sequelize.transaction({'autocommit': true}, (t) => Promise.props({
      'country': countryCode ? models.Countries.findOne({
        'where'      : {'code': countryCode},
        'transaction': t
      }) : '',
      'state': state ? models.States.findCreateFind({
        'where'      : {'state': state, 'countryCode': countryCode},
        'transaction': t
      }) : '',
      'city': city ? models.Cities.findCreateFind({
        'where'      : {'city': city, 'countryCode': countryCode, 'stateName': state},
        'transaction': t
      }) : '',
      // if address personal have address id update else find or create a new address
      // eslint-disable-next-line no-nested-ternary
      'userAddress': userBody.addressPersonal
        ? userBody.addressPersonal && (!userBody.addressPersonal.addressID
          || userBody.addressPersonal.addressID === '' || userBody.addressPersonal.addressID === 'string')
          ? models.AddressPersonal.findOrCreate(
            {
              'defaults': {
                'country'    : userBody.addressPersonal.country,
                'state'      : userBody.addressPersonal.state,
                'city'       : userBody.addressPersonal.city,
                'addressLine': userBody.addressPersonal.addressLine
              },
              'where'      : {'UserUserName': currentUser.trim()},
              'transaction': t
            }).spread((createAddress) => createAddress)
          : models.AddressPersonal.update(
            {
              'country'     : userBody.addressPersonal.country,
              'state'       : userBody.addressPersonal.state,
              'city'        : userBody.addressPersonal.city,
              'addressLine' : userBody.addressPersonal.addressLine,
              'UserUserName': currentUser.trim()
            }, {
              'where': {
                'addressPersonalUUID': userBody.addressPersonal.addressID,
                'UserUserName'       : currentUser.trim()
              }
            }).spread((updatedAddress) => updatedAddress)
        : '',
      'userContacts': Promise.map(contacts ? contacts : [], (contact) =>
        models.ContactsPersonals.findCreateFind(
          {
            'where': {
              [Op.or]  : [{'UserUserName': currentUser.trim()}, {'UserUserName': null}],
              'contact': contact
            },
            // {'UserUserName': {[Op.or]: [currentUser.trim(), '']}, 'contact': contact},
            'transaction': t
          }).spread((createdContact) => createdContact)),
      'user': models.Users.findOne({'where': {'userName': currentUser.trim()}})
    }))
      .then((data) =>
        Promise.props({
          // set address only if new created isNAN is checked in case of update becuase it return numeric 0 or 1
          'setAddress': data.userAddress && isNaN(data.userAddress)
            ? data.user.setAddressPersonals(data.userAddress) : '',
          'setContacts': data.userContacts ? data.user.setContactsPersonals(data.userContacts) : ''
        })
      )
      .then(() =>
        models.Users.update({
          'firstName'  : userBody && userBody.firstName ? userBody.firstName : '',
          'lastName'   : userBody && userBody.lastName ? userBody.lastName : '',
          'displayName': userBody && userBody.displayName ? userBody.displayName : '',
          'email'      : userBody && userBody.email ? userBody.email : '',
          'about'      : userBody && userBody.about ? userBody.about : '',
          'gender'     : userBody && userBody.gender ? userBody.gender : '',
          'title'      : userBody && userBody.title ? userBody.title : ''
        },
        {'where': {'userName': currentUser.trim()}}
        ))
      .then(() =>
        models.Users.findOne({
          'where'  : {'userName': currentUser.trim()},
          'include': [
            {
              'model'     : models.AddressPersonal,
              'attributes': ['addressPersonalUUID', 'country', 'state', 'city', 'addressLine']
            },
            {'model': models.ContactsPersonals, 'attributes': ['contact']},
            {
              'model'  : models.UserProfessionalDetails,
              'include': [
                {'model': models.ProfessionalTags, 'required': true, 'attributes': ['tag']}
              ]
            }
          ]
        })
      )
      .then((user) => {
        const resObj = userProfileResponseObject(user, 'Successfully Updated User General Details');
        return response.status(200).send(resObj);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(404).send(InvalidUser(err, 404));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.DatabaseError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  'createProfessionalDetails': (req, response) => {
    const userBody = req.body;
    const currentUser = req.auth.user;
    const category = userBody.category;
    const experty = userBody.experty;
    const description = userBody.description;
    const isActive = userBody.isActive;
    const tags = userBody.professionalTags;
    logger.log('Post login call for user professional detail');
    return models.sequelize.transaction({'autocommit': true}, (t) => Promise.props({
      'category': models.Categories.findCreateFind({'where': {'category': category}, 'transaction': t}),
      'experty' : models.Experties.findCreateFind(
        {
          'where'      : {'CategoryCategory': category, 'experty': experty},
          'transaction': t
        }),
      'userProfessionDetails': models.UserProfessionalDetails.findCreateFind(
        {
          'where'   : {'UserUserName': currentUser.trim()},
          'defaults': {
            'category'   : category,
            'experty'    : experty,
            'description': description,
            'isActive'   : isActive
          },
          'transaction': t
        }).spread((upd) => upd),
      'professionalTags': Promise.map(tags ? tags : [], (tagString) =>
        // Promise.map awaits for returned promises as well.
        models.ProfessionalTags.findCreateFind({
          'where'      : {'tag': tagString},
          'transaction': t
        })
          .spread((tag) => tag)
      ),
      'user': models.Users.findOne(
        {'where': {'userName': currentUser.trim()}, 'rejectOnEmpty': true}
      )
    }))
      .then((userProps) =>
        Promise.props({
          'userProfessionalDetails': userProps.userProfessionDetails && isNaN(userProps.userProfessionDetails)
            ? userProps.userProfessionDetails : models.UserProfessionalDetails.findOne({
              'where': {
                'professionalDetailsID': userBody.professionalDetailID,
                'UserUserName'         : currentUser.trim()
              }
            }),
          'user'            : userProps.user,
          'ProfessionalTags': userProps.professionalTags
        })

      )
      .then((userProp) =>
        Promise.props({
          'setProfessionalDetails': userProp.user.setUserProfessionalDetail(userProp.userProfessionalDetails),
          'setProfessionalTags'   : userProp.userProfessionalDetails.setProfessionalTags(userProp.ProfessionalTags)
        })
      )
      .then(() =>
        models.Users.findOne({
          'where'  : {'userName': currentUser.trim()},
          'include': [
            {'model': models.AddressPersonal, 'attributes': ['country', 'state', 'city', 'addressLine']},
            {'model': models.ContactsPersonals, 'attributes': ['contact']},
            {
              'model'  : models.UserProfessionalDetails,
              'include': [
                {'model': models.ProfessionalTags, 'required': true, 'attributes': ['tag']}
              ]
            }
          ]
        })
      )
      .then((user) => {
        const resObj = userProfileResponseObject(user, 'Successfully Updated User Professional Details');
        return response.status(200).send(resObj);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(404).send(InvalidUser(err, 404));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.DatabaseError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  'createWorkPlaceDetail': (req, response) => {
    const userBody = req.body;
    const currentUser = req.auth.user;
    const workplace = userBody.workplace;
    const countryCode = userBody.workplace.country;
    const state = userBody.workplace.state;
    const city = userBody.workplace.city;
    const Op = models.sequelize.Op;
    logger.log('Post login call for user workplace detail');
    return models.sequelize.transaction({'autocommit': true}, (t) => Promise.props({
      'country': countryCode ? models.Countries.findOne({
        'where'      : {'code': countryCode},
        'transaction': t
      }) : '',
      'state': state ? models.States.findCreateFind({
        'where'      : {'state': state, 'countryCode': countryCode},
        'transaction': t
      }) : '',
      'city': city ? models.Cities.findCreateFind({
        'where'      : {'city': city, 'countryCode': countryCode, 'stateName': state},
        'transaction': t
      }) : '',
      'workplace': models.WorkPlaces.findCreateFind(
        {
          'where': {
            'title'      : workplace.title,
            'country'    : countryCode,
            'state'      : workplace.state,
            'city'       : workplace.city,
            'addressLine': workplace.addressLine
          },
          'transaction': t
        }).spread((wp) => wp),
      'user': models.Users.findOne(
        {'where': {'userName': currentUser.trim()}, 'rejectOnEmpty': true}
      )
    }))
      .then((userWorkPlaceProps) =>
        Promise.props({
          'user'            : userWorkPlaceProps.user,
          'workplace'       : userWorkPlaceProps.workplace,
          'workplacedetails': models.UserWorkPlaceDetails.findCreateFind({
            'where': {
              [Op.or]: [{'WorkPlaceWorkplaceID': userWorkPlaceProps.workplace.workplaceID},
                {
                  [Op.and]: [{'startTime': {[Op.lte]: Date.parse(userBody.endTime)}},
                    {'endTime': {[Op.gte]: Date.parse(userBody.startTime)}}]
                }]
            },
            'defaults': {
              'startTime': Date.parse(userBody.startTime),
              'endTime'  : Date.parse(userBody.endTime)
            }

          }).spread((wpd) => wpd)
        })
      )
      .then((userWorkPlaceProps) => {
        if (userWorkPlaceProps.workplacedetails
          && userWorkPlaceProps.workplacedetails.WorkPlaceWorkplaceID === ''
          || userWorkPlaceProps.workplacedetails.WorkPlaceWorkplaceID === null) {
          return Promise.props({
            'setWorkplaceDetail': userWorkPlaceProps.workplacedetails
              && userWorkPlaceProps.workplacedetails.WorkPlaceWorkplaceID === ''
              || userWorkPlaceProps.workplacedetails.WorkPlaceWorkplaceID === null
              ? userWorkPlaceProps.workplacedetails.setWorkPlace(userWorkPlaceProps.workplace) : '',
            'setUser': userWorkPlaceProps.user.addUserWorkPlaceDetail(userWorkPlaceProps.workplacedetails)
          });
        }
        throw invalidTimeOrOverlapError();
      })
      .then(() =>
        models.Users.findOne({
          'where'  : {'userName': currentUser.trim()},
          'include': [
            {'model': models.AddressPersonal, 'attributes': ['country', 'state', 'city', 'addressLine']},
            {'model': models.ContactsPersonals, 'attributes': ['contact']},
            {
              'model'  : models.UserProfessionalDetails,
              'include': [
                {'model': models.ProfessionalTags, 'required': true, 'attributes': ['tag']}
              ]
            }
          ]
        })
      )
      .then((user) => {
        const resObj = userProfileResponseObject(user, 'Successfully Updated User Professional Details');
        return response.status(200).send(resObj);
      })
      .catch(invalidTimeOrOverlapError, (err) => {
        response.status(404).send(InvalidTime(err, 404));
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(404).send(InvalidUser(err, 404));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.DatabaseError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  'updateWorkPlaceDetail': (req, response) => {
    const userBody = req.body;
    const currentUser = req.auth.user;
    const workplace = userBody.workplace;
    const countryCode = userBody.workplace.country;
    const state = userBody.workplace.state;
    const city = userBody.workplace.city;
    const Op = models.sequelize.Op;
    const workplaceDetailsID = req.swagger.params.workplaceDetailsID.value;
    logger.log('Post login call for user workplace detail');
    return models.sequelize.transaction({'autocommit': true}, (t) => Promise.props({
      'country': countryCode ? models.Countries.findOne({
        'where'      : {'code': countryCode},
        'transaction': t
      }) : '',
      'state': state ? models.States.findCreateFind({
        'where'      : {'state': state, 'countryCode': countryCode},
        'transaction': t
      }) : '',
      'city': city ? models.Cities.findCreateFind({
        'where'      : {'city': city, 'countryCode': countryCode, 'stateName': state},
        'transaction': t
      }) : '',
      'workplace': models.WorkPlaces.findCreateFind(
        {
          'where': {
            'title'      : workplace.title,
            'country'    : countryCode,
            'state'      : workplace.state,
            'city'       : workplace.city,
            'addressLine': workplace.addressLine
          },
          'transaction': t
        }).spread((wp) => wp),
      'workplaceDetail': models.UserWorkPlaceDetails.findOne({
        'where': {
          [Op.and]: [
            {'UserUserName': currentUser.trim()},
            {'workplaceDetailsID': {[Op.ne]: workplaceDetailsID}},
            {
              [Op.and]: [{'startTime': {[Op.lte]: Date.parse(userBody.endTime)}},
                {'endTime': {[Op.gte]: Date.parse(userBody.startTime)}}]
            }
          ]
        }
      }),
      'user': models.Users.findOne(
        {'where': {'userName': currentUser.trim()}, 'rejectOnEmpty': true}
      )
    }))
      .then((userWorkPlaceProps) => {
        // if the record with time overlap found thorw timeoverlap exception else delete and create
        if (userWorkPlaceProps.workplaceDetail) {
          throw invalidTimeOrOverlapError();
        } else {
          return Promise.props({
            'user'                  : userWorkPlaceProps.user,
            'workplace'             : userWorkPlaceProps.workplace,
            'updateWorkplacedetails': models.UserWorkPlaceDetails.update({
              'startTime'           : Date.parse(userBody.startTime),
              'endTime'             : Date.parse(userBody.endTime),
              'WorkPlaceWorkplaceID': userWorkPlaceProps.workplace.workplaceID
            },
            {
              'where':
                {
                  'UserUserName'      : currentUser.trim(),
                  'workplaceDetailsID': workplaceDetailsID
                }
            }).spread((wpd) => wpd),
            'workplacedetails': models.UserWorkPlaceDetails.findOne({
              'where': {
                'UserUserName'      : currentUser.trim(),
                'workplaceDetailsID': workplaceDetailsID
              }
            })

          });
        }
      })
      .then(() =>
        models.Users.findOne({
          'where'  : {'userName': currentUser.trim()},
          'include': [
            {'model': models.AddressPersonal, 'attributes': ['country', 'state', 'city', 'addressLine']},
            {'model': models.ContactsPersonals, 'attributes': ['contact']},
            {
              'model'  : models.UserProfessionalDetails,
              'include': [
                {'model': models.ProfessionalTags, 'required': true, 'attributes': ['tag']}
              ]
            }
          ]
        })
      )
      .then((user) => {
        const resObj = userProfileResponseObject(user, 'Successfully Updated User Professional Details');
        return response.status(200).send(resObj);
      })
      .catch(invalidTimeOrOverlapError, (err) => {
        response.status(404).send(InvalidTime(err, 404));
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(404).send(InvalidUser(err, 404));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.DatabaseError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  'updateProfessionalDetails': (req, response) => {
    const userBody = req.body;
    const currentUser = req.auth.user;
    const category = userBody.category;
    const experty = userBody.experty;
    const description = userBody.description;
    const isActive = userBody.isActive;
    const tags = userBody.professionalTags;
    const professionalDetailsID = req.swagger.params.professionalDetailID.value;
    logger.log('Post login call for user professional detail');
    return models.sequelize.transaction({'autocommit': true}, (t) => Promise.props({
      'category': models.Categories.findCreateFind({'where': {'category': category}, 'transaction': t}),
      'experty' : models.Experties.findCreateFind(
        {
          'where'      : {'CategoryCategory': category, 'experty': experty},
          'transaction': t
        }),
      'userProfessionDetails': models.UserProfessionalDetails.update(
        {
          'category'    : category,
          'experty'     : experty,
          'description' : description,
          'isActive'    : isActive,
          'UserUserName': currentUser,
          'transaction' : t
        },
        {'where': {'professionalDetailsID': professionalDetailsID, 'UserUserName': currentUser.trim()}}),
      'professionalTags': Promise.map(tags ? tags : [], (tagString) =>
        // Promise.map awaits for returned promises as well.
        models.ProfessionalTags.findCreateFind({
          'where'      : {'tag': tagString},
          'transaction': t
        })
          .spread((tag) => tag)
      ),
      'user': models.Users.findOne(
        {'where': {'userName': currentUser.trim()}, 'rejectOnEmpty': true}
      )
    }))
      .then((userProps) =>
        Promise.props({
          'userProfessionalDetails': models.UserProfessionalDetails.findOne(
            {
              'where': {
                'professionalDetailsID': professionalDetailsID,
                'UserUserName'         : currentUser.trim()
              }
            }),
          'user'            : userProps.user,
          'ProfessionalTags': userProps.professionalTags
        })

      )
      .then((userProp) =>
        Promise.props({
          'setProfessionalDetails': userProp.user.setUserProfessionalDetail(userProp.userProfessionalDetails),
          'setProfessionalTags'   : userProp.userProfessionalDetails.setProfessionalTags(userProp.ProfessionalTags)
        })
      )
      .then(() =>
        models.Users.findOne({
          'where'  : {'userName': currentUser.trim()},
          'include': [
            {
              'model'     : models.AddressPersonal,
              'attributes': ['addressPersonalUUID', 'country', 'state', 'city', 'addressLine']
            },
            {'model': models.ContactsPersonals, 'attributes': ['contact']},
            {
              'model'  : models.UserProfessionalDetails,
              'include': [
                {'model': models.ProfessionalTags, 'required': true, 'attributes': ['tag']}
              ]
            }
          ]
        })
      )
      .then((user) => {
        const resObj = userProfileResponseObject(user, 'Successfully Updated User Professional Details');
        return response.status(200).send(resObj);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(404).send(InvalidUser(err, 404));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.DatabaseError, (err) => {
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

// user profile response object 
const userProfileResponseObject = (user, message) => {
  const userAddressPersonal = user.AddressPersonals
    && user.AddressPersonals[0] && user.AddressPersonals[0].toJSON();
  const userContactsPersonal = user.ContactsPersonals.map((contact) => contact.contact);
  const professionalDetails = user.UserProfessionalDetail;
  const professionalTags = user.UserProfessionalDetail
    && user.UserProfessionalDetail.ProfessionalTags
    ? user.UserProfessionalDetail.ProfessionalTags.map((tag) => tag.tag) : [];

  const responseObj = {
    'data': {
      'title'          : user.title,
      'gender'         : user.gender,
      'firstName'      : user.firstName,
      'lastName'       : user.lastName,
      'displayName'    : user.displayName,
      'email'          : user.email,
      'about'          : user.about,
      'addressPersonal': {
        'addressID': userAddressPersonal && userAddressPersonal.addressPersonalUUID
          ? userAddressPersonal.addressPersonalUUID : '',
        'country'    : userAddressPersonal && userAddressPersonal.country ? userAddressPersonal.country : '',
        'state'      : userAddressPersonal && userAddressPersonal.state ? userAddressPersonal.state : '',
        'city'       : userAddressPersonal && userAddressPersonal.city ? userAddressPersonal.city : '',
        'addressLine': userAddressPersonal && userAddressPersonal.addressLine
          ? userAddressPersonal.addressLine : ''
      },
      'contacts'           : userContactsPersonal,
      'professionalDetails': {
        'professionalDetailID': professionalDetails && professionalDetails.professionalDetailsID
          ? professionalDetails.professionalDetailsID : '',
        'category'   : professionalDetails && professionalDetails.category ? professionalDetails.category : '',
        'experty'    : professionalDetails && professionalDetails.experty ? professionalDetails.experty : '',
        'description': professionalDetails && professionalDetails.description
          ? professionalDetails.description : '',
        'isActive'        : professionalDetails && professionalDetails.isActive ? professionalDetails.isActive : '',
        'professionalTags': professionalTags
      }
    },
    'message': message
  };

  return responseObj;
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

// return status body
const InvalidTime = (err, status) => ({
  'status' : status,
  'code'   : err.code,
  'message': 'Invalid time or time overlap',
  'error'  : err
});

const invalidTimeOrOverlapError = () => {
  const error = new Error('Invalid time or time overlap');
  error.name = 'invalidTimeOrOverlapError';
  return error;
};

const invalidUsernameOrPasswordError = () => {
  const error = new Error('Username or password is incorrect');
  error.name = 'invalidUsernameOrPasswordError';
  return error;
};
