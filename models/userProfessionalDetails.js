'use strict';

/*
 * Users professiona details Model
 */

module.exports = (sequelize, DataTypes) => {
  const userprofessionaldetails = sequelize.define('UserProfessionalDetails', {
    'professionalDetailsID': {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'category'             : {'type': DataTypes.STRING, 'allowNull': false},
    'experty'              : {'type': DataTypes.STRING, 'allowNull': false},
    'description'          : {
      'type'    : DataTypes.TEXT,
      'validate': {'len': {'args': [0, 500], 'msg': 'desciption must be less then 500 character'}}
    },
    'isActive': {'type': DataTypes.BOOLEAN, 'defaultValue': 'false'}
  });
  userprofessionaldetails.associate = (models) => {
    userprofessionaldetails.belongsToMany(models.ProfessionalTags, {'through': 'UserProfessionalTags'});
  };
  return userprofessionaldetails;
};
