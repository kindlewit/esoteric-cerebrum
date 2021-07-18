'use strict';

const _ = require('lodash');

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[ key ]) || key === 'created_at') {
      _.omit(cleanObj, key);
    }
  }
  if (_.has(doc, 'character')) {
    cleanObj.character = doc.character.toString().toUpperCase();
  }
  if (_.has(doc, 'number') && _.isString(doc.number)) {
    cleanObj.number = parseInt(doc.number);
  }
  return cleanObj;
}

module.exports = {
  sanitize
};
