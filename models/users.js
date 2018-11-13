/* eslint-disable indent */
'use strict';
const bcrypt = require('bcrypt');
const _ = require('lodash');

const CONST = {
  'GENDER': {
    'Male'  : 'Male',
    'Female': 'Female'
  },
  'TITLE': {
    'Mr' : 'Mr',
    'Mrs': 'Mrs',
    'Mss': 'Mss',
    'Ms' : 'Ms',
    'Mx' : 'Mx',
    'Dr' : 'Dr'
  }
};

/*
 * Users Model
 */

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    'userName': {
      'type'      : DataTypes.STRING, 'primaryKey': true,
      'validate'  : {'len': {'args': [5, 10], 'msg': 'User name must be 5 to 10 character  character long'}}
    },
    'password' : {'type': DataTypes.STRING},
    'firstName': {
      'type'    : DataTypes.STRING, 'validate': {
        'notEmpty': {'msg': 'Must provide first name'},
        'len'     : {'args': [1, 20], 'msg': 'First name must be less then 20 character'}
      }
    },
    'email': {
      'type'    : DataTypes.STRING, 'unique'  : true,
      'validate': {'isEmail': {'msg': 'Contact email must be email address'}}
    },
    'lastName': {
      'type'    : DataTypes.STRING, 'validate': {
        'notEmpty': {'msg': 'Must provide last name'},
        'len'     : {'args': [1, 20], 'msg': 'Last name must be less then 20 character'}
      }
    },
    'displayName': {
      'type'    : DataTypes.STRING,
      'validate': {'len': {'args': [1, 20], 'msg': 'display name must be less then 20 character'}}
    },
    'about': {
      'type'    : DataTypes.TEXT,
      'validate': {'len': {'args': [0, 500], 'msg': 'About must be less then 500 character'}}
    },
    'gender': {
      'type'    : DataTypes.ENUM(_.values(CONST.GENDER)), 'validate': {
        'isIn': {
          'args': [_.values(CONST.GENDER)],
          'msg' : 'Invalid gender'
        }
      }
    },
    'title': {
      'type'    : DataTypes.ENUM(_.values(CONST.TITLE)), 'validate': {
        'isIn': {
          'args': [_.values(CONST.TITLE)],
          'msg' : 'Invalid title'
        }
      }
    }
  },
    {
      'hooks': {
        'beforeCreate': (user) => {
          // eslint-disable-next-line no-lone-blocks
          {
            user.password = user.password && user.password !== ''
              ? bcrypt.hashSync(user.password, 10) : '';
          }
        }
      }
    });

  Users.associate = (models) => {
    Users.hasMany(models.ContactsPersonals, {'foriegnKey': 'userName', 'sourceKey': 'userName'});
    Users.hasMany(models.AddressPersonal, {'foriegnKey': 'userName', 'sourceKey': 'userName'});
  };

  return Users;
};
