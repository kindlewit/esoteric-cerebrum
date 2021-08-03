'use strict';

const _ = require('lodash');
const db = require('../orm');
const { sanitize } = require('../utils/question-utils');

function create(doc: any): Promise<any> {
  return new Promise((resolve, reject) => {
    doc = sanitize(doc);
    db.question.create(doc, { raw: true, returning: true })
      .then((doc: any) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

function bulkCreate(docs: any): Promise<any> {
  return new Promise((resolve, reject) => {
    docs = docs.map(sanitize);
    db.question.bulkCreate(docs, { raw: true, returning: true })
      .then((docs: any) => resolve(docs))
      .catch((e: any) => reject(e));
  });
}

function list(limit: number | null = null, offset: number | null = null) {
  return db.question.findAll({
    offset,
    limit,
    order: [
      ['created_at', 'DESC']
    ],
    include: [
      {
        model: db.option,
        attributes: { exclude: ['three_words', 'number'] },
        as: 'options'
      }
    ],
    raw: false,
    nest: true
  });
}

function count() {
  return db.question.count();
}

function find(query: object) {
  return db.question.findAll(query);
}

type Params = {
  options: boolean;
  answers: boolean;
};

function ofQuiz(threeWords: string, params: Params = { options: true, answers: true }) {
  return new Promise((resolve, reject) => {
    let query: any = {
      where: {
        three_words: threeWords
      },
      attibutes: {
        exclude: ['three_words', 'created_at', 'updated_at']
      },
      raw: false,
      plain: true,
      nest: true,
      include: [],
      order: [
        [db.question, 'number', 'ASC']
      ]
    };
    if (params.options) {
      query.include.push({
        model: db.option,
        attributes: {
          exclude: ['three_words', 'number']
        },
        as: 'options'
      });
    }
    if (params.answers) {
      query.include.push({
        model: db.answer,
        attributes: {
          exclude: ['three_words', 'number']
        },
        as: 'answers'
      });
    }
    db.question.findAll(query)
      .then((docs: any) => {
        if (_.isEmpty(docs))
          docs.toJSON()
      })
      .then((docs: any) => resolve(docs))
      .catch((e: any) => reject(e));
  })
}

function get(threeWords: string, qNum: number) {
  return db.question.findOne({
    where: {
      three_words: threeWords,
      number: qNum
    },
    raw: true
  });
}

function update(threeWords: string, qNum: number, changes: any) {
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
      .then((doc: any) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

function remove(threeWords: string, qNum: number) {
  return new Promise((resolve, reject) => {
    db.user.destroy({
      where: {
        three_words: threeWords,
        number: qNum
      }
    })
      .then(() => resolve(true))
      .catch((e: any) => reject(e));
  });
}

function removeResponses(threeWords: string, qNum: number) {
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    }
  };
  return new Promise((resolve, reject) => {
    db.response.destroy(query)
      .then(() => resolve(true))
      .catch((e: any) => reject(e));
  });
}

function removeOptions(threeWords: string, qNum: number) {
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    }
  };
  return new Promise((resolve, reject) => {
    db.option.destroy(query)
      .then(() => resolve(true))
      .catch((e: any) => reject(e));
  });
}

function removeAnswers(threeWords: string, qNum: number) {
  let query = {
    where: {
      three_words: threeWords,
      number: qNum
    }
  };
  return new Promise((resolve, reject) => {
    db.answer.destroy(query)
      .then(() => resolve(true))
      .catch((e: any) => reject(e));
  });
}

function purge(threeWords: string, qNum: number) {
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
      .catch((e: any) => reject(e));
  });
}

module.exports = {
  create,
  bulkCreate,
  list,
  count,
  find,
  ofQuiz,
  get,
  update,
  remove,
  purge,
  removeResponses,
  removeOptions,
  removeAnswers
};
