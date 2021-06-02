"use strict";

const _ = require('lodash');

const { QR_URL, BASE_URL, DEFAULT_QR_OPTS } = require('../../config');

function generateQuizQRCode(threeWords, opts = DEFAULT_QR_OPTS) {
  return QR_URL + `/?data=${BASE_URL}/${threeWords}` + _.chain(opts).map((v, k) => encodeURI(`&${k}=${v}`)).join('').value();
}

module.exports = {
  generateQuizQRCode
};
