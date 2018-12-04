/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict';

const Stream = require('stream');
const request = require('request-promise');
const DefaultAdapter = require('./default-adapter');


class ShieldCodeAdapter extends DefaultAdapter {

  createRecord(type, record, desiredRole) {
    let hasFile = false;

    Object.keys(record).forEach((key) => {
      if (record[key] instanceof Stream) {
        hasFile = true;
      }
    });

    if (hasFile) {
      Object.keys(record).forEach((key) => {
        if (!(record[key] instanceof Stream) && (record[key] instanceof Object || Array.isArray(record[key]))) {
          record[key] = JSON.stringify(record[key]);
        }
      });
    }

    if (record._id) {
      const url = this._buildUrl(type, record._id);
      if (hasFile) {
        return request.put({ url: url, formData: record, json: true, headers: this.headers });
      } else {
        return request.post(url, { headers: this.headers }).json(record);
      }
    } else {
      const url = this._buildUrl(type);
      if (hasFile) {
        return request.post({ url: url, formData: record, json: true, headers: this.headers });
      } else {
        return request.post(url, { headers: this.headers }).json(record);
      }
    }
  }

}

module.exports = new ShieldCodeAdapter();
