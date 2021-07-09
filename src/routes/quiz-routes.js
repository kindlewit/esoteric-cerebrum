"use strict";

const QuizHandler = require('../handlers/quiz-handlers');
const { createSchema, listSchema, getSchema, qrSchema, updateSchema, deleteSchema } = require('./quiz-schema');
const { cookieValidator } = require('../handlers/user-handlers');

module.exports = (fastify, opts, done) => {
  fastify.route({
    url: '/quiz',
    method: 'POST',
    schema: createSchema,
    preHandler: cookieValidator,
    handler: QuizHandler.createQuizHandler
  });
  fastify.route({
    url: '/quiz',
    method: 'GET',
    schema: listSchema,
    handler: QuizHandler.listQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'GET',
    schema: getSchema,
    handler: QuizHandler.getQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'PATCH',
    schema: updateSchema,
    preHandler: cookieValidator,
    handler: QuizHandler.updateQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: cookieValidator,
    handler: QuizHandler.deleteQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords/_qr',
    method: 'GET',
    schema: qrSchema,
    handler: QuizHandler.getQRcodeHandler
  });
  fastify.route({
    url: '/quiz/:threeWords/_collate',
    method: 'GET',
    handler: QuizHandler.collateQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords/_evaluate',
    method: [
      "GET",
      "POST",
      "PUT"
    ],
    handler: QuizHandler.evaluateQuizHandler
  });
  done();
};
