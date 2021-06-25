"use strict";

const _ = require('lodash');
const User = require('../services/user-services');
const cacheUtils = require('../utils/cache-utils');

async function userCookieValidator(request, reply, next) {
  let cookie = request.unsignCookie(request.cookies.session);
  if (_.has(cookie, 'value') && !_.isEmpty(cookie.value) && cookie.valid) {
    // Cookie is valid
    let session = Buffer.from(cookie.value, 'base64url').toString('ascii');
    if (await cacheUtils.isValid(session)) {
      // Session key is valid. User verified.
      return next();
    }
  }
  return reply.code(401).send();
}

function signupUserHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    !_.isObject(request.body) ||
    _.isNil(request.body.username) ||
    _.isNil(request.body.password) ||
    _.isNil(request.body.email)
  ) {
    reply.code(400).send();
  }
  User.create(request.body)
    .then(doc => {
      reply.code(201).send(doc);
    })
    .catch(e => {
      request.log.error(e);
      reply.code(500).send();
    });
}

function listUserHandler(request, reply) {
  if (_.has(request.query, 'count') && request.query.count.toLowerCase() === 'true') {
    User.count()
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
    User.list(limit, offset)
      .then(docs => {
        return reply.code(200).send({ total_docs: docs.length, docs });
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  }
}

function listUsernamesHandler(request, reply) {
  User.listNames()
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

function getUserHandler(request, reply) {
  if (_.isNil(request.params.username)) {
    reply.code(400).send();
  }
  if (_.has(request.query, 'linked')) {
    User.getLinked(request.params.username, request.query.linked.split(','))
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
    User.get(request.params.username)
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

async function loginUserHandler(request, reply) {
  if (
    _.isNil(request.params.username) ||
    _.isNil(request.body) ||
    _.isNil(request.body.password)
  ) {
    return reply.code(400).send();
  }
  try {
    let doc = await User.get(request.params.username, true);
    if (_.isEmpty(doc)) {
      return reply.code(404).send();
    }
    if (request.body.password === doc.password) {
      // Create login cache
      let cacheData = {
        username: request.params.username,
        login_timestamp: new Date().getTime(),
        expiry_timestamp: new Date().getTime() + 7200000 // +2 hours
      };
      let key = await cacheUtils.setLoginCache(request.params.username, cacheData);
      let session = Buffer.from(key).toString('base64url');
      reply.setCookie('session', session, { secure: false, path: '/', signed: true })
        .code(200)
        .send();
    } else {
      return reply.code(401).send();
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

function updateUserHandler(request, reply) {
  /**
   * Cookie verification in pre-handler
   */
  if (_.isNil(request.params.username) || _.isNil(request.body)) {
    reply.code(400).send();
  }
  User.update(request.params.username, request.body)
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

function deleteUserHandler(request, reply) {
  /**
    * Cookie verification in pre-handler
    */
  if (_.isNil(request.params.username)) {
    reply.code(400).send();
  }
  if (_.has(request.query, 'purge') && request.query.purge.toLowerCase() === 'true') {
    User.purge(request.params.username)
      .then(() => {
        reply.code(200).send();
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    User.remove(request.params.username)
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
  userCookieValidator,
  signupUserHandler,
  listUserHandler,
  listUsernamesHandler,
  getUserHandler,
  loginUserHandler,
  updateUserHandler,
  deleteUserHandler
};
