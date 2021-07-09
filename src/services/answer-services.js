"use strict";

const db = require('../orm');

const { sanitize } = require('../utils/answer-utils');

function create(doc) {
  return new Promise((resolve, reject) => {
    doc = sanitize(doc);
    db.answer.create(doc)
      .then(() => db.answer.findOne({
        where: {
          three_words: doc.three_words,
          number: doc.number
        },
        raw: true
      }))
      .then(doc => resolve(doc))
      .catch(e => reject(e));
  });
}

function bulkCreate(docs) {
  return new Promise((resolve, reject) => {
    docs = docs.map(sanitize);
    db.answer.bulkCreate(docs, { returning: true, raw: true })
      .then(docs => resolve(docs))
      .catch(e => reject(e));
  });
}

function list(limit = null, offset = null) {
  return db.answer.findAll({
    limit: limit,
    offset: offset,
    raw: true
  });
}

function count() {
  return db.answer.count();
}

function get(threeWords, qNum) {
  return db.answer.findOne({
    where: {
      three_words: threeWords,
      number: qNum
    },
    raw: true
  });
}

function update(threeWords, qNum, changes) {
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.answer.update(changes, {
      where: {
        three_words: threeWords,
        number: qNum
      }
    })
      .then(() => db.answer.findOne({
        where: {
          three_words: threeWords,
          number: qNum
        },
        raw: true
      }))
      .then(doc => resolve(doc))
      .catch(e => reject(e));
  });
}

function remove(threeWords, qNum) {
  return db.answer.destroy({
    where: {
      three_words: threeWords,
      number: qNum
    },
    raw: true
  });
}

module.exports = {
  create,
  bulkCreate,
  list,
  count,
  get,
  update,
  remove
};
