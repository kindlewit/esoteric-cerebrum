'use strict';

import ResponseHandler from '../handlers/response-handlers';
import {
  createSchema,
  listSchema,
  getSchema,
  cacheSchema,
  updateSchema,
  deleteSchema
} from './schema/response-schema';
import { cookieValidator } from '../handlers/user-handlers';

module.exports = (fastify, opts, done) => {
  fastify.route({
    url: '/response',
    method: 'POST',
    schema: createSchema,
    preHandler: cookieValidator,
    handler: ResponseHandler.createResponseHandler
  });
  fastify.route({
    url: '/response',
    method: 'GET',
    schema: listSchema,
    handler: ResponseHandler.listResponseHandler
  });
  fastify.route({
    url: '/response',
    method: 'PUT',
    schema: getSchema,
    handler: ResponseHandler.getResponseHandler
  });
  fastify.route({
    url: '/response',
    method: 'PATCH',
    schema: updateSchema,
    preHandler: cookieValidator,
    handler: ResponseHandler.updateResponseHandler
  });
  fastify.route({
    url: '/response',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: cookieValidator,
    handler: ResponseHandler.deleteResponseHandler
  });
  fastify.route({
    url: '/response/_cache',
    method: ['POST', 'PUT', 'PATCH'],
    schema: cacheSchema,
    preHandler: cookieValidator,
    handler: ResponseHandler.cacheResponseHandler
  });
  done();
};
