"use strict";

const UserHandler = require('../handlers/user-handlers');
const { signupSchema, listSchema, getSchema, loginSchmea, updateSchema, deleteSchema } = require('./user-schema');

module.exports = (fastify, opts, done) => {
  fastify.route({
    url: '/user',
    method: 'POST',
    schema: signupSchema,
    handler: UserHandler.signupUserHandler
  });
  fastify.route({
    url: '/user',
    method: 'GET',
    schema: listSchema,
    handler: UserHandler.listUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'GET',
    schema: getSchema,
    handler: UserHandler.getUserHandler
  });
  fastify.route({
    url: '/user:username',
    method: 'PATCH',
    schema: updateSchema,
    preHandler: UserHandler.cookieValidator,
    handler: UserHandler.updateUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: UserHandler.cookieValidator,
    handler: UserHandler.deleteUserHandler
  });
  fastify.route({
    url: '/user/:username/_login',
    method: 'PUT',
    schema: loginSchmea,
    handler: UserHandler.loginUserHandler
  });
  done();
};
