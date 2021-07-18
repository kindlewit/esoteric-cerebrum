'use strict';

const _ = require('lodash');
const Question = require('../services/question-services');

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[ key ]) || key === 'created_at') {
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

function splitQuestionOptionAnswer(data) {
  let options = [];
  let answers = [];
  for (let qn of data) {
    if (_.has(qn, 'options')) {
      // Extract options
      options.push.apply(options, qn.options.map(opt => {
        return {
          ...opt,
          three_words: qn.three_words,
          number: qn.number
        };
      }));
    }
    if (_.has(qn, 'answers')) {
      // Extract answer
      if (_.isString(qn.answers)) {
        answers.push({
          three_words: qn.three_words,
          number: qn.number,
          character: qn.answers
        });
      } else if (_.isArray(qn.answers)) {
        answers.push.apply(answers, qn.answers.map(ans => {
          return {
            three_words: qn.three_words,
            number: qn.number,
            character: ans
          };
        }));
      }
    }
  }
  return { options, answers };
}

function mergeQuestionAndOption(questions, options) {
  for (let qn of questions) {
    if (qn.answer_format === 'mcq' || qn.answer_format === 'multi') {
      qn.options = _.chain(options)
        .filter(opt => {
          return opt.three_words === qn.three_words && opt.number === qn.number;
        })
        .map(opt => {
          return {
            character: opt.character,
            text: opt.text
          };
        })
        .value();
    }
  }
  return questions;
}

function autoEvaluatable(threeWords) {
  /**
   * Function to check if a quiz can be auto-evaluated
   */
  return new Promise((resolve, reject) => {
    let query = {
      where: {
        three_words: threeWords
      }
    };
    Question.find(query)
      .then(questions => {
        if (_.isEmpty(questions)) {
          return resolve(false);
        }
        return resolve(questions.every(qn => qn.answer_format === 'mcq' || qn.answer_format === 'multi'));
      })
      .catch(e => reject(e));
  });
}

module.exports = {
  sanitize,
  splitQuestionOptionAnswer,
  mergeQuestionAndOption,
  autoEvaluatable
};

