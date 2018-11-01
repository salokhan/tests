'use strict';
/*
 * Keywords model
 */

module.exports = (sequelize, DataTypes) => {
  const Keywords = sequelize.define('Keywords', {
    'keywordID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'keyword'  : {'type': DataTypes.STRING, 'unique': true, 'allowNull': false, 'validate': {'notEmpty': true}}
  });

  Keywords.associate = (models) => {
    Keywords.belongsToMany(models.Suppliers, {'through': 'SuppliersKeywords'});
  };

  return Keywords;
};
