"use strict";

const _ = require('lodash');
const Quiz = require('../services/quiz-services');
const generateQuizQRCode = require('../utils/qr-utils').generateQuizQRCode;

function createQuizHandler(request, reply) {
  if (_.isNil(request.body) || !_.isObject(request.body) || _.isNil(request.body.username)) {
    reply.code(400).send();
  }
  Quiz.create(request.body)
    .then(doc => {
      reply.code(201).send(doc);
    })
    .catch(e => {
      request.log.error(e);
      reply.code(500).send();
    });
}

function listQuizHandler(request, reply) {
  if (_.has(request.query, 'count') && request.query.count) {
    Quiz.count()
      .then(count => {
        reply.code(200).send({ total_docs: count });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    let limit = _.has(request.query, 'limit') ? parseInt(request.query.limit) : null;
    let offset = _.has(request.query, 'offset') ? parseInt(request.query.offset) : null;
    Quiz.list(limit, offset)
      .then(docs => {
        reply.code(200).send({ total_docs: docs.length, docs: docs });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function getQuizHandler(request, reply) {
  if (_.isNil(request.params.threeWords)) {
    reply.code(400).send();
  }
  if (_.has(request.query, 'linked')) {
    Quiz.getLinked(request.params.threeWords, request.query.linked.split(','))
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
    Quiz.get(request.params.threeWords)
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
}

function getQRcodeHandler(request, reply) {
  if (_.isNil(request.params.threeWords)) {
    reply.code(400).send();
  }
  reply.code(200).send(generateQuizQRCode(request.params.threeWords));
}

function updateQuizHandler(request, reply) {
  if (_.isNil(request.params.threeWords) || _.isNil(request.body)) {
    reply.code(400).send();
  }
  Quiz.update(request.params.threeWords, request.body)
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

function deleteQuizHandler(request, reply) {
  if (_.isNil(request.params.threeWords)) {
    reply.code(400).send();
  }
  if (_.has(request.query, 'purge') && request.query.purge) {
    Quiz.purge(request.params.threeWords)
      .then(() => {
        reply.code(204).send();
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    Quiz.remove(request.params.threeWords)
      .then(() => {
        reply.code(204).send();
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

module.exports = {
  createQuizHandler,
  listQuizHandler,
  getQuizHandler,
  getQRcodeHandler,
  updateQuizHandler,
  deleteQuizHandler
};
