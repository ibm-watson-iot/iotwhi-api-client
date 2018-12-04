/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict';

const pluralize = require('pluralize');
const request = require('request-promise');

class DefaultAdapter {

  constructor(host, path, tenantId, bearerToken) {
    this.host = host;
    this.path = `${path}/${tenantId}`;
    this.tenantId = tenantId;
    if (bearerToken) {
      this.headers = {
        Authorization: bearerToken
      };
    }
  }

  setBearerToken(bearerToken) {
    if (bearerToken) {
      this.headers = {
        Authorization: bearerToken
      };
    }
  }

  findRecord(type, id, desiredRole) {
    const url = this._buildUrl(type, id, desiredRole);
    return this._doRequest({ method: 'get', url: url, headers: this.headers, json: true });
  }

  findAll(type, queryParams = {}, desiredRole) {
    const url = this._buildUrl(type, null, desiredRole);
    return this._doRequest({ method: 'get', url: url, headers: this.headers, qs: queryParams, json: true });
  }

  createRecord(type, record, desiredRole) {
    const url = this._buildUrl(type, null, desiredRole);
    return this._doRequest({ method: 'post', url: url, headers: this.headers, json: true }, record);
  }

  updateRecord(type, record, desiredRole) {
    const url = this._buildUrl(type, record._id, desiredRole);
    return this._doRequest({ method: 'post', url: url, headers: this.headers, json: true, data: record }, record);
  }

  deleteRecord(type, id, desiredRole) {
    const url = this._buildUrl(type, id, desiredRole);
    return this._doRequest({ method: 'delete', url: url, headers: this.headers, json: true });
  }

  rpc(type, action, data) {
    throw new Error('Not implemented');
  }

  _doRequest(options, json) {
    if (json) {
      return request(options).json(json);
    }
    return request(options);
  }

  _buildUrl(modelName, id, desiredRole) {
    const parts = [this.host, this.path, pluralize(modelName), id].filter(i => i !== undefined);
    if (desiredRole) {
      return parts.join('/') + `?desiredRole=${desiredRole}`;
    }
    return parts.join('/');
  }

}

module.exports = DefaultAdapter;
