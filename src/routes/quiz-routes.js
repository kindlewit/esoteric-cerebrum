'use strict';

import QuizSchema from './schema/quiz-schema';
import { cookieValidator } from '../controllers/user-controller';
import * as QuizContoller from '../controllers/quiz-controller';

export default function (fastify, opts, done) {
  fastify.route({
    url: '/quiz',
    method: 'POST',
    schema: QuizSchema.createQuiz,
    preHandler: cookieValidator,
    handler: QuizContoller.createQuiz
  });
  fastify.route({
    url: '/quiz',
    method: 'GET',
    schema: QuizSchema.listQuizzes,
    handler: QuizContoller.listQuizzes
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'GET',
    schema: QuizSchema.getQuiz,
    handler: QuizContoller.getQuiz
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'PATCH',
    schema: QuizSchema.updateQuiz,
    preHandler: cookieValidator,
    handler: QuizContoller.updateQuiz
  });
  fastify.route({
    url: '/quiz/:threeWords',
    method: 'DELETE',
    preHandler: cookieValidator,
    handler: QuizContoller.deleteQuiz
  });
  fastify.route({
    url: '/quiz/:threeWords/_collate',
    method: 'GET',
    preHandler: cookieValidator,
    handler: QuizContoller.collateQuiz
  });
  // fastify.route({
  //   url: '/quiz/:threeWords/_evaluate',
  //   method: ['GET', 'POST', 'PUT'],
  //   handler: QuizControl.evaluateQuizHandler
  // });
  done();
}
