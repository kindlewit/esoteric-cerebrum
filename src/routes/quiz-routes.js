"use strict";

const QuizHandler = require('../handlers/quiz-handlers');

const multiObjRes = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          total_docs: { type: 'number' },
          docs: { type: 'array' }
        }
      },
      400: {
        type: 'null'
      },
      404: {
        type: 'null'
      },
      500: {
        type: 'null'
      }
    }
  }
};

const strRes = {
  schema: {
    response: {
      200: {
        type: 'string'
      },
      400: {
        type: 'null'
      },
      500: {
        type: 'null'
      }
    }
  }
};

module.exports = (fastify, opts, done) => {
  fastify.post('/quiz', multiObjRes, QuizHandler.createQuizHandler);
  fastify.patch('/quiz/:threeWords', multiObjRes, QuizHandler.updateQuizHandler);
  fastify.get('/quiz/:threeWords/_qr', strRes, QuizHandler.getQRcodeHandler);
  fastify.get('/quiz/:threeWords', QuizHandler.getQuizHandler);
  fastify.get('/quiz', multiObjRes, QuizHandler.listQuizHandler);
  done();
};
