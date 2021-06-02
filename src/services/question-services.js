"use strict";

const _ = require('lodash');
const db = require('../orm');

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[key]) || key === "created_at") {
      _.omit(doc, key);
    }
  }
  if (!_.isNil(doc.duration)) {
    cleanObj.duration = parseInt(doc.duration);
  }
  if (!_.isNil(doc.number) && _.isString(doc.number)) {
    cleanObj.number = _.parseInt(doc.number);
  }
  if (!_.isNil(doc.weightage) && _.isString(doc.weightage)) {
    cleanObj.weightage = parseFloat(doc.weightage);
  }
  return cleanObj;
}
async function create(doc) {
  try {
    doc = sanitize(doc);
    await db.question.create(doc);
    return doc;
  } catch (e) {
    throw Error(e);
  }
}

function list(limit = null, offset = null) {
  return new Promise((resolve, reject) => {
    db.question.findAll({
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
  return db.question.count();
}

function get(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    return false;
  }
  return new Promise((resolve, reject) => {
    db.question.findOne({
      where: {
        three_words: threeWords,
        number: qNum
      },
      raw: true
    })
      .then(doc => resolve(_.cloneDeep(doc)))
      .catch(e => reject(e));
  });
}

function update(threeWords, qNum, changes) {
  if (_.isNil(threeWords) || _.isNil(qNum) || _.isNil(changes)) {
    return false;
  }
  changes = this.sanitize(changes);
  let query = { where: { three_words: threeWords, number: qNum }, raw: true };
  return new Promise((resolve, reject) => {
    db.question.update(changes, query)
      .then(() => db.question.findOne(query))
      .then(doc => resolve(_.cloneDeep(doc)))
      .catch(e => reject(e));
  });
}

function remove(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    return false;
  }
  return new Promise((resolve, reject) => {
    db.user.destroy({
      where: {
        three_words: threeWords,
        number: qNum
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeResponses(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    return false;
  }
  let query = { where: { three_words: threeWords, number: qNum } };
  return new Promise((resolve, reject) => {
    db.response.destroy(query)
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeOptions(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    return false;
  }
  let query = { where: { three_words: threeWords, number: qNum } };
  return new Promise((resolve, reject) => {
    db.option.destroy(query)
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeAnswers(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    return false;
  }
  let query = { where: { three_words: threeWords, number: qNum } };
  return new Promise((resolve, reject) => {
    db.answer.destroy(query)
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function purge(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    return false;
  }
  let query = { where: { three_words: threeWords, number: qNum } };
  return new Promise((resolve, reject) => {
    db.question.destroy(query)
      .then(() => db.response.destroy(query))
      .then(() => db.option.destroy(query))
      .then(() => db.answer.destroy(query))
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

module.exports = {
  create,
  list,
  count,
  get,
  update,
  remove,
  purge,
  removeResponses,
  removeOptions,
  removeAnswers
};
