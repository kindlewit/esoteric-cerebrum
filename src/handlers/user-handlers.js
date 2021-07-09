"use strict";

const _ = require('lodash');
const bcrypt = require('bcryptjs');

const { SALT_LENGTH } = require('../../config');
const User = require('../services/user-services');

function cookieValidator(request, reply, next) {
  /**
   * PreHandler function to validate user cookie
   */
  let session = request.session;
  let username = request?.body?.username ?? request?.params?.username ?? null;
  if (session.username) {
    // Cookie has been authenticated
    if (username && session.username !== username) {
      return reply.code(403).send(); // User not authroized to make this request
    }
    return next();
  }
  return reply.code(401).send();
}

async function signupUserHandler(request, reply) {
  if (
    _.isNil(request.body) ||
    _.isEmpty(request.body) ||
    _.isNil(request.body.username) ||
    _.isNil(request.body.password) ||
    _.isNil(request.body.email)
  ) {
    return reply.code(400).send();
  }
  try {
    let signupObj = request.body;
    signupObj.password = await bcrypt.hash(signupObj.password, SALT_LENGTH);
    let doc = await User.create(signupObj);
    return reply.code(201).send(doc);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

function listUserHandler(request, reply) {
  if (_.has(request.query, 'count') && request.query.count) {
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

function getUserHandler(request, reply) {
  if (_.isNil(request.params.username)) {
    return reply.code(400).send();
  }
  if (_.has(request.query, 'linked')) {
    User.getLinked(request.params.username, request.query.linked.split(','))
      .then(doc => {
        if (_.isEmpty(doc)) {
          return reply.code(404).send();
        }
        return reply.code(200).send(doc);
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  } else {
    User.get(request.params.username)
      .then(doc => {
        if (_.isEmpty(doc)) {
          return reply.code(404).send();
        }
        return reply.code(200).send(doc);
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  }
}

function updateUserHandler(request, reply) {
  /**
   * Cookie verification in pre-handler
   */
  if (_.isNil(request.params.username) || _.isNil(request.body)) {
    return reply.code(400).send();
  }
  User.update(request.params.username, request.body)
    .then(doc => {
      if (_.isEmpty(doc)) {
        return reply.code(404).send();
      }
      return reply.code(200).send(doc);
    })
    .catch(e => {
      request.log.error(e);
      return reply.code(500).send();
    });
}

function deleteUserHandler(request, reply) {
  /**
    * Cookie verification in pre-handler
    */
  if (_.isNil(request.params.username)) {
    return reply.code(400).send();
  }
  if (_.has(request.query, 'purge') && request.query.purge) {
    User.purge(request.params.username)
      .then(() => {
        return reply.code(204).send();
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  } else {
    User.remove(request.params.username)
      .then(() => {
        return reply.code(204).send();
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
    if (await bcrypt.compareSync(request.body.password, doc.password)) {
      // Create login cache
      request.session.username = doc.username;
      return reply.code(200).send();
    }
    return reply.code(401).send();
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}


module.exports = {
  cookieValidator,
  signupUserHandler,
  listUserHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
  listUsernamesHandler,
  loginUserHandler,
};
