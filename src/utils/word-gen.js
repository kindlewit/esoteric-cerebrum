const fs = require('fs');
const path = require('path');
const _ = require('lodash');

function generateThreeWords(seperator = "") {
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

function generateMWords(m, seperator = "") {
  let words = fs.readFileSync(path.join(__dirname, '..', '..', 'words', 'long_words.txt'), { encoding: 'utf8' });
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
