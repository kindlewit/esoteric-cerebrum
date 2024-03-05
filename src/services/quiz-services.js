'use strict';

import db from '../orm';
import { generateThreeWords } from '../utils/misc-utils';
import { sanitize } from '../utils/quiz-utils';

async function create(doc) {
  doc = sanitize(doc);
  doc.three_words = await generateThreeWords('-');
  return await db.quiz.create(doc, { returning: true, raw: true });
}

function list(limit = null, offset = null) {
  return new Promise((resolve, reject) => {
    let query = {
      offset,
      limit,
      order: [['created_at', 'DESC']],
      raw: true
    };
    db.quiz
      .findAndCountAll(query)
      .then((docs) => resolve(docs))
      .catch((e) => reject(e));
  });
}

function count() {
  return db.quiz.count();
}

function find(query) {
  return db.quiz.findAll(query);
}

function collate(threeWords) {
  return new Promise((resolve, reject) => {
    let query = {
      where: {
        three_words: threeWords
      },
      attributes: ['title', 'start', 'duration', 'file_upload', 'status'],
      include: [
        {
          model: db.question,
          attributes: {
            exclude: ['created_at', 'updated_at', 'three_words', 'username']
          },
          as: 'questions',
          include: [
            {
              model: db.option,
              attributes: {
                exclude: ['three_words', 'username', 'number']
              },
              as: 'options'
            }
          ]
        }
      ],
      order: [[db.question, 'number', 'ASC']],
      raw: false,
      plain: true,
      nest: true
    };
    db.quiz
      .findOne(query)
      .then((doc) => doc.toJSON())
      .then((doc) => resolve(doc))
      .catch((e) => reject(e));
  });
}

function get(threeWords) {
  return new Promise((resolve, reject) => {
    db.quiz
      .findByPk(threeWords, { raw: true })
      .then((doc) => resolve(doc))
      .catch((e) => reject(e));
  });
}

function update(threeWords, changes) {
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.quiz
      .update(changes, {
        where: {
          three_words: threeWords
        }
      })
      .then(() => db.quiz.findByPk(threeWords))
      .then((doc) => resolve(doc.toJSON()))
      .catch((e) => reject(e));
  });
}

function remove(threeWords) {
  return db.quiz.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeQuestions(threeWords) {
  return db.question.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeResponses(threeWords) {
  return db.response.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeOptions(threeWords) {
  return db.option.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeAnswers(threeWords) {
  return db.answer.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function purge(threeWords) {
  /**
   * Remove all factors linked to the mentioned threeWords
   * like options, answers, responses & questions
   */
  return new Promise((resolve, reject) => {
    let query = {
      where: {
        three_words: threeWords
      }
    };
    db.option
      .destroy(query)
      .then(() => db.response.destroy(query))
      .then(() => db.question.destroy(query))
      .then(() => db.quiz.destroy(query))
      .then(() => resolve(true))
      .catch((e) => reject(e));
  });
}

export default {
  create,
  list,
  count,
  find,
  collate,
  get,
  update,
  remove,
  purge,
  removeQuestions,
  removeResponses,
  removeOptions,
  removeAnswers
};
