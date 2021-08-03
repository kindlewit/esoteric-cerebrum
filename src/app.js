'use strict';

import pino from 'pino';
import fastify from 'fastify';
import cookie from 'fastify-cookie';
import session from 'fastify-session';
import connectRedis from 'connect-redis';

import { client } from './utils/cache-utils';

const RedisStore = connectRedis(session);
const app = fastify({
  logger: pino({
    level: 'info'
  })
});

const COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  signed: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 3600000 // 1 hour
};

// Cookie Middleware
app.register(cookie);
app.register(session, {
  secret:
    process.env.SESSION_SECRET ?? 'ZGV2ZWxvcG1lbnQtZW52aXJvbm1lbnQtc2VjcmV0cw',
  saveUninitialized: false,
  store: new RedisStore({
    client,
    prefix: 'LoginSession:'
  }),
  cookieName: '_sessionId',
  cookie: COOKIE_OPTS
});

// Route registeration
app.register(require('./routes/quiz-routes'), { prefix: '/api/v1' });
app.register(require('./routes/user-routes'), { prefix: '/api/v1' });
// app.register(require('./routes/question-routes'), { prefix: '/api/v1' });
// app.register(require('./routes/response-routes'), { prefix: '/api/v1' });
// app.register(require('./routes/option-routes'), { prefix: '/api/v1' });

app.get('/', (request, reply) => {
  return reply.code(200).send(
    JSON.stringify({
      healthy: true
    })
  );
});

export default app;
