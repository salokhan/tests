'use strict';

const expect = require('chai').expect;
const utils = require('../utils');

utils.initTests();
describe('E2E Supplier API Tests', () => {
  beforeEach(() => utils.cleanDB()
    .then(() => utils.currencies.prePopulateDB()).then(() => utils.terms.prePopulateDB()).then(() => utils.suppliers.prePopulateDB())
  );

  describe('POST /api/v1/suppliers', () => {
    it('should not create a supplier and get invalid input message', () => {
      const options = {
        'params': {
          'name'           : 'jack',
          'phone'          : '1546g',
          'email'          : 'im.jack@outlook.com',
          'shippingAddress': 'this is address',
          'notes'          : 'nothing in notes',
          'terms'          : 'test1',
          'currencyCode'   : 'USD'
        },
        'expectedCode'   : 400,
        'expectedMessage': /"message":"Invalid Input"/
      };
      return utils.suppliers.post(options)
        .then((res) => {
          expect(res.body.message).to.equal('Invalid Input');
        });
    });
    it('should successfully create a supplier', () => {
      const options = {
        'params': {
          'name'           : 'jack',
          'phone'          : '1546',
          'email'          : 'im.jack@outlook.com',
          'shippingAddress': 'this is address',
          'notes'          : 'nothing in notes',
          'terms'          : 'test1',
          'currencyCode'   : 'USD'
        },
        'expectedCode'   : 201,
        'expectedMessage': /"message":"Successfully Created Supplier"/
      };
      return utils.suppliers.post(options)
        .then((res) => {
          expect(res.body.data.name).to.equal('jack');
          expect(res.body.data.phone).to.equal('1546');
          expect(res.body.data.email).to.equal('im.jack@outlook.com');
          expect(res.body.data.shippingAddress).to.equal('this is address');
          expect(res.body.data.notes).to.equal('nothing in notes');
          expect(res.body.data.terms).to.equal('test1');
          expect(res.body.data.currencyCode).to.equal('USD');
        });
    });
    it('should successfully create a supplier with full data', () => {
      const options = {
        'params': {
          'name'       : 'jack',
          'phone'      : '1546',
          'email'      : 'im.jack@outlook.com',
          'accountNum' : '123456',
          'businessNum': '123456',
          'website'    : 'http://google.com',
          'contact'    : {
            'name' : 'john',
            'email': 'im.john@outlook.com',
            'phone': '123456'
          },
          'shippingAddress': 'this is address',
          'billingAddress' : 'this is address',
          'keywords'       : [
            'pu10', 'sal10'
          ],
          'notes'       : 'nothing in notes',
          'terms'       : 'test1',
          'currencyCode': 'USD',
          'countryCode' : 'CAN',
          'state'       : 'CA_QC'
        },
        'expectedCode'   : 201,
        'expectedMessage': /"message":"Successfully Created Supplier"/
      };
      return utils.suppliers.post(options)
        .then((res) => {
          expect(res.body.data.id).to.equal(2);
          expect(res.body.data.name).to.equal('jack');
          expect(res.body.data.phone).to.equal('1546');
          expect(res.body.data.email).to.equal('im.jack@outlook.com');
          expect(res.body.data.accountNum).to.equal('123456');
          expect(res.body.data.businessNum).to.equal('123456');
          expect(res.body.data.contact.name).to.equal('john');
          expect(res.body.data.contact.email).to.equal('im.john@outlook.com');
          expect(res.body.data.contact.phone).to.equal('123456');
          expect(res.body.data.shippingAddress).to.equal('this is address');
          expect(res.body.data.billingAddress).to.equal('this is address');
          expect(res.body.data.keywords).to.deep.equal(['pu10', 'sal10']);
          expect(res.body.data.notes).to.equal('nothing in notes');
          expect(res.body.data.terms).to.equal('test1');
          expect(res.body.data.currencyCode).to.equal('USD');
          expect(res.body.data.countryCode).to.equal('CAN');
          expect(res.body.data.state).to.equal('CA_QC');
        });
    });
  });

  describe('PUT /api/v1/suppliers/{supplierID}', () => {
    it('should not update a supplier and get invalid input message', () => {
      const options = {
        'params': {
          'name'           : 'jack',
          'phone'          : '1546g',
          'email'          : 'im.jack@outlook.com',
          'shippingAddress': 'this is address',
          'notes'          : 'nothing in notes',
          'terms'          : 'test1',
          'currencyCode'   : 'USD'
        },
        'id'             : 1,
        'expectedCode'   : 400,
        'expectedMessage': /"message":"Invalid Input"/
      };
      return utils.suppliers.put(options)
        .then((res) => {
          expect(res.body.message).to.equal('Invalid Input');
        });
    });
    it('should successfully update a supplier', () => {
      const options = {
        'params': {
          'name'    : 'jack',
          'keywords': [
            'pu10', 'sal10'
          ],
          'countryCode': 'CAN',
          'state'      : 'CA_QC'
        },
        'id'             : 1,
        'expectedCode'   : 200,
        'expectedMessage': /"message":"Success"/
      };
      return utils.suppliers.put(options)
        .then((res) => {
          expect(res.body.data.id).to.equal(1);
          expect(res.body.data.name).to.equal('jack');
          expect(res.body.data.keywords).to.deep.equal(['pu10', 'sal10']);
          expect(res.body.data.countryCode).to.equal('CAN');
          expect(res.body.data.state).to.equal('CA_QC');
        });
    });
    it('should successfully update a supplier with full data', () => {
      const options = {
        'params': {
          'name'       : 'jack',
          'phone'      : '1546',
          'email'      : 'im.jack@outlook.com',
          'accountNum' : '123456',
          'businessNum': '123456',
          'website'    : 'http://google.com',
          'contact'    : {
            'name' : 'john',
            'email': 'im.john@outlook.com',
            'phone': '123456'
          },
          'shippingAddress': 'this is address',
          'billingAddress' : 'this is address',
          'keywords'       : [
            'pu10', 'sal10'
          ],
          'notes'       : 'nothing in notes',
          'terms'       : 'test1',
          'currencyCode': 'USD',
          'countryCode' : 'CAN',
          'state'       : 'CA_QC'
        },
        'id'             : 1,
        'expectedCode'   : 200,
        'expectedMessage': /"message":"Success"/
      };
      return utils.suppliers.put(options)
        .then((res) => {
          expect(res.body.data.id).to.equal(1);
          expect(res.body.data.name).to.equal('jack');
          expect(res.body.data.phone).to.equal('1546');
          expect(res.body.data.email).to.equal('im.jack@outlook.com');
          expect(res.body.data.accountNum).to.equal('123456');
          expect(res.body.data.businessNum).to.equal('123456');
          expect(res.body.data.contact.name).to.equal('john');
          expect(res.body.data.contact.email).to.equal('im.john@outlook.com');
          expect(res.body.data.contact.phone).to.equal('123456');
          expect(res.body.data.shippingAddress).to.equal('this is address');
          expect(res.body.data.billingAddress).to.equal('this is address');
          expect(res.body.data.keywords).to.deep.equal(['pu10', 'sal10']);
          expect(res.body.data.notes).to.equal('nothing in notes');
          expect(res.body.data.terms).to.equal('test1');
          expect(res.body.data.currencyCode).to.equal('USD');
          expect(res.body.data.countryCode).to.equal('CAN');
          expect(res.body.data.state).to.equal('CA_QC');
        });
    });
  });

  describe('GET /api/v1/suppliers', () => {    
    it('should successfully get list of all suppliers', () => {
      const options = {
        'query'          : {'field': ''},
        'expectedCode'   : 200,
        'expectedMessage': /"message":"Successfully Retrieved Suppliers"/
      };
      return utils.suppliers.get(options)
        .then((res) => {
          expect(res.body.results[0].id).to.equal(1);
        });
    });
    it('should successfully get list of all suppliers with query for name', () => {
      const options = {
        'query': {
          'name'  : 'zyzz',
          'field' : '*',
          'limit' : 50,
          'offset': 0
        },
        'expectedCode'   : 200,
        'expectedMessage': /"message":"Successfully Retrieved Suppliers"/
      };
      return utils.suppliers.get(options)
        .then((res) => {
          expect(res.body.results[0].name).to.equal('zyzz');
        });
    });
    it('should successfully get list of all suppliers containing name, phone and email field', () => {
      const options = {
        'query': {
          'field' : 'name,phone,email',
          'limit' : 50,
          'offset': 0
        },
        'expectedCode'   : 200,
        'expectedMessage': /"message":"Successfully Retrieved Suppliers"/
      };
      return utils.suppliers.get(options)
        .then((res) => {
          expect(res.body.results[0].name).to.not.equal(undefined);
          expect(res.body.results[0].phone).to.not.equal(undefined);
          expect(res.body.results[0].email).to.not.equal(undefined);
          expect(res.body.results[0].id).to.equal(undefined);
          expect(res.body.results[0].accountNum).to.equal(undefined);
          expect(res.body.results[0].businessNum).to.equal(undefined);
          expect(res.body.results[0].contact).to.equal(undefined);
          expect(res.body.results[0].shippingAddress).to.equal(undefined);
          expect(res.body.results[0].billingAddress).to.equal(undefined);
          expect(res.body.results[0].keywords).to.equal(undefined);
          expect(res.body.results[0].notes).to.equal(undefined);
          expect(res.body.results[0].terms).to.equal(undefined);
          expect(res.body.results[0].currencyCode).to.equal(undefined);
          expect(res.body.results[0].countryCode).to.equal(undefined);
          expect(res.body.results[0].state).to.equal(undefined);
        });
    });
  });
});


