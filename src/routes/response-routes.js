'use strict';

import * as ResponseController from '../controllers/response-controller';
import { cookieValidator } from '../controllers/user-controller';
import {
  createSchema,
  listSchema,
  getSchema,
  cacheSchema,
  updateSchema,
  deleteSchema
} from './schema/response-schema';

export default function (fastify, opts, done) {
  fastify.route({
    url: '/quiz/:threewords/_submit',
    method: 'POST',
    preHandler: cookieValidator,
    handler: ResponseController.submitResponse
  });
  fastify.route({
    url: '/response',
    method: 'POST',
    schema: createSchema,
    preHandler: cookieValidator,
    handler: ResponseController.createResponseHandler
  });
  fastify.route({
    url: '/response',
    method: 'GET',
    schema: listSchema,
    handler: ResponseController.listResponseHandler
  });
  fastify.route({
    url: '/response',
    method: 'PUT',
    schema: getSchema,
    handler: ResponseController.getResponseHandler
  });
  fastify.route({
    url: '/response',
    method: 'PATCH',
    schema: updateSchema,
    preHandler: cookieValidator,
    handler: ResponseController.updateResponseHandler
  });
  fastify.route({
    url: '/response',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: cookieValidator,
    handler: ResponseController.deleteResponseHandler
  });
  fastify.route({
    url: '/response/_cache',
    method: ['POST', 'PUT', 'PATCH'],
    schema: cacheSchema,
    preHandler: cookieValidator,
    handler: ResponseController.cacheResponseHandler
  });
  done();
}
