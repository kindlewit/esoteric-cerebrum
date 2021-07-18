'use strict';

const _ = require('lodash');
const Response = require('../services/response-services');
const { setResponseCache, getResponseCache, deleteResponseCache } = require('../utils/cache-utils');
const { verifyUserAuthority } = require('../utils/user-utils');

async function createResponseHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.responses) ||
    !_.isArray(request.body.responses) ||
    _.isEmpty(request.body.responses)
  ) {
    return reply.code(400).send();
  }
  try {
    // Insert Multiple Responses
    let { three_words } = request.body;
    let { username } = request.session;
    let responses = _.chain(request.body.responses)
      .map(res => {
        return { ...res, three_words, username };
      })
      .filter(res => _.has(res, 'number') && _.has(res, 'three_words') && _.has(res, 'username'))
      .value();

    let docs = await Response.bulkCreate(responses);
    deleteResponseCache(three_words, username);
    return reply.code(201).send({
      total_docs: docs.length,
      three_words,
      username,
      responses: docs
    });
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

function listResponseHandler(request, reply) {
  if (_.has(request.query, 'count') && request.query.count) {
    Response.count()
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
    Response.list(limit, offset)
      .then(docs => {
        return reply.code(200).send({ total_docs: docs.length, docs });
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  }
}

async function getResponseHandler(request, reply) {
  if (_.isNil(request.body) || _.isEmpty(request.body)) {
    reply.code(400).send();
  }
  try {
    if (
      request.body.three_words &&
      request.body.username &&
      _.isFinite(request.body.number)
      ) {
      // All 3 parameters mentioned: get query
      let { three_words, username, number } = request.body;
      let doc = await Response.get(three_words, username, number);
      if (_.isEmpty(doc)) {
        return reply.code(404).send();
      }
      return reply.code(200).send(doc);
    } else {
      // Partial parameters: find query
      let docs = await Response.findByQuery(request.body);
      if (_.isEmpty(docs)) {
        return reply.code(404).send();
      }
      return reply.code(200).send({ total_docs: docs.length, docs });
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function updateResponseHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.username) ||
    _.isNil(request.body.number)
  ) {
    reply.code(400).send();
  }
  try {
    let { three_words, username, number } = request.body;
    let data = await Response.get(three_words, username, number);
    if (_.isEmpty(data)) {
      return reply.code(404).send();
    }
    if (verifyUserAuthority(data, username)) {
      let changes = _.omit(request.body, ['three_words', 'username', 'number']); // Cannot edit these 3 attributes
      let doc = await Response.update(three_words, username, number, changes);
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

async function deleteResponseHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isNil(request.body.three_words) ||
    _.isNil(request.body.username) ||
    _.isNil(request.body.number)
  ) {
    return reply.code(400).send();
  }
  try {
    let { three_words, username, number } = request.body;
    let data = await Response.get(three_words, username, number);
    if (_.isEmpty(data)) {
      return reply.code(404).send();
    }
    if (verifyUserAuthority(data, username)) {
      await Response.remove(three_words, username, number);
      return reply.code(204).send();
    } else {
      return reply.code(403).send();
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function cacheResponseHandler(request, reply) {
  try {
    if (request.method === 'POST') {
      // Create cache data
      if (_.isNil(request.body.responses)) {
        return reply.code(400).send();
      }
      let { three_words, username, responses } = request.body;
      let data = {
        timestamp: _.now(),
        responses
      };
      await setResponseCache(three_words, username, data);
      return reply.code(204).send();
    } else {
      // Return cache data
      let { three_words, username } = request.body;
      let data = await getResponseCache(three_words, username);
      return reply.code(200).send({
        three_words,
        username,
        responses: data.responses
      });
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

module.exports = {
  createResponseHandler,
  listResponseHandler,
  getResponseHandler,
  updateResponseHandler,
  deleteResponseHandler,
  cacheResponseHandler
};
