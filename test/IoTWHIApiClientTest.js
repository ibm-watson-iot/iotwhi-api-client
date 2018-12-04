/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict';

require('chai').should();
const nock = require('nock');
const IoTWHIApiClient = require('../lib').IoTWHIApiClient;

const iotwhiApiHost = 'http://iotwhi.ibm.com';
const iotwhiApiPath = 'api/v1';
const tenantId = 'te_asd37mm9';
const desiredRole = 'administrator';
const bearerToken = 'Bearer asdfghjklzxcvbnmqwertyuiop';
const testShield1 = require('./data/test-shield1.json');
const testShield2 = require('./data/test-shield2.json');
const testShield3 = require('./data/test-shield3.json');

const EDGE_SHIELD_TYPE = 'edge';
const CLOUD_SHIELD_TYPE = 'cloud';

const iotwhiApiClient = new IoTWHIApiClient(iotwhiApiHost, iotwhiApiPath, tenantId, bearerToken);

describe('IoTWHIApiClientTest', () => {

  before(() => {

    nock(iotwhiApiHost, { reqheaders: { authorization: bearerToken } })
      .get(`/${iotwhiApiPath}/${tenantId}/shields/${testShield1._id}`).times(Infinity)
      .query({ desiredRole: desiredRole })
      .reply(200, testShield1);

    nock(iotwhiApiHost, { reqheaders: { authorization: bearerToken } })
      .get(`/${iotwhiApiPath}/${tenantId}/shields/`).times(Infinity)
      .query({ desiredRole: desiredRole })
      .reply(200, { items: [testShield1, testShield2, testShield3] });

    nock(iotwhiApiHost, { reqheaders: { authorization: bearerToken } })
      .get(`/${iotwhiApiPath}/${tenantId}/shields/`).times(Infinity)
      .query({ desiredRole: desiredRole, type: EDGE_SHIELD_TYPE })
      .reply(200, { items: [testShield1, testShield2] });

    nock(iotwhiApiHost, { reqheaders: { authorization: bearerToken } })
      .get(`/${iotwhiApiPath}/${tenantId}/shields/`).times(Infinity)
      .query({ desiredRole: desiredRole, type: CLOUD_SHIELD_TYPE })
      .reply(200, { items: [testShield3] });

    nock(iotwhiApiHost, { reqheaders: { authorization: bearerToken } })
      .post(`/${iotwhiApiPath}/${tenantId}/shields/`).times(Infinity)
      .query(true)
      .reply(201, (uri, requestBody) => {
        return requestBody;
      });

    nock(iotwhiApiHost, { reqheaders: { authorization: bearerToken } })
      .post(`/${iotwhiApiPath}/${tenantId}/shields/${testShield2._id}`).times(Infinity)
      .query(true)
      .reply(201, (uri, requestBody) => {
        return requestBody;
      });

    nock(iotwhiApiHost, { reqheaders: { authorization: bearerToken } })
      .delete(`/${iotwhiApiPath}/${tenantId}/shields/${testShield3._id}`).times(Infinity)
      .query(true)
      .reply(200, { ok: true, id: testShield3._id });
  });

  after(() => {
    nock.cleanAll();
  });

  describe('find', () => {
    it('should respond with shield document', () => {
      return iotwhiApiClient.findRecord('shield', testShield1._id, desiredRole)
        .then((shield) => {
          shield.should.have.property('_id');
          shield.should.have.property('_rev');
          shield.should.have.property('docType');
          shield.should.have.property('docType', 'shield');
          shield.should.have.property('type');
          shield.should.have.property('type', testShield1.type);
        });
    });
  });

  describe('findAll', () => {
    it('should list all shields', () => {
      return iotwhiApiClient.findAll('shield', desiredRole)
        .then((shields) => {
          shields.should.have.property('length', 3);
          shields[0].should.have.property('type', EDGE_SHIELD_TYPE);
          shields[1].should.have.property('type', EDGE_SHIELD_TYPE);
          shields[2].should.have.property('type', CLOUD_SHIELD_TYPE);
        });
    });
    it('should list all edge shields', () => {
      return iotwhiApiClient.findAll('shield', desiredRole, { type: EDGE_SHIELD_TYPE })
        .then((shields) => {
          shields.should.have.property('length', 2);
          shields[0].should.have.property('type', EDGE_SHIELD_TYPE);
          shields[1].should.have.property('type', EDGE_SHIELD_TYPE);
        });
    });
    it('should list all cloud shields', () => {
      return iotwhiApiClient.findAll('shield', desiredRole, { type: CLOUD_SHIELD_TYPE })
        .then((shields) => {
          shields.should.have.property('length', 1);
          shields[0].should.have.property('type', CLOUD_SHIELD_TYPE);
        });
    });
  });

  describe('createRecord', () => {
    it('should create a shield', () => {
      const newShield = Object.assign({}, testShield2);
      newShield._id = 'sh_w12as9ha';
      newShield.name = 'Temperature test shield';
      newShield.description = 'Testing a new temperature sensor';
      return iotwhiApiClient.createRecord('shield', newShield, desiredRole)
        .then((shield) => {
          shield.should.have.property('_id');
          shield.should.have.property('_id', newShield._id);
          shield.should.have.property('name');
          shield.should.have.property('name', newShield.name);
        });
    });
  });

  describe('updateRecord', () => {
    it('should update the shield', () => {
      const shieldToUpdate = Object.assign({}, testShield2);
      shieldToUpdate.name = 'New sensor test shield';
      return iotwhiApiClient.updateRecord('shield', shieldToUpdate, desiredRole)
        .then((shield) => {
          shield.should.have.property('name');
          shield.should.have.property('name', shieldToUpdate.name);
        });
    });
  });

  describe('deleteRecord', () => {
    it('should delete the shield', () => {
      return iotwhiApiClient.deleteRecord('shield', testShield3._id, desiredRole)
        .then((result) => {
          result.should.have.property('ok', true);
          result.should.have.property('id', testShield3._id);
        });
    });
  });

});
