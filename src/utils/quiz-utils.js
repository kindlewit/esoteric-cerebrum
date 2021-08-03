'use strict';

import _ from 'lodash';
import Question from '../services/question-services';
import Option from '../services/option-services';
import Response from '../services/response-services';
import { mergeQuestionAndOption } from './question-utils';

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[ key ]) || key === 'created_at' || key === 'three_words') {
      // Cannot insert user-defined created_at / three_words
      _.omit(cleanObj, key);
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

async function getQuestionsOfQuiz(threeWords) {
  /**
   * Return questions for a quiz.
   */
  let questions = await Question.find({
    where: {
      three_words: threeWords
    },
    order: [
      ['number', 'ASC']
    ],
    attributes: [
      'number',
      'text',
      'file',
      'answer_format',
      'weightage'
    ]
  });
  let options = await Option.find({
    where: {
      three_words: threeWords
    },
    attributes: {
      exclude: ['three_words']
    }
  });
  return mergeQuestionAndOption(questions, options);
}

async function getResponsesOfQuiz(threeWords) {
  /**
   * Get responses for a quiz.
   */
  return await Response.find({
    where: {
      three_words: threeWords
    },
    attributes: [
      'username',
      'number',
      'text',
      'score'
    ],
    order: [
      ['created_at', 'DESC']
    ]
  });
}

export {
  sanitize,
  getQuestionsOfQuiz,
  getResponsesOfQuiz
};
