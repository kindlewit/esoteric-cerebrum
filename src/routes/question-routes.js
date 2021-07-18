'use strict';

const QuestionHandler = require('../handlers/question-handlers');
const {
  createSchema,
  listSchema,
  cacheSchema,
  updateSchema,
  deleteSchema,
  getSchema
} = require('./question-schema');
const { cookieValidator } = require('../handlers/user-handlers');

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
    method: [
      'POST',
      'PUT',
      'PATCH'
    ],
    schema: cacheSchema,
    preHandler: cookieValidator,
    handler: QuestionHandler.cacheQuestionHandler
  });
  done();
};
