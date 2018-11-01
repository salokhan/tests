'use strict';

const request = require('supertest');
const utils = require('./index');
const models = require('../../../models');

/**
 * Helper to Pre-Populate Test DB with Test data
 **/
exports.prePopulateDB = () => models.Suppliers.bulkCreate([
  {
    'name'           : 'zyzz',
    'phone'          : '1546',
    'email'          : 'im.zyzz@outlook.com',
    'shippingAddress': 'populated address'
  }
]);

/**
 * Helper to POST /api/v1/suppliers
 * @param: options - A keyed object to override helper POST defaults
 *   params: object
 *   expectedCode: int
 *   expectedMessage: RegExp || String
 **/
exports.post = (options = {}) => {
  const route = '/api/v1/suppliers';
  const params = options.params || {};
  const expectedCode = options.expectedCode || 200;
  const expectedMessage = options.expectedMessage === undefined
    ? /"message":"Successfully Created Supplier"/
    : options.expectedMessage;
  return request(utils.apiUrl).post(route)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(params)
    .expect(expectedCode)
    .expect(expectedMessage);
};

/**
 * Helper to PUT /api/v1/suppliers
 * @param: options - A keyed object to override helper POST defaults
 *   options.id : int
 *   params: object
 *   expectedCode: int
 *   expectedMessage: RegExp || String
 **/
exports.put = (options = {}) => {
  const route = `/api/v1/suppliers/${options.id}`;
  const params = options.params || {};
  const expectedCode = options.expectedCode || 200;
  const expectedMessage = options.expectedMessage === undefined
    ? /"message":"Success"/
    : options.expectedMessage;
  return request(utils.apiUrl).put(route)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(params)
    .expect(expectedCode)
    .expect(expectedMessage);
};


/**
 * Helper to get /api/v1/suppliers
 * @param: options - A keyed object to override helper Get defaults
 *   query: object
 *   expectedCode: int
 *   expectedMessage: RegExp || String
 **/
exports.get = (options = {}) => {
  const query = options.query ? toQueryString(options.query) : 'field=';
  const route = `/api/v1/suppliers?${query}`;
  const expectedCode = options.expectedCode || 200;
  const expectedMessage = options.expectedMessage === undefined
    ? /"message":"Successfully Retrieved Suppliers"/
    : options.expectedMessage;
  return request(utils.apiUrl).get(route)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(expectedCode)
    .expect(expectedMessage);
};

/* Convert query object to query string */
const toQueryString = (paramsObject) => Object.keys(paramsObject)
  .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
  .join('&')
;
