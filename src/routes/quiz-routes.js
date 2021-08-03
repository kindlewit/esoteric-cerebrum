'use strict';

import QuizControl from '../handlers/quiz-handlers';
import {
  createSchema,
  listSchema,
  getSchema,
  qrSchema,
  updateSchema,
  deleteSchema
} from './schema/quiz-schema';
import { cookieValidator } from '../handlers/user-handlers';

export default function (fastify, opts, done) {
  fastify.route({
    url: '/quiz',
    method: 'POST',
    schema: createSchema,
    preHandler: cookieValidator,
    handler: QuizControl.createQuizHandler
  });
  fastify.route({
    url: '/quiz',
    method: 'GET',
    schema: listSchema,
    handler: QuizControl.listQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'GET',
    schema: getSchema,
    handler: QuizControl.getQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'PATCH',
    schema: updateSchema,
    preHandler: cookieValidator,
    handler: QuizControl.updateQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'DELETE',
    schema: deleteSchema,
    preHandler: cookieValidator,
    handler: QuizControl.deleteQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords/_qr',
    method: 'GET',
    schema: qrSchema,
    handler: QuizControl.getQRcodeHandler
  });
  fastify.route({
    url: '/quiz/:threeWords/_collate',
    method: 'GET',
    handler: QuizControl.collateQuizHandler
  });
  fastify.route({
    url: '/quiz/:threeWords/_evaluate',
    method: ['GET', 'POST', 'PUT'],
    handler: QuizControl.evaluateQuizHandler
  });
  done();
}
