'use strict';

import db from '../orm';
import { generateThreeWords } from '../utils/misc-utils';
import { sanitize } from '../utils/quiz-utils';

async function create(doc: any) {
  doc = sanitize(doc);
  doc.three_words = await generateThreeWords('-');
  return await db.quiz.create(doc, { returning: true, raw: true });
}

function list(limit: number | null = null, offset: number | null = null) {
  return new Promise((resolve, reject) => {
    let query = {
      offset,
      limit,
      order: [
        ['created_at', 'DESC']
      ],
      raw: true
    };
    db.quiz.findAndCountAll(query)
      .then((docs: any) => resolve(docs))
      .catch((e: any) => reject(e));
  });
}

function count() {
  return db.quiz.count();
}

function find(query: any) {
  return db.quiz.findAll(query);
}

function collate(threeWords: string) {
  return new Promise((resolve, reject) => {
    let query = {
      where: {
        three_words: threeWords
      },
      attributes: [
        'title',
        'start',
        'duration',
        'file_upload',
        'status'
      ],
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
      order: [
        [db.question, 'number', 'ASC']
      ],
      raw: false,
      plain: true,
      nest: true
    };
    db.quiz.findOne(query)
      .then((doc: any) => doc.toJSON())
      .then((doc: object) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

function get(threeWords: string) {
  return new Promise((resolve, reject) => {
    db.quiz.findByPk(threeWords, { raw: true })
      .then((doc: any) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

function update(threeWords: string, changes: object) {
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.quiz.update(changes, {
      where: {
        three_words: threeWords
      }
    })
      .then(() => db.quiz.findByPk(threeWords))
      .then((doc: any) => resolve(doc.toJSON()))
      .catch((e: any) => reject(e));
  });
}

function remove(threeWords: string) {
  return db.quiz.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeQuestions(threeWords: string) {
  return db.question.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeResponses(threeWords: string) {
  return db.response.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeOptions(threeWords: string) {
  return db.option.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function removeAnswers(threeWords: string) {
  return db.answer.destroy({
    where: {
      three_words: threeWords
    }
  });
}

function purge(threeWords: string) {
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
    db.option.destroy(query)
      .then(() => db.response.destroy(query))
      .then(() => db.question.destroy(query))
      .then(() => db.quiz.destroy(query))
      .then(() => resolve(true))
      .catch((e: any) => reject(e));
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
