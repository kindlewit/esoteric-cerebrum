'use strict';

import UserControl, { cookieValidator } from '../handlers/user-handlers';
import {
  signupSchema,
  listSchema,
  getSchema,
  loginSchmea,
  updateSchema,
  deleteSchema
} from './schema/user-schema';

export default function (fastify, opts, done) {
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
    preHandler: cookieValidator,
    handler: UserControl.updateUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: cookieValidator,
    handler: UserControl.deleteUserHandler
  });
  fastify.route({
    url: '/user/_login',
    method: 'PUT',
    schema: loginSchmea,
    handler: UserControl.loginUserHandler
  });
  done();
}
