'use strict';

/*
 * Users Address personal Model
 */

module.exports = (sequelize, DataTypes) => {
  const contactsPersonal = sequelize.define('ContactsPersonals', {
    'name': { 'type': DataTypes.STRING },
    'contact': {
      'type': DataTypes.STRING, 'primaryKey': true,
      'validate': { 'is': /^\+[1-9]{1}[0-9]{3,14}$/ }
    },
    'user': {
      'type': DataTypes.STRING, 'primaryKey': true,
      'validate': { 'is': /^([a-z0-9](?:-?[a-z0-9]){0,38})$/ig }
    }
  });

  contactsPersonal.associate = (models) => {
    contactsPersonal.belongsTo(models.Users, { foreignKey: 'user', targetKey: 'userName' });
  };


  return contactsPersonal;
};
