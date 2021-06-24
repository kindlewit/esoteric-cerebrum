"use strict";

const _ = require('lodash');
const db = require('../orm');

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[key]) || key === "created_at") {
      // Cannot insert user-defined created_at nor can it be altered
      _.omit(cleanObj, key);
    }
  }
  if (!_.isNil(doc.number) && _.isString(doc.number)) {
    cleanObj.number = parseInt(doc.number);
  }
  if (!_.isNil(doc.score) && _.isString(doc.score)) {
    cleanObj.score = parseFloat(doc.score);
  }
  return cleanObj;
}

async function create(doc) {
  doc = sanitize(doc);
  await db.response.create(doc);
  return doc;
}

function list(limit = null, offset = null) {
  return new Promise((resolve, reject) => {
    db.response.findAll({
      offset: offset,
      limit: limit,
      order: [
        ['created_at', 'DESC']
      ],
      raw: true
    })
      .then(docs => resolve(_.cloneDeep(docs)))
      .catch(e => reject(e));
  });
}

function count() {
  return db.quiz.count();
}

function get(threeWords, username, qNum) {
  if (_.isNil(threeWords) || _.isNil(username) || _.isNil(qNum)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    db.response.findOne({
      where: {
        three_words: threeWords,
        username: username,
        number: qNum
      },
      order: [
        ['created_at', 'DESC']
      ], raw: true
    })
      .then(doc => resolve(_.cloneDeep(doc)))
      .catch(e => reject(e));
  });
}

function findByQuery(query) {
  if (_.isNil(query) || _.isEmpty(query)) {
    throw Error("Missing parameters");
  }
  query.raw = true;
  return new Promise((resolve, reject) => {
    db.response.findAll(query)
      .then(docs => resolve(_.cloneDeep(docs)))
      .catch(e => reject(e));
  });
}

function update(threeWords, username, qNum, changes) {
  if (_.isNil(threeWords) || _.isNil(username) || _.isNil(qNum) || _.isNil(changes)) {
    throw Error("Missing parameters");
  }
  changes = sanitize(changes);
  let query = { where: { three_words: threeWords, username: username, number: qNum }, raw: true };
  return new Promise((resolve, reject) => {
    db.response.update(changes, query)
      .then(() => db.response.findOne(query))
      .then(doc => resolve(_.cloneDeep(doc)))
      .catch(e => reject(e));
  });
}

function remove(threeWords, username, qNum) {
  if (_.isNil(threeWords) || _.isNil(username) || _.isNil(qNum)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    db.response.destroy({
      where: {
        three_words: threeWords,
        username: username,
        qNum: qNum
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

module.exports = {
  create,
  list,
  count,
  get,
  findByQuery,
  update,
  remove
};
