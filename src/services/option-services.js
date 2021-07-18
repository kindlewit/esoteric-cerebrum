'use strict';

const db = require('../orm');
const { sanitize } = require('../utils/option-utils');

function create(doc) {
  return new Promise((resolve, reject) => {
    doc = sanitize(doc);
    db.option.create(doc, { raw: true, returning: true })
      .then(doc => resolve(doc))
      .catch(e => reject(e));
  });
}

function list(limit = null, offset = null) {
  return db.option.findAll({
    limit,
    offset,
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
