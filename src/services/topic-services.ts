'use strict';

import db from '../orm';
import omit from 'lodash.omit';
import cloneDeep from 'lodash.clonedeep';

interface Topic {
  id: number,
  text: string,
  three_words?: string,
  created_at?: Date,
  updated_at?: Date
}

export const fetchOrCreate = async function (topic: string): Promise<Topic | any> {
  let existingDoc;
  existingDoc = await db.topic.findOne({
    where: { text: topic },
    attributes: ['id', 'text'],
    raw: true
  });
  if (existingDoc === undefined || existingDoc === null || existingDoc === {}) {
    // Create new topic doc
    await db.topic.create({ text: topic });
    // Return newly created doc
    return await db.topic.findOne({
      where: { text: topic },
      attributes: ['id', 'text'],
      raw: true
    });
  }
  return existingDoc;
}

export const createQTMapping = function (doc: Topic): Promise<any> {
  return new Promise((resolve, reject) => {
    db.quizTopic.create(doc, {
      returning: true,
      raw: true
    })
      .then((doc: any) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

export const find = function (query: unknown): Promise<any> {
  return db.topic.findAll(query);
}

export const getById = function (topicId: number): Promise<Topic | any> {
  return new Promise((resolve, reject) => {
    db.quizTopic.findOne({
      where: {
        id: topicId
      },
      raw: true
    })
      .then((doc: Topic) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

export const getByThreeWords = function (threeWords: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.quiz.findAll({
      where: {
        three_words: threeWords
      },
      include: [{
        model: db.topic,
        as: 'topics',
        attributes: ['text']
      }],
      raw: false,
      plain: true,
      nest: true
    })
      .then((res: any) => res.toJSON())
      .then((doc: any) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}
