'use strict';

import _ from 'lodash';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { QR_URL, BASE_URL, DEFAULT_QR_OPTS } from '../config';

// QR Utils
function generateQuizQRCode(threeWords, opts = null) {
  if (_.isNil(opts) || _.isEmpty(opts)) {
    opts = DEFAULT_QR_OPTS;
  }
  let encodedOpts = _.chain(opts)
    .map((v, k) => encodeURIComponent(`&${k}=${v}`))
    .join('')
    .value();
  return `${QR_URL}/?data=${BASE_URL}/${threeWords}${encodedOpts}`;
}

// Word Gen Utils
function generateThreeWords(seperator = '') {
  let file = resolve(join(__dirname, '..', '..', 'words', 'combined.txt'));
  let content = readFileSync(file, { encoding: 'utf8' });
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
  let file = resolve(join(__dirname, '..', '..', 'words', 'long_words.txt'));
  let words = readFileSync(file, { encoding: 'utf8' });
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

export {
  generateQuizQRCode,
  generateThreeWords,
  generateMWords,
  computePagination
};
