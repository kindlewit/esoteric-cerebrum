"use strict";

const QuestionHandler = require('../handlers/question-handlers');

module.exports = (fastify, opts, done) => {
  fastify.post('/question', QuestionHandler.createQuestionHandler);
  fastify.patch('/question', QuestionHandler.updateQuestionHandler);
  fastify.delete('/question', QuestionHandler.deleteQuestionHandler);
  fastify.get('/question', QuestionHandler.listOrGetQuestionHandler);
  done();
};
