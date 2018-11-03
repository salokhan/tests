'use strict';

/*
 * Users Model
 */

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    'firstName': {
      'type': DataTypes.STRING, 'validate': {
        'notEmpty': { 'msg': 'Must provide first name' },
        'max': { 'args': [15], 'msg': 'First name must be less then 16 character' }
      }
    },
    'lastName': {
      'type': DataTypes.STRING, 'validate': {
        'notEmpty': { 'msg': 'Must provide first name' },
        'max': { 'args': [15], 'msg': 'Last name must be less then 16 character' }
      }
    },
    'email': { 'type': DataTypes.STRING, 'unique': true, 'validate': { 'isEmail': { 'msg': 'Contact email must be email address' } } },
    'userName': {
      'type': DataTypes.STRING, 'primaryKey': true,
      'validate': { 'is': /^([a-z0-9](?:-?[a-z0-9]){0,38})$/ig },
      'primaryKey': true
    },
    'passwordHash': DataTypes.STRING,
    'password': {
      'type': DataTypes.VIRTUAL,
      'set': function (val) {
        // Remember to set the data value, otherwise it won't be validated
        this.setDataValue('password', val);
        this.setDataValue('passwordHash', this.salt + val);
      },
      'validate': {
        'isLongEnough': function (val) {
          if (val.length < 5) {
            throw new Error('Please choose a longer password');
          }
        }
      }
    },
    'about': {
      'type': DataTypes.STRING,
      'validate': { 'max': { 'args': [15], 'msg': 'About must be less then 255 character' } }
    }
  });

  Users.associate = (models) => {
    Users.hasMany(models.ContactsPersonals, { foriegnKey: 'userName', sourceKey: 'userName' });
    Users.hasMany(models.AddressPersonal, { foriegnKey: 'userName', sourceKey: 'userName' });
  }

  return Users;
};
