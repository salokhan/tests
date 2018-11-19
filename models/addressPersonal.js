'use strict';

/*
 * Users Address personal Model
 */

module.exports = (sequelize, DataTypes) => {
  const addressPersonal = sequelize.define('AddressPersonal', {
    'addressPersonalUUID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'country'            : {'type': DataTypes.STRING},
    'state'              : {'type': DataTypes.STRING},
    'city'               : {'type': DataTypes.STRING},
    'addressLine'        : {
      'type'    : DataTypes.STRING,
      'validate': {'max': {'args': [15], 'msg': 'Address must be less then 255 character'}}
    }
  });

  return addressPersonal;
};
