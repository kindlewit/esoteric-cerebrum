"use strict";

const _ = require('lodash');

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[key]) || key === "created_at") {
      // Cannot insert user-defined created_at nor can it be altered
      _.omit(cleanObj, key);
    }
  }
  if (!_.isNil(doc.duration)) {
    cleanObj.duration = parseInt(doc.duration);
  }
  if (!_.isNil(doc.attended) && _.isString(doc.attended)) {
    cleanObj.attended = doc.attended.split(',');
  }
  return cleanObj;
}

function verifyUserAuthority(data, user) {
  /**
   * Verify if request user is the creator of data
   */
  if (_.isArray(data)) {
    // Check each in array
    for (let d of data) {
      if (d.username && user !== d.username) {
        return false;
      }
    }
    return true;
  }
  if (_.isObject(data)) {
    if (data.username) {
      return data.username === user;
    }
  }
  return false;
}

module.exports = {
  sanitize,
  verifyUserAuthority
};
