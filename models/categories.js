'use strict';

/*
 * Categories Model
 */

module.exports = (sequlize, DataTypes) => {
  const categories = sequlize.define('Categories', {
    'categoryID' : {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4},
    'category'   : {'type': DataTypes.STRING, 'allowNull': false, 'primaryKey': true},
    'accessCount': {'type': DataTypes.INTEGER}
  });
  return categories;
};
