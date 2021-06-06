"use strict";

const _ = require('lodash');
const User = require('../services/user-services');

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
        reply.code(200).send({ total_docs: count });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    User.list()
      .then(docs => {
        reply.code(200).send({ total_docs: docs.length, docs });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function listUsernamesHandler(request, reply) {
  User.listNames()
    .then(docs => {
      if (_.isEmpty(docs)) {
        reply.code(404).send();
      }
      reply.code(200).send(docs);
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

function loginUserHandler(request, reply) {
  if (
    _.isNil(request.params.username) ||
    _.isNil(request.body) ||
    _.isNil(request.body.password)
  ) {
    reply.code(400).send();
  }
  User.get(request.params.username, true)
    .then(doc => {
      if (_.isEmpty(doc)) {
        reply.code(404).send();
      }
      if (request.body.password === doc.password) {
        reply.code(200).send(_.omit(doc, 'password'));
      }
      reply.code(401).send();
    })
    .catch(e => {
      request.log.error(e);
      reply.code(500).send();
    });
}

function updateUserHandler(request, reply) {
  if (_.isNil(request.params.username) || _.isNil(request.body)) {
    reply.code(400).send();
  }
  User.update(request.params.username, request.body)
    .then(doc => {
      if (_.isEmpty(doc)) {
        reply.code(404).send();
      }
      reply.code(201).send(doc);
    })
    .catch(e => {
      request.log.error(e);
      reply.code(500).send();
    });
}

function deleteUserHandler(request, reply) {
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
        reply.code(200).send();
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

module.exports = {
  signupUserHandler,
  listUserHandler,
  listUsernamesHandler,
  getUserHandler,
  loginUserHandler,
  updateUserHandler,
  deleteUserHandler
};
