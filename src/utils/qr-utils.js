"use strict";

const _ = require('lodash');
const { QR_URL, BASE_URL, DEFAULT_QR_OPTS } = require('../../config');

function generateQuizQRCode(threeWords, opts = null) {
  if (_.isNil(opts) || _.isEmpty(opts)) {
    opts = DEFAULT_QR_OPTS;
  }
  let encodedOpts = _.chain(opts).map((v, k) => encodeURIComponent(`&${k}=${v}`)).join('').value();
  return `${QR_URL}/?data=${BASE_URL}/${threeWords}${encodedOpts}`;
}

module.exports = {
  generateQuizQRCode
};
