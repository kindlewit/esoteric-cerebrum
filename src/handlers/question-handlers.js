'use strict';

const _ = require('lodash');
const Quiz = require('../services/quiz-services');
const Question = require('../services/question-services');
const Option = require('../services/option-services');
const Answer = require('../services/answer-services');
const { setQuestionCache, getQuestionCache, deleteQuestionCache } = require('../utils/cache-utils');
const { verifyUserAuthority } = require('../utils/user-utils');
const { mergeQuestionAndOption, splitQuestionOptionAnswer } = require('../utils/question-utils');


async function createQuestionHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.questions) ||
    !_.isArray(request.body.questions) ||
    _.isEmpty(request.body.questions)
  ) {
    return reply.code(400).send();
  }
  // Insert Multiple Questions
  try {
    let { three_words } = request.body;
    let questions = _.chain(request.body.questions)
      .cloneDeep()
      .map(qn => { return { ...qn, three_words }; })
      .filter(qn => _.has(qn, 'number') && _.has(qn, 'text') && _.has(qn, 'weightage') && _.has(qn, 'answer_format'))
      .value();

    if (_.isEmpty(questions)) {
      return reply.code(400).send();
    }

    let { options, answers } = splitQuestionOptionAnswer(questions);

    deleteQuestionCache(three_words);

    questions = await Promise.all(questions.map(Question.create));
    if (!_.isEmpty(options)) {
      options = await Promise.all(options.map(Option.create));
    }
    if (!_.isEmpty(answers)) {
      answers = await Promise.all(answers.map(Answer.create));
    }

    return reply.code(201).send({ three_words, questions, options, answers });
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function listQuestionHandler(request, reply) {
  try {
    if (_.has(request.query, 'count') && request.query.count) {
      // Count question
      let count = await Question.count();
      return reply.code(200).send({ total_docs: count });
    } else {
      // List questions
      let limit = _.has(request.query, 'limit') ? parseInt(request.query.limit) : null;
      let offset = _.has(request.query, 'offset') ? parseInt(request.query.offset) : null;
      let docs = await Question.list(limit, offset);
      return reply.code(200).send({ total_docs: docs.length, docs });
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function getQuestionHandler(request, reply) {
  if (_.isNil(request.body) || _.isEmpty(request.body)) {
    return reply.code(400).send();
  }
  try {
    if (request.body.three_words && _.isFinite(request.body.number)) {
      // Both params mentioned: get query
      let { three_words, number } = request.body;
      let doc = await Question.get(three_words, number);
      if (_.isEmpty(doc)) {
        return reply.code(404).send();
      }
      if (_.includes(['mcq', 'multi'], doc.answer_format)) {
        let options = await Option.find({
          where: { three_words, number }
        });
        doc.options = options;
      }
      return reply.code(200).send(doc);
    } else {
      // Partial parameters: find query
      let questions = await Question.find(request.body);
      let options = await Option.find(request.body); // Find options for query
      let docs = mergeQuestionAndOption(questions, options);
      return reply.code(200).send({ total_docs: docs.length, docs });
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function updateQuestionHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.number)
  ) {
    reply.code(400).send();
  }
  try {
    let { username } = request.session;
    let { three_words, number } = request.body;
    let data = await Quiz.get(three_words, number);
    if (_.isEmpty(data)) {
      return reply.code(404).send();
    }
    if (verifyUserAuthority(data, username)) {
      let changes = _.omit(request.body, ['three_words', 'number']); // Cannot edit  these 2 attributes
      let doc = await Question.update(three_words, number, changes);
      if (_.isEmpty(doc)) {
        return reply.code(404).send();
      }
      return reply.code(200).send(doc);
    } else {
      return reply.code(403).send();
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function deleteQuestionHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.number)
  ) {
    reply.code(400).send();
  }
  try {
    let { username } = request.session;
    let { three_words, number } = request.body;
    let data = await Quiz.get(three_words);
    if (verifyUserAuthority(data, username)) {
      if (_.has(request.query, 'purge') && request.query.purge) {
        await Question.purge(three_words, number);
      } else {
        await Question.remove(three_words, number);
      }
      return reply.code(204).send();
    }
    return reply.code(403).send();
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

function cacheQuestionHandler(request, reply) {
  if (request.method === 'POST') {
    // Create cache data
    if (_.isNil(request.body.questions)) {
      return reply.code(400).send();
    }
    let { three_words, questions } = request.body;
    let data = {
      timestamp: _.now(),
      questions
    };
    setQuestionCache(three_words, data)
      .then(() => {
        return reply.code(204).send();
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    // Return cache data
    let { three_words } = request.body;
    getQuestionCache(three_words)
      .then(data => {
        return reply.code(200).send({ three_words, questions: data.questions });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

module.exports = {
  createQuestionHandler,
  listQuestionHandler,
  getQuestionHandler,
  updateQuestionHandler,
  deleteQuestionHandler,
  cacheQuestionHandler
};
