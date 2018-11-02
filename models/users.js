'use strict';

/*
 * Users Model
 */

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    'firstName': {'type': DataTypes.STRING, 'validate': {'min': 1, 'max': '15'}},
    'lastName' : {'type': DataTypes.STRING, 'validate': {'min': 1, 'max': '15'}},
    'email'    : {'type': DataTypes.STRING, 'unique': true, 'validate': {'isEmail': true}},
    'userName' : {
      'type'      : DataTypes.STRING, 'primaryKey': true,
      'validate'  : {'is': /^([a-z0-9](?:-?[a-z0-9]){0,38})$/ig}
    },
    'passwordHash': DataTypes.STRING,
    'password'     : {
      'type': DataTypes.VIRTUAL,
      'set' : function(val) {
        // Remember to set the data value, otherwise it won't be validated
        this.setDataValue('password', val);
        this.setDataValue('passwordHash', this.salt + val);
      },
      'validate': {
        'isLongEnough': function(val) {
          if (val.length < 5) {
            throw new Error('Please choose a longer password');
          }
        }
      }
    },
    'about': {'type': DataTypes.STRING, 'validate': {'max': '200'}}
  });

  return Users;
};
