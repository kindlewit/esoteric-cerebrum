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
  if (!_.isNil(doc.duration)) {
    cleanObj.duration = parseInt(doc.duration);
  }
  if (!_.isNil(doc.number) && _.isString(doc.number)) {
    cleanObj.number = parseInt(doc.number);
  }
  if (!_.isNil(doc.weightage) && _.isString(doc.weightage)) {
    cleanObj.weightage = parseFloat(doc.weightage);
  }
  return cleanObj;
}

function create(doc) {
  return new Promise((resolve, reject) => {
    doc = sanitize(doc);
    db.question.create(doc)
      .then(() => db.question.findOne({
        where: {
          three_words: doc.three_words,
          number: doc.number
        },
        raw: true,
        returning: true
      }))
      .then(doc => resolve(doc))
      .catch(e => reject(e));
  });
}

function bulkCreate(docs) {
  return new Promise((resolve, reject) => {
    docs = docs.map(sanitize);
    db.question.bulkCreate(docs, { returning: true, raw: true })
      .then(docs => resolve(docs))
      .catch(e => reject(e));
  });
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

function find(query) {
  return db.question.findAll({ ...query, raw: true });
}

function get(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    throw Error("Missing parameters");
  }
  return db.question.findOne({
    where: {
      three_words: threeWords,
      number: qNum
    },
    raw: true
  });
}

async function getLinked(threeWords, qNum, list) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    throw Error("Missing parameters");
  }
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    },
    raw: true
  };
  let questionDoc = await db.question.findOne(query);
  if (_.isEmpty(questionDoc)) {
    return {};
  }
  let result = { ...questionDoc };
  query.attributes = { exclude: ['three_words', 'number'] };
  if (_.includes(list, "responses")) {
    result.responses = await db.response.findAll(query) ?? [];
    result.total_responses = result.responses.length;
  }
  if (_.includes(list, "options")) {
    result.options = await db.option.findAll(query) ?? [];
    result.total_options = result.options.length;
  }
  if (_.includes(list, "answers")) {
    result.answers = await db.answer.findAll(query) ?? [];
    result.total_answers = result.answers.length;
  }
  return result;
}

function update(threeWords, qNum, changes) {
  if (_.isNil(threeWords) || _.isNil(qNum) || _.isNil(changes)) {
    throw Error("Missing parameters");
  }
  changes = sanitize(changes);
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    },
    raw: true
  };
  return new Promise((resolve, reject) => {
    db.question.update(changes, query)
      .then(() => db.question.findOne(query))
      .then(doc => resolve(_.cloneDeep(doc)))
      .catch(e => reject(e));
  });
}

function remove(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    throw Error("Missing parameters");
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
    throw Error("Missing parameters");
  }
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    }
  };
  return new Promise((resolve, reject) => {
    db.response.destroy(query)
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeOptions(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    throw Error("Missing parameters");
  }
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    }
  };
  return new Promise((resolve, reject) => {
    db.option.destroy(query)
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeAnswers(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    throw Error("Missing parameters");
  }
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    }
  };
  return new Promise((resolve, reject) => {
    db.answer.destroy(query)
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function purge(threeWords, qNum) {
  if (_.isNil(threeWords) || _.isNil(qNum)) {
    throw Error("Missing parameters");
  }
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    }
  };
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
  bulkCreate,
  list,
  count,
  find,
  get,
  getLinked,
  update,
  remove,
  purge,
  removeResponses,
  removeOptions,
  removeAnswers
};
