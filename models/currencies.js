'use strict';
/*
 * Currency model 
 */

module.exports = (sequelize, DataTypes) => {
  const Currencies = sequelize.define('Currencies', {
    'currencyID'  : {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'currencyCode': {'type': DataTypes.STRING, 'unique': true, 'allowNull': false, 'validate': {'notEmpty': {'msg': 'Must provide currency code'}}}
  });

  Currencies.associate = (models) => {
    Currencies.hasMany(models.Suppliers);
  };

  return Currencies;
};
