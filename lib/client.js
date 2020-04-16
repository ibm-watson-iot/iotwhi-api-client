/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict';

const request = require('request-promise');

/**
 * API client to talk with IoTWHI API.
 * By default it will use `default-adapter` for all record types.
 * If you need some customization for a specific record type, you can
 * create a <type>-adapter.js file to implement it. The file will be
 * automatically used.
 **/
class IoTWHIApiClient {

  constructor(host, path, tenantId, bearerToken) {
    this.host = host;
    this.path = path;
    this.tenantId = tenantId;
    this.bearerToken = bearerToken;
    this.adapters = {};
  }

  getToken(key, secret) {
    const httpOptions = {
      method: 'POST',
      json: true,
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      url: `${this.host}${this.path}/token`,
      formData: {
        grant_type: 'password',
        userId: this.tenantId,
        username: key,
        password: secret
      }
    };
    return request(httpOptions);
  }

  setBearerToken(bearerToken) {
    if (bearerToken) {
      if (!bearerToken.startsWith('Bearer ')) {
        bearerToken = `Bearer ${bearerToken}`;
      }
      this.bearerToken = bearerToken;
      Object.keys(this.adapters).forEach((type) => {
        this.adapters[type].setBearerToken(bearerToken);
      });
    }
  }

  findRecord(type, id, desiredRole) {
    return this._getAdapter(type).findRecord(type, id, desiredRole);
  }

  findAll(type, queryParams = {}, desiredRole) {
    return this._getAdapter(type).findAll(type, queryParams, desiredRole)
      .then(data => data.items);
  }

  createRecord(type, record, desiredRole) {
    if (desiredRole === 'administrator' && (!record.contexts || record.contexts.length === 0)) {
      record.contexts = ['ORG.' + this.tenantId];
    }
    return this._getAdapter(type).createRecord(type, record, desiredRole);
  }

  updateRecord(type, record, desiredRole) {
    return this._getAdapter(type).updateRecord(type, record, desiredRole);
  }

  deleteRecord(type, id, desiredRole) {
    return this._getAdapter(type).deleteRecord(type, id, desiredRole);
  }

  rpc(type, action, data) {
    return this._getAdapter(type).rpc(type, action, data);
  }

  registerAdapter(type, adapter) {
    this.adapters[type] = adapter;
  }

  _getAdapter(type) {
    if (this.adapters[type]) {
      return this.adapters[type];
    }
    try {
      const Adapter = require(`./${type}-adapter`);
      this.adapters[type] = new Adapter(this.host, this.path, this.tenantId, this.bearerToken);
      return this.adapters[type];
    } catch (e) {
      if (e.message.indexOf('Cannot find module') >= 0) {
        const DefaultAdapter = require('./default-adapter');
        this.adapters[type] = new DefaultAdapter(this.host, this.path, this.tenantId, this.bearerToken);
        return this.adapters[type];
      }
      throw e;
    }
  }
}

module.exports = IoTWHIApiClient;
