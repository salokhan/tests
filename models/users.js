/* eslint-disable indent */
'use strict';
const bcrypt = require('bcrypt');

/*
 * Users Model
 */

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    'firstName': {
      'type'    : DataTypes.STRING, 'validate': {
        'notEmpty': {'msg': 'Must provide first name'},
        'max'     : {'args': [15], 'msg': 'First name must be less then 16 character'}
      }
    },
    'lastName': {
      'type'    : DataTypes.STRING, 'validate': {
        'notEmpty': {'msg': 'Must provide first name'},
        'max'     : {'args': [15], 'msg': 'Last name must be less then 16 character'}
      }
    },
    'email': {
      'type'    : DataTypes.STRING, 'unique'  : true,
      'validate': {'isEmail': {'msg': 'Contact email must be email address'}}
    },
    'userName': {
      'type'      : DataTypes.STRING, 'primaryKey': true,
      'validate'  : {'is': /^([a-z0-9](?:-?[a-z0-9]){0,38})$/ig}
    },
    'password': {'type': DataTypes.STRING},
    'about'   : {
      'type'    : DataTypes.STRING,
      'validate': {'max': {'args': [15], 'msg': 'About must be less then 255 character'}}
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
