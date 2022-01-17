'use strict';

import * as UserController from '../controllers/user-controller';
import UserSchema from './schema/user-schema';

export default function (fastify, opts, done) {
  fastify.route({
    url: '/user',
    method: 'POST',
    schema: UserSchema.signupUser,
    handler: UserController.signupUser
  });
  fastify.route({
    url: '/user',
    method: 'GET',
    schema: UserSchema.listUsers,
    handler: UserController.listUsers
  });
  fastify.route({
    url: '/user/:username',
    method: 'GET',
    schema: UserSchema.getUser,
    handler: UserController.getUser
  });
  fastify.route({
    url: '/user/:username',
    method: 'PATCH',
    schema: UserSchema.updateUser,
    preHandler: UserController.cookieValidator,
    handler: UserController.updateUser
  });
  fastify.route({
    url: '/user/:username',
    method: 'DELETE',
    schema: UserSchema.deleteUser,
    preHandler: UserController.cookieValidator,
    handler: UserController.deleteUser
  });
  fastify.route({
    url: '/user/_login',
    method: 'PUT',
    schema: UserSchema.loginUser,
    handler: UserController.loginUser
  });
  fastify.route({
    url: '/user/_logout',
    method: 'PUT',
    preHandler: UserController.cookieValidator,
    handler: UserController.logoutUser
  });
  done();
}
