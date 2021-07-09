"use strict";

const _ = require('lodash');
const Quiz = require('../services/quiz-services');
const { generateQuizQRCode } = require('../utils/qr-utils');

const { getQuestionsOfQuiz, getResponsesOfQuiz } = require('../utils/quiz-utils');
const { verifyUserAuthority } = require('../utils/user-utils');
const { autoEvaluatable } = require('../utils/question-utils');

function createQuizHandler(request, reply) {
  if (_.isNil(request.body) || _.isEmpty(request.body)) {
    return reply.code(400).send();
  }
  let { username } = request.session;
  let quizObj = request.body;
  quizObj.username = username;
  Quiz.create(quizObj)
    .then(doc => {
      return reply.code(201).send(doc);
    })
    .catch(e => {
      request.log.error(e);
      return reply.code(500).send();
    });
}

function listQuizHandler(request, reply) {
  if (_.has(request.query, 'count') && request.query.count) {
    Quiz.count()
      .then(count => {
        return reply.code(200).send({ total_docs: count });
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  } else {
    let limit = _.has(request.query, 'limit') ? parseInt(request.query.limit) : null;
    let offset = _.has(request.query, 'offset') ? parseInt(request.query.offset) : null;
    Quiz.list(limit, offset)
      .then(docs => {
        return reply.code(200).send({ total_docs: docs.length, docs: docs });
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  }
}

async function getQuizHandler(request, reply) {
  if (_.isNil(request.params.threeWords)) {
    return reply.code(400).send();
  }
  try {
    let doc = {};
    if (_.has(request.query, 'linked')) {
      doc = await Quiz.getLinked(request.params.threeWords, request.query.linked.split(','));
    } else {
      doc = await Quiz.get(request.params.threeWords);
    }
    if (_.isEmpty(doc)) {
      return reply.code(404).send();
    }
    return reply.code(200).send(doc);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function updateQuizHandler(request, reply) {
  if (_.isNil(request.params.threeWords) || _.isNil(request.body)) {
    return reply.code(400).send();
  }
  try {
    let { threeWords } = request.params;
    let { username } = request.session;
    let data = await Quiz.get(threeWords);
    if (_.isEmpty(data)) {
      return reply.code(404).send();
    }
    if (verifyUserAuthority(data, username)) {
      // User has been authorized
      let changes = _.omit(request.body, ["three_words", "username"]); // Cannot edit these 2 attributes
      let doc = Quiz.update(threeWords, changes);
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

async function deleteQuizHandler(request, reply) {
  if (_.isNil(request.params.threeWords)) {
    return reply.code(400).send();
  }
  try {
    let { threeWords } = request.params;
    let { username } = request.session;
    let data = await Quiz.get(threeWords);
    if (verifyUserAuthority(data, username)) {
      // User has been authroized
      if (_.has(request.query, 'purge') && request.query.purge) {
        await Quiz.purge(threeWords);
      } else {
        await Quiz.remove(threeWords);
      }
      return reply.code(204).send();
    } else {
      return reply.code(403).send();
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

function getQRcodeHandler(request, reply) {
  if (_.isNil(request.params.threeWords)) {
    return reply.code(400).send();
  }
  generateQuizQRCode(request.params.threeWords)
    .then(link => {
      return reply.code(200).send(link);
    })
    .catch(e => {
      request.log.error(e);
      return reply.code(500).send();
    });
}

async function collateQuizHandler(request, reply) {
  /**
   * Return quiz data to be displayed
   */
  try {
    // Collate quiz, questions & options
    let { threeWords } = request.params;
    let quizDoc = _.pick(await Quiz.get(threeWords), [
      "three_words",
      "url",
      "title",
      "duration",
      "file_upload"
    ]);
    let questions = await getQuestionsOfQuiz(threeWords);
    let result = {
      ...quizDoc,
      questions
    };
    return reply.code(200).send(result);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function evaluateQuizHandler(request, reply) {
  try {
    if (request.method === 'GET') {
      // Manual evaluation
      let { threeWords } = request.params;
      let quizDoc = _.pick(await Quiz.get(threeWords), [
        "three_words",
        "title",
      ]);
      let questions = await getQuestionsOfQuiz(threeWords);
      let responses = await getResponsesOfQuiz(threeWords);
      let result = {
        ...quizDoc,
        questions,
        responses
      };
      return reply.code(202).send(result);
    } else if (request.method === 'POST') {
      // Submit manual evaluation
      return reply.code(202).send();
    } else {
      // Request auto-evaluation
      let { threeWords } = request.params;
      if (await autoEvaluatable(threeWords)) {
        return reply.code(202).send(true);
      }
      return reply.code(400).send();
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

module.exports = {
  createQuizHandler,
  listQuizHandler,
  getQuizHandler,
  updateQuizHandler,
  deleteQuizHandler,
  getQRcodeHandler,
  collateQuizHandler,
  evaluateQuizHandler
};
