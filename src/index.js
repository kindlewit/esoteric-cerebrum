"use strict";

const logger = require('pino')({ level: 'info' });
const fastify = require('fastify');
const app = fastify({ logger: logger });

// Cookie Middleware
app.register(require('fastify-cookie'), {
  secret: "ZGV2ZWxvcG1lbnQtZW52aXJvbm1lbnQtc2VjcmV0cw"
});

// Route registeration
app.register(require('./routes/quiz-routes'), { prefix: '/api/v1' });
app.register(require('./routes/user-routes'), { prefix: '/api/v1' });
app.register(require('./routes/question-routes'), { prefix: '/api/v1' });
app.register(require('./routes/response-routes'), { prefix: '/api/v1' });

app.listen(8000, '0.0.0.0', (err) => {
  if (err) {
    logger.error(err);
  }
});
