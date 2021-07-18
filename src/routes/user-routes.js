'use strict';

const UserControl = require('../handlers/user-handlers');
const {
  signupSchema,
  listSchema,
  getSchema,
  loginSchmea,
  updateSchema,
  deleteSchema
} = require('./user-schema');

module.exports = (fastify, opts, done) => {
  fastify.route({
    url: '/user',
    method: 'POST',
    schema: signupSchema,
    handler: UserControl.signupUserHandler
  });
  fastify.route({
    url: '/user',
    method: 'GET',
    schema: listSchema,
    handler: UserControl.listUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'GET',
    schema: getSchema,
    handler: UserControl.getUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'PATCH',
    schema: updateSchema,
    preHandler: UserControl.cookieValidator,
    handler: UserControl.updateUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: UserControl.cookieValidator,
    handler: UserControl.deleteUserHandler
  });
  fastify.route({
    url: '/user/:username/_login',
    method: 'PUT',
    schema: loginSchmea,
    handler: UserControl.loginUserHandler
  });
  done();
};
