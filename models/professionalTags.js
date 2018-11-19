'use strict';
/*
 * professional tags model
 */

module.exports = (sequelize, DataTypes) => {
  const professionaltags = sequelize.define('ProfessionalTags', {
    'professionaltagID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'tag'              : {'type': DataTypes.STRING, 'unique': true, 'allowNull': false, 'validate': {'notEmpty': true}}
  });

  professionaltags.associate = (models) => {
    professionaltags.belongsToMany(models.UserProfessionalDetails, {'through': 'UserProfessionalTags'});
  };

  return professionaltags;
};
