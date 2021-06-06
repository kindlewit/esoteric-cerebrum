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
  fastify.post('/user', multiObjRes, UserHandler.signupUserHandler);
  fastify.patch('/user/:username', multiObjRes, UserHandler.updateUserHandler);
  fastify.put('/user/:username/_login', UserHandler.loginUserHandler);
  fastify.get('/user/:username', UserHandler.getUserHandler);
  fastify.delete('/user/:username', UserHandler.deleteUserHandler);
  fastify.get('/user', multiObjRes, UserHandler.listUserHandler);
  done();
};
