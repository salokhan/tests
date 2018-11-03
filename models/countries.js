'use strict';

/*
 * Users countries Model
 */

module.exports = (sequlize, DataTypes) => {
    const countries = sequlize.define('Countries', {
        'code': { 'type': DataTypes.STRING, 'unique': true, 'primaryKey': true, 'allowNull': false },
        'name': { 'type': DataTypes.STRING, 'allowNull': false }
    });

    countries.associate = (models) => {
        countries.hasMany(models.States, { foreignKey: 'countryCode', sourceKey: 'code' });
        countries.hasMany(models.Cities, { foreignKey: 'countryCode', sourceKey: 'code' });

    }
    return countries;
}