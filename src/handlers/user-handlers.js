"use strict";

const _ = require('lodash');
const User = require('../services/user-services');

function createUserHandler(request, reply) {
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
      reply.status(201).send(doc);
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
        reply.status(200).send({ total_docs: count });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });

  } else {
    User.list()
      .then(docs => {
        reply.status(200).send({ total_docs: docs.length, docs });
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}

function getUserHandler(request, reply) {
  if (_.isNil(request.params.username)) {
    reply.code(400).send();
  }
  if (_.has(request.query, "linked")) {
    User.listLinked(request.params.username, request.query.linked.split(','))
      .then(doc => {
        reply.status(200).send(doc);
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  } else {
    User.get(request.params.username)
      .then(doc => {
        reply.status(200).send(doc);
      })
      .catch(e => {
        request.log.error(e);
        reply.code(500).send();
      });
  }
}


function updateUserHandler(request, reply) {
  if (_.isNil(request.params.username) || _.isNil(request.body)) {
    reply.code(400).send();
  }
  User.update(request.params.username, request.body)
    .then(doc => {
      reply.status(201).send(doc);
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
  if (_.has(request.query, "purge") && request.query.purge.toLowerCase() === 'true') {
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
  createUserHandler,
  listUserHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler
};
