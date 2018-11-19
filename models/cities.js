'use strict';

/*
 * Users cities Model
 */

module.exports = (sequlize, DataTypes) => {
  const cities = sequlize.define('Cities', {
    'city'       : {'type': DataTypes.STRING, 'allowNull': false, 'primaryKey': true},
    'stateName'  : {'type': DataTypes.STRING, 'allowNull': false, 'primaryKey': true},
    'countryCode': {'type': DataTypes.STRING, 'allowNull': false, 'primaryKey': 'true'}
  });
  cities.associate = (models) => {
    cities.belongsTo(models.States, {'foreignKey': 'stateName', 'targetKey': 'state'});
    cities.belongsTo(models.Countries, {'foreignKey': 'countryCode', 'targetKey': 'code'});
  };

  return cities;
};
