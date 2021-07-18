'use strict';

const _ = require('lodash');
const Quiz = require('../services/quiz-services');
const db = require('../orm');
const { generateQuizQRCode, computePagination } = require('../utils/misc-utils');
const { getQuestionsOfQuiz } = require('../utils/quiz-utils');
const { verifyUserAuthority, fetchDisplayNameFor } = require('../utils/user-utils');
const { autoEvaluatable } = require('../utils/question-utils');

async function createQuizHandler(request, reply) {
  if (_.isNil(request.body) || _.isEmpty(request.body)) {
    return reply.code(400).send();
  }
  try {
    let { username } = request.session;
    let quizObj = request.body;
    quizObj.username = username;
    let doc = await Quiz.create(quizObj);
    return reply.code(201).send(doc);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function listQuizHandler(request, reply) {
  try {
    if (_.has(request.query, 'count') && request.query.count) {
      let count = await Quiz.count();
      return reply.code(200).send({ total_docs: count });
    } else {
      let page = _.has(request.query, 'page') ? parseInt(request.query.page) : null;
      let size = _.has(request.query, 'size') ? parseInt(request.query.size) : null;
      let offset = page && size ? computePagination(page, size).offset : null;
      let { count, rows } = await Quiz.list(size, offset);
      let response = {
        total_docs: count,
        docs: rows
      };
      if (page && size) {
        response.page = page; response.size = size;
        if (count > (offset + size)) {
          response.next_page = request.url
            .replace(/page=\d+/g, `page=${parseInt(page) + 1}`);
        }
      }
      return reply.code(200).send(response);
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function getQuizHandler(request, reply) {
  if (_.isNil(request.params.threeWords)) {
    return reply.code(400).send();
  }
  try {
    if (request.method === 'PUT') {
      // Get by query
      if (_.isNil(request.body) || _.isEmpty(request.body)) {
        return reply.code(400).send();
      }


      return reply.code(202).send();

    } else {
      // Get single doc
      let doc = await Quiz.get(request.params.threeWords);
      if (_.isEmpty(doc)) {
        return reply.code(404).send();
      }
      doc.display_name = await fetchDisplayNameFor(doc.username);
      return reply.code(200).send(doc);
    }
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
      let changes = _.omit(request.body, ['three_words', 'username']); // Cannot edit these 2 attributes
      let doc = await Quiz.update(threeWords, changes);
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
      'three_words',
      'url',
      'title',
      'duration',
      'file_upload'
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
      // Get data for manual evaluation
      let { threeWords } = request.params;
      // let quizDoc = _.pick(await Quiz.get(threeWords), [
      //   "three_words",
      //   "title"
      // ]);
      // let questions = await getQuestionsOfQuiz(threeWords);
      // let responses = await getResponsesOfQuiz(threeWords);
      // let result = {
      //   ...quizDoc,
      //   questions,
      //   responses
      // };
      // return reply.code(202).send(result);
      let docs = await Quiz.find({
        where: {
          three_words: threeWords
        },
        attributes: [
          'title',
          'duration',
          'file_upload',
          'is_live'
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
              },
              {
                model: db.answer,
                attributes: {
                  exclude: ['three_words', 'username', 'number']
                },
                as: 'answers'
              }
            ]
          },
          {
            model: db.response,
            attributes: {
              exclude: [
                'created_at',
                'updated_at',
                'three_words',
                'username'
              ]
            },
            as: 'responses'
          }
        ],
        order: [
          [db.question, 'number', 'ASC']
        ],
        raw: false,
        plain: true,
        nest: true
      });
      return reply.code(200).send(docs);
    } else if (request.method === 'POST') {
      // Submit data for manual evaluation
      return reply.code(202).send();
    } else {
      // Request auto-evaluation
      let { threeWords } = request.params;
      if (await autoEvaluatable(threeWords)) {
        return reply.code(202).send(true);
      }
      return reply.code(406).send();
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
