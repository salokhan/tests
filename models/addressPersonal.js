'use strict';

/*
 * Users Address personal Model
 */

module.exports = (sequelize, DataTypes) => {
  const addressPersonal = sequelize.define('AddressPersonal', {
    'country': { 'type': DataTypes.STRING },
    'state': { 'type': DataTypes.STRING },
    'city': { 'type': DataTypes.STRING },
    'addressLine': {
      'type': DataTypes.STRING,
      'validate': { 'max': { 'args': [15], 'msg': 'Address must be less then 255 character' } }
    },
    'user': {
      'type': DataTypes.STRING,
      'validate': { 'is': /^([a-z0-9](?:-?[a-z0-9]){0,38})$/ig },
      'primaryKey': true 
    }
  });

  addressPersonal.associate = (models) => {
    addressPersonal.belongsTo(models.Users, { foreignKey: 'user', targetKey: 'userName' });
  };

  return addressPersonal;
};
