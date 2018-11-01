'use strict';

/*
 * Users Address personal Model
 */

module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('UsersAddressPersonal', {
        'addressID'  : {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
        'country': { 'type': DataTypes.STRING },
        'state': { 'type': DataTypes.STRING },
        'city': { 'type': DataTypes.STRING },
        'addressLine': { 'type': DataTypes.STRING },
    });

    return Users;
};