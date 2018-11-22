'use strict';
/*
 * workplace model
 */

module.exports = (sequelize, DataTypes) => {
  const workplaces = sequelize.define('WorkPlaces', {
    'workplaceID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'title'      : {
      'type'     : DataTypes.STRING, 'unique'   : 'unWorkPlace',
      'allowNull': false, 'validate' : {'notEmpty': true}
    },
    'country'    : {'type': DataTypes.STRING, 'unique': 'unWorkPlace'},
    'state'      : {'type': DataTypes.STRING, 'unique': 'unWorkPlace'},
    'city'       : {'type': DataTypes.STRING, 'unique': 'unWorkPlace'},
    'addressLine': {'type': DataTypes.STRING, 'unique': 'unWorkPlace'}
  });
  // workplaces.associate = (models) => {
  //   workplaces.hasOne(models.UserWorkPlaceDetails);
  // };

  return workplaces;
};
