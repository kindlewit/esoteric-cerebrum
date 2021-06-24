"use strict";

const _ = require('lodash');
const Question = require('../services/question-services');

function createQuestionHandler(request, reply) {
  if (_.isNil(request.body) || _.isNil(request.body.three_words)) {
    reply.code(400).send();
  }
  if (_.has(request.query, 'multiple') && request.query.multiple.toLowerCase() === 'true') {
    // Insert Multiple Questions
    if (_.isNil(request.body.questions) || !_.isArray(request.body.questions) || _.isEmpty(request.body.questions)) {
      reply.code(400).send();
    }
    let questions = _.chain(request.body.questions)
      .map(qn => {
        return { ...qn, three_words: request.body.three_words };
      })
      .filter(qn => _.has(qn, 'number') && _.has(qn, 'answer_format') && _.has(qn, 'text'))
      .value();
    Promise.all(questions.map(Question.create))
      .then(() => {
        reply.code(201).send(questions);
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    // Insert One Question
    if (_.isNil(request.body.number) || _.isNil(request.body.answer_format) || _.isNil(request.body.text)) {
      reply.code(400).send();
    }
    Question.create(request.body)
      .then(doc => {
        reply.code(201).send(doc);
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function listOrGetQuestionHandler(request, reply) {
  if (_.has(request.query, 'count') && request.query.count.toLowerCase() === 'true') {
    Question.count()
      .then(count => {
        reply.code(200).send({ total_docs: count });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else if (_.has(request.query, 'three_words') && _.has(request.query, 'number')) {
    if (_.has(request.query, 'linked')) {
      Question.getLinked(request.query.three_words, request.query.number, request.query.linked.split(','))
        .then(doc => {
          if (_.isEmpty(doc)) {
            reply.code(404).send();
          }
          reply.code(200).send(doc);
        })
        .catch(e => {
          request.log.error(e);
          reply.code(500).send();
        });
    } else {
      Question.get(request.query.three_words, request.query.number)
        .then(doc => {
          if (_.isEmpty(doc)) {
            reply.code(404).send();
          }
          reply.code(200).send(doc);
        })
        .catch(e => {
          request.log.error(e);
          reply.code(500).send();
        });
    }
  } else {
    let limit = _.has(request.query, 'limit') ? parseInt(request.query.limit) : null;
    let offset = _.has(request.query, 'offset') ? parseInt(request.query.offset) : null;
    Question.list(limit, offset)
      .then(docs => {
        reply.code(200).send({ total_docs: docs.length, docs });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function updateQuestionHandler(request, reply) {
  if (_.isEmpty(request.body) || _.isNil(request.body.three_words) || _.isNil(request.body.number)) {
    reply.code(400).send();
  }
  Question.update(request.body.three_words, request.body.number, request.body)
    .then(doc => {
      if (_.isEmpty(doc)) {
        reply.code(404).send();
      }
      reply.code(200).send(doc);
    })
    .catch(e => {
      request.log.error(e);
      reply.code(500).send();
    });
}

function deleteQuestionHandler(request, reply) {
  if (_.isEmpty(request.body) || _.isNil(request.body.three_words) || _.isNil(request.body.number)) {
    reply.code(400).send();
  }
  if (_.has(request.query, 'purge') && request.query.purge.toLowerCase() === 'true') {
    Question.purge(request.body.three_words, request.body.number)
      .then(() => {
        reply.code(200).send();
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    Question.remove(request.body.three_words, request.body.number)
      .then(() => {
        reply.code(200).send();
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

module.exports = {
  createQuestionHandler,
  listOrGetQuestionHandler,
  updateQuestionHandler,
  deleteQuestionHandler
};
