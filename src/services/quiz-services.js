"use strict";

const _ = require('lodash');
const db = require('../orm');
const generateThreeWords = require('../utils/word-gen').generateThreeWords;

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[key]) || key === "created_at" || key === "three_words") {
      _.omit(doc, key);
    }
  }
  if (!_.isNil(doc.duration) && _.isString(doc.duration)) {
    cleanObj.duration = parseInt(doc.duration);
  }
  if (!_.isNil(doc.topics) && _.isString(doc.topics)) {
    cleanObj.topics = doc.topics.split(',');
  }
  return cleanObj;
}

async function create(doc) {
  try {
    doc = sanitize(doc);
    doc.three_words = await generateThreeWords("-");
    await db.quiz.create(doc);
    return doc;
  } catch (e) {
    throw e;
  }
}

function list(limit = null, offset = null) {
  return new Promise((resolve, reject) => {
    db.quiz.findAll({
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

function get(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    db.quiz.findByPk(threeWords, { raw: true })
      .then(docs => resolve(_.cloneDeep(docs)))
      .catch(e => reject(e));
  });
}

async function getLinked(threeWords, list) {
  if (_.isNil(threeWords) || _.isNil(list)) {
    throw Error("Missing parameters");
  }
  try {
    let quizDoc = await db.quiz.findByPk(threeWords, { raw: true });
    if (_.isEmpty(quizDoc)) {
      return {}
    }
    let result = { ...quizDoc };
    if (_.includes(list, "questions")) {
      let query = { where: { three_words: threeWords }, attributes: { exclude: ['three_words'] }, raw: true };
      let docs = await db.question.findAll(query);
      result.questions = !_.isNil(docs) ? _.cloneDeep(docs) : [];
    }
    if (_.includes(list, "responses")) {
      let query = { where: { three_words: threeWords }, attributes: { exclude: ['three_words'] }, raw: true };
      let docs = await db.response.findAll(query);
      result.responses = !_.isNil(docs) ? _.cloneDeep(docs) : [];
    }
    if (_.includes(list, "answers")) {
      let query = { where: { three_words: threeWords }, attributes: { exclude: ['three_words'] }, raw: true };
      let docs = await db.answer.findAll(query);
      result.answers = !_.isNil(docs) ? _.cloneDeep(docs) : [];
    }
    return result;
  } catch (e) {
    throw e;
  }
}

function update(threeWords, changes) {
  if (_.isNil(threeWords) || _.isNil(changes)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.quiz.update(changes, {
      where: {
        three_words: threeWords
      }
    })
      .then(() => db.quiz.findByPk(threeWords, { raw: true }))
      .then(doc => resolve(_.cloneDeep(doc)))
      .catch(e => reject(e));
  });
}

function remove(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    db.quiz.destroy({
      where: {
        three_words: threeWords
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeQuestions(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    db.question.destroy({
      where: {
        three_words: threeWords
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeResponses(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    db.response.destroy({
      where: {
        three_words: threeWords
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeOptions(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    db.option.destroy({
      where: {
        three_words: threeWords
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeAnswers(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    db.answer.destroy({
      where: {
        three_words: threeWords
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function purge(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    let query = { where: { three_words: threeWords } };
    db.quiz.destroy(query)
      .then(() => db.question.destroy(query))
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
  getLinked,
  update,
  remove,
  purge,
  removeQuestions,
  removeResponses,
  removeOptions,
  removeAnswers
};
