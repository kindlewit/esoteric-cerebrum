'use strict';

import db from '../orm';
import omit from 'lodash.omit';
import cloneDeep from 'lodash.clonedeep';
import { generateThreeWords } from '../utils/misc-utils';

interface QuizConfig {
  duration?: number,
  meet?: string,
  file_upload?: boolean
}
interface Quiz {
  three_words: string,
  title?: string,
  description?: string,
  start?: Date,
  status: number,
  username: string,
  topics?: string[],
  config?: QuizConfig,
  created_at: Date,
  updated_at: Date
}

function sanitize(doc: Quiz): Quiz {
  let cleanObj = cloneDeep(doc);
  for (let [key, value] of Object.entries(doc)) {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      key === 'created_at' ||
      key === 'three_words'
    ) {
      // Cannot insert user-defined created_at / three_words
      omit(cleanObj, key);
    }
  }
  if (cleanObj.start == null || cleanObj.start < new Date()) {
    // Default start time is now + 48hrs
    cleanObj.start = new Date(new Date().valueOf() + 1.728e+8);
  }
  if (doc.topics) {
    omit(cleanObj, 'topics');
  }
  return cleanObj;
}

export const create = async function (doc: Quiz): Promise<Quiz> {
  let record = sanitize(doc);
  record.three_words = await generateThreeWords('-') as string;
  if (record.title == null || record.title === '') {
    record.title = record.three_words;
  }
  return await db.quiz.create(record, { returning: true, raw: true });
}

export const list = function (
  limit: number | null = null,
  offset: number | null = null
): Promise<unknown> {
  let query = {
    offset,
    limit,
    order: [
      ['created_at', 'DESC']
    ],
    raw: true
  };
  return db.quiz.findAndCountAll(query);
}

export const find = function (query: unknown): Promise<unknown> {
  return db.quiz.findAll(query);
}

export const get = function (
  threeWords: string
): Promise<Quiz | unknown> {
  return new Promise((resolve, reject) => {
    db.quiz.findByPk(threeWords, {
      include: [
        {
          model: db.topic,
          as: 'topics',
          attributes: ['text']
        }
      ],
      raw: false,
      plain: true,
      nest: true
    })
      .then((res: any) => res?.toJSON())
      .then((doc: any) => resolve(doc))
      .catch((e: unknown) => reject(e));
  });
}

export const update = function (
  threeWords: string,
  changes: Quiz
): Promise<Quiz | any> {
  return new Promise((resolve, reject) => {
    let body = sanitize(changes);
    db.quiz.update(body, {
      where: {
        three_words: threeWords
      }
    })
      .then(() => db.quiz.findByPk(threeWords, { raw: true }))
      .then((doc: Quiz) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

export const remove = function (threeWords: string): Promise<any> {
  return db.quiz.destroy({ where: { three_words: threeWords } });
}

export default {
  create,
  list,
  find,
  get,
  update,
  remove
};
