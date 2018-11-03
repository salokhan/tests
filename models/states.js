'use strict';

/*
 * Users states Model
 */

module.exports = (sequlize, DataTypes) => {
    const states = sequlize.define('States', {
        'state': { 'type': DataTypes.STRING, 'allowNull': false, 'primaryKey': true },
        'countryCode': { 'type': DataTypes.STRING, 'allowNull': false }
    });
    states.associate = (models) => {
        states.hasMany(models.Cities, { foreignKey: 'stateName', sourceKey: 'state' });
        states.belongsTo(models.Countries, { foreignKey: 'countryCode', targetKey: 'code' });
    }
    // states.bulkCreate(
    //     [
    //         {
    //             'state': 'Federal',
    //             'countryCode': 'PK'
    //         },
    //         {
    //             'state': 'KPK',
    //             'countryCode': 'PK'
    //         },
    //         {
    //             'state': 'Punjab',
    //             'countryCode': 'PK'
    //         },
    //         {
    //             'state': 'Sindh',
    //             'countryCode': 'PK'
    //         },
    //         {
    //             'state': 'Baluchistan',
    //             'countryCode': 'PK'
    //         }
    //     ]);
    return states;
}