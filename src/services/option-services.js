"use strict";

const _ = require('lodash');
const db = require('../orm');

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[key]) || key === "created_at") {
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

function create(doc) {
  return new Promise((resolve, reject) => {
    doc = sanitize(doc);
    db.option.create(doc)
      .then(() => db.option.findOne({
        where: {
          three_words: doc.three_words,
          number: doc.number,
          character: doc.character
        },
        raw: true
      }))
      .then(doc => resolve(doc))
      .catch(e => reject(e));
  });
}

function list(limit = null, offset = null) {
  return db.option.findAll({
    limit: limit,
    offset: offset,
    raw: true
  });
}

function count() {
  return db.option.count();
}

function find(query) {
  return db.option.findAll({ ...query, raw: true });
}

function get(threeWords, qNum, char) {
  return db.option.findOne({
    where: {
      three_words: threeWords,
      number: qNum,
      character: char
    },
    raw: true
  });
}

function update(threeWords, qNum, char, changes) {
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.option.update(changes, {
      where: {
        three_words: threeWords,
        number: qNum,
        character: char
      }
    })
      .then(() => db.option.findOne({
        where: {
          three_words: threeWords,
          number: qNum,
          character: char
        },
        raw: true
      }))
      .then(doc => resolve(doc))
      .catch(e => reject(e));
  });
}

function remove(threeWords, qNum, char) {
  return db.option.destroy({
    where: {
      three_words: threeWords,
      number: qNum,
      character: char
    },
    raw: true
  });
}

module.exports = {
  create,
  list,
  count,
  find,
  get,
  update,
  remove
};
