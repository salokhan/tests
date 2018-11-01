'use strict';

const Promise = require('bluebird');
const models = require('../models');
const logger = require('../lib/logger');

module.exports = {
  // Create supplier
  'createSupplier': (req, response) => {
    logger.info('Post called for supplier');
    const supplier = req.body;
    let currency;
    let term;
    let keywords;


    return models.sequelize.transaction({'autocommit': true}, (t) => Promise.props({
      // Restricted to the items in the terms table. If a term is not found in the term table, the route should return a 400 response
      'terms': models.Terms.findOne({
        'where'        : {'name': supplier.terms},
        'transaction'  : t,
        'rejectOnEmpty': true
      }),
      // Restricted to the items in the currency table. If currency is not found in the currency table, the route should return a 400 response
      'currencies': models.Currencies.findOne({
        'where'        : {'currencyCode': supplier.currencyCode},
        'transaction'  : t,
        'rejectOnEmpty': true
      }),
      'keywords': Promise.map(supplier.keywords ? supplier.keywords : [], (keywordString) =>
        // Promise.map awaits for returned promises as well.
        models.Keywords.findCreateFind({
          'where'      : {'keyword': keywordString},
          'transaction': t
        })
          .spread((keyword) => keyword)
      )

    }))
      .then((result) => {
        currency = result.currencies;
        term = result.terms;
        keywords = result.keywords;
        // Now insert supplier data
        return models.Suppliers.create(
          {
            'name'           : supplier.name ? supplier.name : null,
            'phone'          : supplier.phone ? supplier.phone : null,
            'email'          : supplier.email ? supplier.email : null,
            'accountNum'     : supplier.accountNum ? supplier.accountNum : null,
            'website'        : supplier.website ? supplier.website : null,
            'contactName'    : supplier.contact && supplier.contact.name ? supplier.contact.name : null,
            'contactPhone'   : supplier.contact && supplier.contact.phone ? supplier.contact.phone : null,
            'contactEmail'   : supplier.contact && supplier.contact.email ? supplier.contact.email : null,
            'shippingAddress': supplier.shippingAddress ? supplier.shippingAddress : null,
            'billingAddress' : supplier.billingAddress ? supplier.billingAddress : null,
            'note'           : supplier.notes ? supplier.notes : null,
            'businessNum'    : supplier.businessNum ? supplier.businessNum : null,
            'state'          : supplier.state ? supplier.state : null,
            'countryCode'    : supplier.countryCode ? supplier.countryCode : null
          });
      })
      .then((Supplier) => Promise.all([Supplier.setCurrency(currency), Supplier.setTerm(term), Supplier.setKeywords(keywords)]))
      .then((SupplierArray) => {
        // we are getting the first element because the previous promise returns array with three element
        const Supplier = SupplierArray[0];
        return models.Suppliers.findOne(
          {
            'where'  : {'supplierUUID': Supplier.supplierUUID},
            'include': [
              {'model': models.Terms, 'attributes': ['name']},
              {'model': models.Currencies, 'attributes': ['currencyCode']},
              {'model': models.Keywords, 'attributes': ['keyword']}
            ]

          }
        );
      })
      .then((Supplier) => {
        const keywordsArray = Supplier.Keywords.map((keyword) => keyword.keyword);
        const responseObj = {
          'data':
            {
              'id'         : Supplier.supplierID,
              'name'       : Supplier.name,
              'phone'      : Supplier.phone,
              'email'      : Supplier.email,
              'accountNum' : Supplier.accountNum,
              'businessNum': Supplier.businessNum,
              'contact'    : {
                'name' : Supplier.contactName,
                'email': Supplier.contactEmail,
                'phone': Supplier.contactPhone
              },
              'shippingAddress': Supplier.shippingAddress,
              'billingAddress' : Supplier.billingAddress,
              'keywords'       : keywordsArray,
              'notes'          : Supplier.note,
              'terms'          : Supplier.Term.name,
              'currencyCode'   : Supplier.Currency.currencyCode,
              'countryCode'    : Supplier.countryCode,
              'state'          : Supplier.state
            },
          'message': 'Successfully Created Supplier'
        };
        return response.status(201).send(responseObj);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  // Update supplier
  'updateSupplier': (req, response) => {
    logger.info('put called for supplier');
    const supplier = req.body;

    let currency;
    let term;
    let keywords;
    const SupplierId = req.swagger.params.supplierId.value;

    return models.sequelize.transaction({'autocommit': true}, (t) => Promise.props({
      // Restricted to the items in the terms table. If a term is not found in the term table, the route should return a 400 response
      'terms': supplier.terms ? models.Terms.findOne({
        'where'        : {'name': supplier.terms},
        'transaction'  : t,
        'rejectOnEmpty': true
      }) : undefined,
      // Restricted to the items in the currency table. If currency is not found in the currency table, the route should return a 400 response
      'currencies': supplier.currencyCode ? models.Currencies.findOne({
        'where'        : {'currencyCode': supplier.currencyCode},
        'transaction'  : t,
        'rejectOnEmpty': true
      }) : undefined,
      'keywords': Promise.map(supplier.keywords ? supplier.keywords : [], (keywordString) =>
        // Promise.map awaits for returned promises as well.
        models.Keywords.findCreateFind({
          'where'      : {'keyword': keywordString},
          'transaction': t
        })
          .spread((keyword) => keyword)
      ),
      'Supplier': models.Suppliers.find(
        {
          'where'  : {'supplierID': SupplierId},
          'include': [
            {'model': models.Terms, 'attributes': ['name']},
            {'model': models.Currencies, 'attributes': ['currencyCode']},
            {'model': models.Keywords, 'attributes': ['keyword']}
          ]

        }
      )
    }))

      .then((result) => {
        currency = result.currencies;
        term = result.terms;
        keywords = result.keywords;
        const Supplier = result.Supplier;
        if (Supplier) {
          // Now update supplier data
          return Supplier.update(
            {
              'name'           : supplier.name ? supplier.name : Supplier.name,
              'phone'          : supplier.phone ? supplier.phone : Supplier.phone,
              'email'          : supplier.email ? supplier.email : Supplier.email,
              'accountNum'     : supplier.accountNum ? supplier.accountNum : Supplier.accountNum,
              'website'        : supplier.website ? supplier.website : Supplier.website,
              'contactName'    : supplier.contact && supplier.contact.name ? supplier.contact.name : Supplier.contactName,
              'contactPhone'   : supplier.contact && supplier.contact.phone ? supplier.contact.phone : Supplier.contactPhone,
              'contactEmail'   : supplier.contact && supplier.contact.email ? supplier.contact.email : Supplier.contactEmail,
              'shippingAddress': supplier.shippingAddress ? supplier.shippingAddress : Supplier.shippingAddress,
              'billingAddress' : supplier.billingAddress ? supplier.billingAddress : Supplier.billingAddress,
              'note'           : supplier.notes ? supplier.notes : Supplier.note,
              'businessNum'    : supplier.businessNum ? supplier.businessNum : Supplier.businessNum,
              'state'          : supplier.state ? supplier.state : Supplier.state,
              'countryCode'    : supplier.countryCode ? supplier.countryCode : Supplier.countryCode
            },
            {'where': {'supplierID': SupplierId}}
          );
        }
        throw supplierNotExistError();
      }
      )
      .then((Supplier) => Promise.all(
        [
          currency ? Supplier.setCurrency(currency) : Promise.resolve(),
          term ? Supplier.setTerm(term) : Promise.resolve(),
          keywords.length > 0 ? Supplier.setKeywords(keywords) : Promise.resolve()
        ]))
      .then(() => models.Suppliers.findOne(
        {
          'where'  : {'supplierID': SupplierId},
          'include': [
            {'model': models.Terms, 'attributes': ['name']},
            {'model': models.Currencies, 'attributes': ['currencyCode']},
            {'model': models.Keywords, 'attributes': ['keyword']}
          ]

        }
      ))
      .then((Supplier) => {
        const keywordsArray = Supplier.Keywords.map((keyword) => keyword.keyword);
        const responseObj = {
          'data':
            {
              'id'         : Supplier.supplierID,
              'name'       : Supplier.name ? Supplier.name : null,
              'phone'      : Supplier.phone ? Supplier.phone : null,
              'email'      : Supplier.email ? Supplier.email : null,
              'accountNum' : Supplier.accountNum ? Supplier.accountNum : null,
              'businessNum': Supplier.businessNum ? Supplier.businessNum : null,
              'contact'    : {
                'name' : Supplier.contactName ? Supplier.contactName : null,
                'email': Supplier.contactEmail ? Supplier.contactEmail : null,
                'phone': Supplier.contactPhone ? Supplier.contactPhone : null
              },
              'shippingAddress': Supplier.shippingAddress ? Supplier.shippingAddress : null,
              'billingAddress' : Supplier.billingAddress ? Supplier.billingAddress : null,
              'keywords'       : keywordsArray,
              'notes'          : Supplier.note ? Supplier.note : null,
              'terms'          : Supplier.Term && Supplier.Term.name ? Supplier.Term.name : null,
              'currencyCode'   : Supplier.Currency && Supplier.Currency.currencyCode ? Supplier.Currency.currencyCode : null,
              'countryCode'    : Supplier.countryCode ? Supplier.countryCode : null,
              'state'          : Supplier.state ? Supplier.state : null
            },
          'message': 'Success'
        };
        return response.status(200).send(responseObj);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(supplierNotExistError, () => {
        response.status(404).send('Supplier does not exist');
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  },
  // Get all suppliers
  'getSuppliers': (req, response) => {
    logger.info('Get a list of suppliers');
    const Query = req.query;

    const supplierQuery = {
      'name'      : Query.name ? Query.name : {'$or': {'$eq': null, '$ne': null}},
      'phone'     : Query.contact ? Query.contact : {'$or': {'$eq': null, '$ne': null}},
      'accountNum': Query.account ? Query.account : {'$or': {'$eq': null, '$ne': null}}

    };
    const keywordQuery = Query.keywords ? {'keyword': Query.keywords} : '';
    const termsQuery = Query.terms ? {'name': Query.terms} : '';
    const currencyQuery = Query.currency ? {'currencyCode': Query.currency} : '';
    const dafaultLimit = 50;
    const defaultOffset = 0;
    const result = {'results': [], 'message': '', 'total': '', 'offset': defaultOffset, 'limit': dafaultLimit};
    const supplierSelectedColumns = selectAttributes('Suppliers', Query.field);
    return Promise.props({
      'count': models.Suppliers.count({'where': supplierQuery}),
      'rows' : models.Suppliers.findAll(
        {
          'where'     : supplierQuery,
          'attributes': Query.field.length > 0 && Query.field.split(',').indexOf('*') === -1 ? supplierSelectedColumns : undefined,
          'distinct'  : true,
          // if query include any filter for fields
          'include'   : Query.field.length > 0 && Query.field.split(',').indexOf('*') === -1 ? Query.field.split(',').map((val) => {
            if (val === 'terms') {
              return {
                'model'     : models.Terms,
                'attributes': ['name'],
                'where'     : termsQuery
              };
            } else if (val === 'currency') {
              return {
                'model'     : models.Currencies,
                'attributes': ['currencyCode'],
                'where'     : currencyQuery
              };
            } else if (val === 'keywords') {
              return {
                'model'     : models.Keywords,
                'attributes': ['keyword'],
                'where'     : keywordQuery
              };
            }
            return undefined;
          }).filter((n) => n !== undefined) : [
            // If query has no filter for fields
            {
              'model'     : models.Terms,
              'attributes': ['name'],
              'where'     : termsQuery
            },
            {
              'model'     : models.Currencies,
              'attributes': ['currencyCode'],
              'where'     : currencyQuery
            },
            {
              'model'     : models.Keywords,
              'attributes': ['keyword'],
              'where'     : keywordQuery
            }
          ],
          'order': [
            createSortQuery(Query.sort, Order[Query.order])
          ],
          'limit' : Query.limit ? Query.limit : dafaultLimit,
          'offset': Query.offset ? Query.offset : defaultOffset

        }
      )

    })
      .then((Suppliers) =>
        // create array of supplier object
        Promise.map(Suppliers.rows, (Supplier) => {
          const keywordsArray = Supplier.Keywords ? Supplier.Keywords.map((keyword) => keyword.keyword) : [];
          const terms = Supplier.Terms && Supplier.Terms.name ? Supplier.Terms.name : null;
          const currency = Supplier.Currency && Supplier.Currency.currencyCode ? Supplier.Currency.currencyCode : null;
          const data = {
            'id'         : Supplier.supplierID,
            'name'       : Supplier.name,
            'phone'      : Supplier.phone,
            'email'      : Supplier.email,
            'accountNum' : Supplier.accountNum,
            'businessNum': Supplier.businessNum,
            'contact'    : Supplier.contactName || Supplier.contactEmail || Supplier.contactPhone ? {
              'name' : Supplier.contactName,
              'email': Supplier.contactEmail,
              'phone': Supplier.contactPhone
            } : undefined,
            'shippingAddress': Supplier.shippingAddress,
            'billingAddress' : Supplier.billingAddress,
            'keywords'       : (Query.field.length > 0 && Query.field.indexOf('keywords') > -1)  || (Query.field.length === 0 || Query.field.indexOf('*') > -1) ? keywordsArray : undefined,
            'notes'          : Supplier.note,
            'terms'          : (Query.field.length > 0 && Query.field.split('terms') > -1) || (Query.field.length === 0 || Query.field.indexOf('*') > -1) ? terms : undefined,
            'currencyCode'   : (Query.field.length > 0 && Query.field.split('currency') > -1) || (Query.field.length === 0 || Query.field.indexOf('*') > -1) ? currency : undefined,
            'countryCode'    : Supplier.countryCode,
            'state'          : Supplier.state
          };
          return data;
        }
        )
      )
      .then((resData) => {
        result.results = resData;
        result.message = 'Successfully Retrieved Suppliers';
        result.total = resData.length;
        return response.status(200).send(result);
      })
      .catch(models.Sequelize.EmptyResultError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(models.Sequelize.ValidationError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch(invalidInputError, (err) => {
        response.status(400).send(invalidData(err, 400));
      })
      .catch((err) => {
        logger.error(err);
        response.status(500).send();
      });
  }
};

const invalidInputError = () => {
  const error = new Error('Invalid Input');
  error.name = 'InvalidInputError';
  return error;
};

const supplierNotExistError = () => {
  const error = new Error('Supplier does not exist');
  error.name = 'supplierNotExistError';
  return error;
};

const selectAttributes = (modelName, fields) => {
  switch (modelName) {
    case 'Suppliers':  {
      if (fields.length > 0 && fields.split(',').indexOf('*') === -1) {
        return fields.split(',').map((val) => {
          if (val === 'id') {
            return 'supplierID';
          } else if (val === 'name') {
            return val;
          } else if (val === 'phone') {
            return val;
          } else if (val === 'email') {
            return val;
          } else if (val === 'businessNum') {
            return val;
          } else if (val === 'shippingAddress') {
            return val;
          } else if (val === 'billingAddress') {
            return val;
          } else if (val === 'notes') {
            return 'note';
          } else if (val === 'state') {
            return val;
          } else if (val === 'contact') {
            return 'contactName,contactEmail,contactPhone';
          } else if (val === 'account') {
            return 'accountNum';
          }
          return undefined;
        }).filter((n) => n !== undefined);
      }
      return ['supplierUUID'];
    }
    default:  {
      return 1;
    }
  }
};

const createSortQuery = (key, order) => {
  switch (key) {
    case 'keyword': {
      return [models.Keywords, 'keyword', order];
    }
    case 'terms': {
      return [models.Terms, 'days',  order];
    }
    case 'currency': {
      return [models.Currencies, 'currency',  order];
    }
    case 'name': case 'account': {
      return [key,  order];
    }
    case 'contact': {
      return ['contactName',  order];
    }
    default: {
      return ['supplierUUID', order];
    }
  }
};

const Order = {
  'DESC'     : 'DESC',
  'ASC'      : 'ASC',
  'undefined': 'ASC'
};

// return status body
const invalidData = (err, status) => ({
  'status' : status,
  'code'   : err.code,
  'message': 'Invalid Input',
  'error'  : err
});
