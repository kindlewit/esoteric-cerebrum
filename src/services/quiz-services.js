"use strict";

const _ = require('lodash');
const db = require('../orm');
const generateThreeWords = require('../utils/word-gen').generateThreeWords;
const { sanitize } = require('../utils/quiz-utils');

async function create(doc) {
  doc = sanitize(doc);
  doc.three_words = await generateThreeWords("-");
  await db.quiz.create(doc);
  return db.quiz.findByPk(doc.three_words);
}

function list(limit = null, offset = null) {
  return db.quiz.findAll({
    offset: offset,
    limit: limit,
    order: [
      ["created_at", "DESC"]
    ],
    raw: true
  });
}

function count() {
  return db.quiz.count();
}

function find(query) {
  query.raw = true;
  return db.quiz.findAll(query);
}

function get(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return db.quiz.findByPk(threeWords, { raw: true });
}

async function getLinked(threeWords, list) {
  if (_.isNil(threeWords) || _.isNil(list)) {
    throw Error("Missing parameters");
  }
  let quizDoc = await db.quiz.findByPk(threeWords, { raw: true });
  if (_.isEmpty(quizDoc)) {
    return {};
  }
  let result = { ...quizDoc };
  let query = {
    where: {
      three_words: threeWords
    },
    attributes: {
      exclude: ["three_words"]
    },
    raw: true
  };
  if (_.includes(list, "questions")) {
    result.questions = await db.question.findAll(query) ?? [];
    result.total_questions = result.questions.length;
  }
  if (_.includes(list, "responses")) {
    result.responses = await db.response.findAll(query) ?? [];
    result.total_responses = result.responses.length;
  }
  if (_.includes(list, "answers")) {
    result.answers = await db.answer.findAll(query) ?? [];
    result.total_answers = result.answers.length;
  }
  return result;
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
      .then(doc => resolve(doc))
      .catch(e => reject(e));
  });
}

function remove(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return db.quiz.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeQuestions(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return db.question.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeResponses(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return db.response.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeOptions(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return db.option.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeAnswers(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return db.answer.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function purge(threeWords) {
  if (_.isNil(threeWords)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    let query = {
      where: {
        three_words: threeWords
      }
    };
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
  find,
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
