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
    preHandler: UserHandler.userCookieValidator,
    schema: updateSchema,
    handler: UserHandler.updateUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'DELETE',
    preHandler: UserHandler.userCookieValidator,
    schema: deleteSchema,
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
