"use strict";

const _ = require('lodash');
const Response = require('../services/response-services');
const cacheUtils = require('../utils/cache-utils');

function createResponseHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.username)
  ) {
    reply.code(400).send();
  }
  if (_.has(request.query, 'multiple') && request.query.multiple.toLowerCase() === 'true') {
    // Insert Multiple Responses
    if (
      _.isNil(request.body.responses) ||
      !_.isArray(request.body.responses) ||
      _.isEmpty(request.body.responses)
    ) {
      reply.code(400).send();
    }
    let responses = _.chain(request.body.responses)
      .map(res => {
        return {
          ...res,
          three_words: request.body.three_words,
          username: request.body.username
        };
      })
      .filter(res => _.has(res, 'number'))
      .value();
    Promise.all(responses.map(Response.create))
      .then(() => {
        reply.code(201).send({ total_docs: responses.length, docs: responses });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    // Insert One Response
    if (_.isNil(request.body.number)) {
      reply.code(400).send();
    }
    Response.create(request.body)
      .then(doc => {
        reply.code(201).send(doc);
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function cacheResponseHandler(request, reply) {
  if (_.isNil(request.body) || _.isNil(request.body.username) || _.isNil(request.body.three_words)) {
    reply.code(400).send();
  }
  if (request.method === 'POST') {
    // Create cache data
    if (_.isNil(request.body.responses) || _.isEmpty(request.body.responses)) {
      reply.code(400).send();
    }
    cacheUtils.setResponseCache(request.body.three_words, request.body.username, request.body.responses)
      .then(() => {
        reply.code(201).send();
      }).catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    // Return cache data
    cacheUtils.getResponseCache(request.body.three_words, request.body.username)
      .then(data => {
        if (_.isNil(data) || _.isEmpty(data)) {
          reply.code(404).send();
        } else {
          let result = {
            three_words: request.body.three_words,
            username: request.body.username,
            total_docs: JSON.parse(data).length,
            responses: JSON.parse(data)
          };
          reply.code(200).send(result);
        }
      }).catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function listResponseHandler(request, reply) {
  if (_.has(request.query, 'count') && request.query.count.toLowerCase() === 'true') {
    Response.count()
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
    Response.list(limit, offset)
      .then(docs => {
        reply.code(200).send({ total_docs: docs.length, docs });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function getResponseHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    (
      _.isNil(request.body.three_words) &&
      _.isNil(request.body.username)
      && _.isNil(request.body.number)
    )
  ) {
    reply.code(400).send();
  }
  if (request.body.three_words && request.body.username && _.isFinite(request.body.number)) {
    // All 3 parameters mentioned: get query
    Response.get(request.body.three_words, request.body.username, request.body.number)
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
    // Partial parameters: find query
    Response.findByQuery(request.body)
      .then(docs => {
        if (_.isEmpty(docs)) {
          reply.code(404).send();
        }
        reply.code(200).send({ total_docs: docs.length, docs });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function updateResponseHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isEmpty(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.username) ||
    _.isNil(request.body.number) ||
    _.isNil(request.body.changes)
  ) {
    reply.code(400).send();
  }
  Response.update(request.body.three_words, request.body.username, request.body.number, request.body.changes)
    .then(doc => {
      reply.code(200).send(doc);
    })
    .catch(e => {
      request.log.error(e);
      reply.code(500).send();
    });
}

function deleteResponseHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isEmpty(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.username) ||
    _.isNil(request.body.number)
  ) {
    reply.code(400).send();
  }
  Response.remove(request.body.three_words, request.body.username, request.body.number)
    .then(() => {
      reply.code(200).send();
    })
    .catch(e => {
      request.log.error(e);
      reply.code(500).send();
    });
}

module.exports = {
  createResponseHandler,
  listResponseHandler,
  getResponseHandler,
  cacheResponseHandler,
  updateResponseHandler,
  deleteResponseHandler
};
