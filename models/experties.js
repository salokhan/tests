'use strict';

/*
 * Experties Model
 */

module.exports = (sequlize, DataTypes) => {
  const experties = sequlize.define('Experties', {
    'expertyID'  : {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'experty'    : {'type': DataTypes.STRING, 'allowNull': false},
    'accessCount': {'type': DataTypes.INTEGER}
  });
  experties.associate = (models) => {
    experties.belongsTo(models.Categories);
  };
  return experties;
};
