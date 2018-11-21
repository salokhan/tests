'use strict';

/*
 * Users workplace details Model
 */

module.exports = (sequelize, DataTypes) => {
  const userwokplacedetails = sequelize.define('UserWorkPlaceDetails', {
    'workplaceDetailsID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'startTime'         : {
      'type'     : DataTypes.STRING, 'allowNull': false, 'validate' : {
        'isCorrectTimeFormat': (value, next) => {
          const hour = parseInt(value.split(':')[0]);
          const minute = parseInt(value.split(':')[1]);
          if (hour < 0 || hour > 23) {
            return next(new Error('Wrong time format'));
          }
          if (minute < 0 || minute > 59) {
            return next(new Error('Wrong time format'));
          }
          return next();
        }
      }
    },
    'endTime': {
      'type'     : DataTypes.STRING, 'allowNull': false,  'validate' : {
        'isCorrectTimeFormat': (value) => {
          const hour = parseInt(value.split(':')[0]);
          const minute = parseInt(value.split(':')[1]);
          if (hour < 0 && hour > 23) {
            throw new Error('Wrong time format');
          }
          if (minute < 0 && minute > 59) {
            throw new Error('Wrong time format');
          }
        }
      }
    }
  });
  userwokplacedetails.associate = (models) => {
    userwokplacedetails.belongsToMany(models.WorkPlaces, {'through': 'UserWorkPlaces'});
  };
  return userwokplacedetails;
};
