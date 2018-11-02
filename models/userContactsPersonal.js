'use strict';

/*
 * Users Address personal Model
 */

module.exports = (sequelize, DataTypes) => {
  const usersContactsPersonal = sequelize.define('UsersContactsPersonals', {
    'contactID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'name'     : {'type': DataTypes.STRING},
    'contact'  : {'type': DataTypes.STRING, 'validate': {'is': /^\+[1-9]{1}[0-9]{3,14}$/}}
  });

  usersContactsPersonal.associate = (models) => {
    usersContactsPersonal.belongsTo(models.Users);
  };

  return usersContactsPersonal;
};
