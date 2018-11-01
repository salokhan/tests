'use strict';

/*
 * Users Model
 */

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    'email'   : {'type': DataTypes.STRING, 'unique': true, 'validate': {'isEmail': true}},
    'username': {'type': DataTypes.STRING, 'primaryKey': true, 'validate': {'is': /^([a-z0-9](?:-?[a-z0-9]){0,38})$/ig}}
  });

  return Users;
};
