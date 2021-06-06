"use strict";

const _ = require('lodash');
const Question = require('../services/question-services');

function createQuestionHandler(request, reply) {
  if (_.isNil(request.body)) {
    reply.code(400).send();
  }
  if (_.has(request.query, 'multiple') && request.query.multiple.toLowerCase() === 'true' && _.isArray(request.body)) {
    // Insert Multiple Questions
    Promise.all(request.body.map(Question.create))
      .then(docs => {
        reply.code(201).send(docs);
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    // Insert One Question
    if (_.isNil(request.body.three_words) || _.isNil(request.body.number) || _.isNil(request.body.answer_format)) {
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
    Question.list()
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
