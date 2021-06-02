"use strict";

const UserHandler = require('../handlers/user-handlers');

const multiObjRes = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          total_docs: { type: 'number' },
          docs: { type: 'array' }
        }
      },
      400: {
        type: 'null'
      },
      404: {
        type: 'null'
      },
      500: {
        type: 'null'
      }
    }
  }
};

module.exports = (fastify, opts, done) => {
  fastify.post('/user', multiObjRes, UserHandler.createUserHandler);
  fastify.put('/user/:username', multiObjRes, UserHandler.updateUserHandler);
  fastify.get('/user/:username', UserHandler.getUserHandler);
  fastify.get('/user', multiObjRes, UserHandler.listUserHandler);
  done();
};
