'use strict';

module.exports = (sequelize, DataTypes) => {
  const terms = sequelize.define('Terms', {
    'termID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'name'  : {
      'type'     : DataTypes.STRING, 'allowNull': false, 'unique'   : true,
      'validate' : {'notEmpty': {'msg': 'Must provide term'}}
    },
    'days': {'type': DataTypes.INTEGER, 'allowNull': false, 'validate': {'min': 1}}
  });

  terms.associate = (models) => {
    terms.hasMany(models.Suppliers);
  };

  return terms;
};
