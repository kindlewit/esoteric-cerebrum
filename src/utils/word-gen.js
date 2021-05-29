const fs = require('fs');
const path = require('path');
const _ = require('lodash');

function generateThreeWords(seperator = "") {
  let words = fs.readFileSync(path.join(__dirname, '..', '..', 'long_words.txt'), { encoding: 'utf8' });
  let threeWords = _.chain(words).split('\n').sampleSize(3).value();
  while (_.uniq(threeWords).length < 2) {
    threeWords = _.chain(words).split('\n').sampleSize(3).value();
  }
  return _.map(threeWords, _.capitalize).join(seperator);
}

function generateMWords(m, seperator = "") {
  let words = fs.readFileSync(path.join(__dirname, '..', 'long_words.txt'), { encoding: 'utf8' });
  let threeWords = _.chain(words).split('\n').sampleSize(m).value();
  while (_.uniq(threeWords).length < (m - 1)) {
    threeWords = _.chain(words).split('\n').sampleSize(m).value();
  }
  return _.map(threeWords, _.capitalize).join(seperator);
}

module.exports = {
  generateThreeWords,
  generateMWords
};
