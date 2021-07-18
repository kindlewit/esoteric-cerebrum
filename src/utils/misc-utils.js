'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { QR_URL, BASE_URL, DEFAULT_QR_OPTS } = require('../../config');

// QR Utils
function generateQuizQRCode(threeWords, opts = null) {
  if (_.isNil(opts) || _.isEmpty(opts)) {
    opts = DEFAULT_QR_OPTS;
  }
  let encodedOpts = _.chain(opts).map((v, k) => encodeURIComponent(`&${k}=${v}`)).join('').value();
  return `${QR_URL}/?data=${BASE_URL}/${threeWords}${encodedOpts}`;
}

// Word Gen Utils
function generateThreeWords(seperator = '') {
  let content = fs.readFileSync(path.join(__dirname, '..', '..', 'words', 'combined.txt'), { encoding: 'utf8' });
  let [verbs, adjs, nouns] = content.split('|');
  let threeWords = [
    _.sample(verbs.split(',')),
    _.sample(adjs.split(',')),
    _.sample(nouns.split(','))
  ]
    .map(_.capitalize)
    .join(seperator);
  return threeWords;
}

function generateMWords(m, seperator = '') {
  let words = fs.readFileSync(path.join(__dirname, '..', '..', 'words', 'long_words.txt'), { encoding: 'utf8' });
  let threeWords = _.chain(words).split('\n').sampleSize(m).value();
  while (_.uniq(threeWords).length < (m - 1)) {
    threeWords = _.chain(words).split('\n').sampleSize(m).value();
  }
  return _.map(threeWords, _.capitalize).join(seperator);
}

function computePagination(page = 1, size = 10) {
  return {
    limit: parseInt(size),
    offset: parseInt(parseInt(page) - 1) * parseInt(size)
  };
}

module.exports = {
  generateQuizQRCode,
  generateThreeWords,
  generateMWords,
  computePagination
};
