'use strict';

/*
 * Users Address personal Model
 */

module.exports = (sequelize, DataTypes) => {
  const contactsPersonal = sequelize.define('ContactsPersonals', {
    'contactPersonalUUID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'contact'            : {
      'type'      : DataTypes.STRING, 'primaryKey': true,
      'unique'    : true,
      'validate'  : {'is': /^\+[1-9]{1}[0-9]{3,14}$/}
    }
  });
  return contactsPersonal;
};
