'use strict';

import fastify from 'fastify';
import cookie from 'fastify-cookie';
import session from 'fastify-session';
import connectRedis from 'connect-redis';

import { client } from './utils/cache-utils';
import { apiV1Logger } from './utils/logger-utils';
import diagnosis from './doctor';

const app = fastify({ logger: apiV1Logger });
const RedisStore = connectRedis(session);
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

app.get('/', diagnosis);

export default app;
