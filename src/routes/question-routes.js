'use strict';

import QuestionHandler from '../handlers/question-handlers';
import {
  createSchema,
  listSchema,
  getSchema,
  cacheSchema,
  updateSchema,
  deleteSchema
} from './schema/question-schema';
import { cookieValidator } from '../handlers/user-handlers';

module.exports = (fastify, opts, done) => {
  fastify.route({
    url: '/question',
    method: 'POST',
    schema: createSchema,
    preHandler: cookieValidator,
    handler: QuestionHandler.createQuestionHandler
  });
  fastify.route({
    url: '/question',
    method: 'GET',
    schema: listSchema,
    handler: QuestionHandler.listQuestionHandler
  });
  fastify.route({
    url: '/question',
    method: 'PUT',
    schema: getSchema,
    handler: QuestionHandler.getQuestionHandler
  });
  fastify.route({
    url: '/question',
    method: 'PATCH',
    schema: updateSchema,
    preHandler: cookieValidator,
    handler: QuestionHandler.updateQuestionHandler
  });
  fastify.route({
    url: '/question',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: cookieValidator,
    handler: QuestionHandler.deleteQuestionHandler
  });
  fastify.route({
    url: '/question/_cache',
    method: ['POST', 'PUT', 'PATCH'],
    schema: cacheSchema,
    preHandler: cookieValidator,
    handler: QuestionHandler.cacheQuestionHandler
  });
  done();
};
