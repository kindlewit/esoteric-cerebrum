'use strict';

const _ = require('lodash');
const bcrypt = require('bcryptjs');

const { SALT_LENGTH } = require('../../config');
const User = require('../services/user-services');

function cookieValidator(request, reply, next) {
  /**
   * PreHandler function to validate user cookie
   */
  let { session } = request;
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

async function listUserHandler(request, reply) {
  try {
    if (_.has(request.query, 'count') && request.query.count) {
      let count = await User.count();
      return reply.code(200).send({ total_docs: count });
    } else {
      let limit = _.has(request.query, 'limit') ? parseInt(request.query.limit) : null;
      let offset = _.has(request.query, 'offset') ? parseInt(request.query.offset) : null;
      let docs = await User.list(limit, offset);
      return reply.code(200).send({ total_docs: docs.length, docs });
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function getUserHandler(request, reply) {
  if (_.isNil(request.params.username)) {
    return reply.code(400).send();
  }
  try {
    let doc = await User.get(request.params.username);
    console.log(doc);
    if (_.isEmpty(doc)) {
      return reply.code(404).send();
    }
    return reply.code(200).send(doc);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function updateUserHandler(request, reply) {
  /**
   * Cookie verification in pre-handler
   */
  if (_.isNil(request.params.username) || _.isNil(request.body)) {
    return reply.code(400).send();
  }
  try {
    let doc = await User.update(request.params.username, request.body);
    if (_.isEmpty(doc)) {
      return reply.code(404).send();
    }
    return reply.code(200).send(doc);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function deleteUserHandler(request, reply) {
  /**
    * Cookie verification in pre-handler
    */
  if (_.isNil(request.params.username)) {
    return reply.code(400).send();
  }
  try {
    if (_.has(request.query, 'purge') && request.query.purge) {
      await User.purge(request.params.username);
      return reply.code(204).send();
    } else {
      await User.remove(request.params.username);
      return reply.code(204).send();
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}

async function listUsernamesHandler(request, reply) {
  try {
    let docs = await User.listNames();
    reply.code(200).send({ total_docs: docs.length, docs });
  } catch (e) {
    request.log.error(e);
    reply.code(500).send();
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
    if (await bcrypt.compareSync(request.body.password, doc.password)) {
      // Password validated
      request.session.username = doc.username; // Login cookie set
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
  loginUserHandler
};
