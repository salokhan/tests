'use strict';

const _ = require('lodash');

const CONST = {
  'COUNTRY_CODE': {
    'CAN': 'CAN',
    'USA': 'USA'
  },
  'STATE': {
    'CA_AB': 'CA_AB',
    'CA_BC': 'CA_BC',
    'CA_MB': 'CA_MB',
    'CA_NL': 'CA_NL',
    'CA_NS': 'CA_NS',
    'CA_ON': 'CA_ON',
    'CA_PE': 'CA_PE',
    'CA_QC': 'CA_QC',
    'CA_SK': 'CA_SK',
    'CA_NT': 'CA_NT',
    'CA_NU': 'CA_NU',
    'CA_YT': 'CA_YT',
    'US_AL': 'US_AL',
    'US_AK': 'US_AK',
    'US_AZ': 'US_AZ',
    'US_AR': 'US_AR',
    'US_CA': 'US_CA',
    'US_CO': 'US_CO',
    'US_CT': 'US_CT',
    'US_DE': 'US_DE',
    'US_FL': 'US_FL',
    'US_GA': 'US_GA',
    'US_HI': 'US_HI',
    'US_ID': 'US_ID',
    'US_IL': 'US_IL',
    'US_IN': 'US_IN',
    'US_IA': 'US_IA',
    'US_KS': 'US_KS',
    'US_KY': 'US_KY',
    'US_LA': 'US_LA',
    'US_ME': 'US_ME',
    'US_MD': 'US_MD',
    'US_MA': 'US_MA',
    'US_MI': 'US_MI',
    'US_MN': 'US_MN',
    'US_MS': 'US_MS',
    'US_MO': 'US_MO',
    'US_MT': 'US_MT',
    'US_NE': 'US_NE',
    'US_NV': 'US_NV',
    'US_NH': 'US_NH',
    'US_NJ': 'US_NJ',
    'US_NM': 'US_NM',
    'US_NY': 'US_NY',
    'US_NC': 'US_NC',
    'US_ND': 'US_ND',
    'US_OH': 'US_OH',
    'US_OK': 'US_OK',
    'US_OR': 'US_OR',
    'US_PA': 'US_PA',
    'US_RI': 'US_RI',
    'US_SC': 'US_SC',
    'US_SD': 'US_SD',
    'US_TN': 'US_TN',
    'US_TX': 'US_TX',
    'US_UT': 'US_UT',
    'US_VT': 'US_VT',
    'US_VA': 'US_VA',
    'US_WA': 'US_WA',
    'US_WV': 'US_WV',
    'US_WI': 'US_WI',
    'US_WY': 'US_WY',
    'US_DC': 'US_DC',
    'US_AS': 'US_AS',
    'US_GU': 'US_GU',
    'US_MP': 'US_MP',
    'US_PR': 'US_PR',
    'US_UM': 'US_UM',
    'US_VI': 'US_VI',
    'INTL' : 'INTL',
    'NONE' : 'NONE'
  }
};

module.exports = (sequelize, DataTypes) => {
  const Suppliers = sequelize.define('Suppliers', {
    'supplierUUID'   : {'type': DataTypes.UUID, 'defaultValue': DataTypes.UUIDV4, 'primaryKey': true},
    'supplierID'     : {'type': DataTypes.INTEGER, 'autoIncrement': true},
    'name'           : {'type': DataTypes.STRING, 'allowNull': false, 'validate': {'notEmpty': {'msg': 'Must provide name'}}},
    'phone'          : {'type': DataTypes.STRING, 'allowNull': false, 'validate': {'notEmpty': {'msg': 'Must provide phone'}, 'isNumeric': {'msg': 'Phone must be numeric'}}},
    'email'          : {'type': DataTypes.STRING, 'isEmail': true, 'allowNull': false, 'validate': {'notEmpty': {'msg': 'Must provide email'}, 'isEmail': {'msg': 'Email must be valid email address'}}},
    'accountNum'     : {'type': DataTypes.STRING, 'allowNull': true},
    'website'        : {'type': DataTypes.STRING, 'allowNull': true},
    'businessNum'    : {'type': DataTypes.STRING, 'allowNull': true, 'validate': {'isNumeric': {'msg': 'Business Number must be numeric'}}},
    'contactName'    : {'type': DataTypes.STRING, 'allowNull': true},
    'contactPhone'   : {'type': DataTypes.STRING, 'allowNull': true, 'validate': {'isNumeric': {'msg': 'Contact phone must be numeric'}}},
    'contactEmail'   : {'type': DataTypes.STRING, 'allowNull': true, 'validate': {'isEmail': {'msg': 'Contact email must be email address'}}},
    'shippingAddress': {'type': DataTypes.STRING, 'allowNull': false, 'validate': {'notEmpty': {'msg': 'Must provide shipping address'}}},
    'billingAddress' : {'type': DataTypes.STRING, 'allowNull': true},
    'note'           : {'type': DataTypes.TEXT, 'validate': {'len': [0, 5000]}},
    'countryCode'    : {
      'type'    : DataTypes.ENUM(_.values(CONST.COUNTRY_CODE)), 'isNull'  : false, 'validate': {
        'isIn': {
          'args': [_.values(CONST.COUNTRY_CODE)],
          'msg' : 'Invalid country code'
        }
      }
    },
    'state': {
      'type'    : DataTypes.ENUM(_.values(CONST.STATE)), 'isNull'  : false, 'validate': {
        'isIn': {
          'args': [_.values(CONST.STATE)],
          'msg' : 'Invalid state'
        }
      }
    }
  });

  Suppliers.associate = (models) => {
    Suppliers.belongsToMany(models.Keywords, {'through': 'SuppliersKeywords'});

    Suppliers.belongsTo(models.Currencies);

    Suppliers.belongsTo(models.Terms);
  };

  Suppliers._CONST = CONST;

  return Suppliers;
};
