'use strict';

import * as UserController from '../controllers/user-controller';
import { signupSchema, loginSchema } from './schema/user-schema';

export default function (fastify, opts, done) {
  fastify.post('/user', { schema: signupSchema }, UserController.signupUser);
  fastify.get('/user', UserController.listUsers);
  fastify.get('/user/:username', UserController.getUser);
  fastify.patch(
    '/user/:username',
    { preHandler: UserController.cookieValidator },
    UserController.updateUser
  );
  fastify.delete(
    '/user/:username',
    { preHandler: UserController.cookieValidator },
    UserController.deleteUser
  );
  fastify.put(
    '/user/_login',
    { schema: loginSchema },
    UserController.loginUser
  );
  fastify.put(
    '/user/_logout',
    { preHandler: UserController.cookieValidator },
    UserController.logoutUser
  );
  /*
  fastify.route({
    url: '/user',
    method: 'POST',
    schema: signupSchema,
    handler: UserController.signupUserHandler
  });
  fastify.route({
    url: '/user',
    method: 'GET',
    schema: listSchema,
    handler: UserController.listUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'GET',
    schema: getSchema,
    handler: UserController.getUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'PATCH',
    schema: updateSchema,
    preHandler: UserController.cookieValidator,
    handler: UserController.updateUserHandler
  });
  fastify.route({
    url: '/user/:username',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: UserController.cookieValidator,
    handler: UserController.deleteUserHandler
  });
  fastify.route({
    url: '/user/_login',
    method: 'PUT',
    schema: loginSchmea,
    handler: UserController.loginUserHandler
  });
  fastify.route({
    url: '/user/_logout',
    method:'PUT',
    preHandler: UserController.cookieValidator,
    handler: UserContoller.logoutUser,
  })
  */
  done();
}
