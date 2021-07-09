"use strict";

const logger = require('pino')({ level: 'info' });
const fastify = require('fastify');
const session = require('fastify-session');
const RedisStore = require('connect-redis')(session);

const { client } = require('./utils/cache-utils');

const app = fastify({ logger: logger });
const COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  signed: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 3600000 // 1 hour
};


// Cookie Middleware
app.register(require('fastify-cookie'));
app.register(session, {
  secret: process.env.SESSION_SECRET ?? "ZGV2ZWxvcG1lbnQtZW52aXJvbm1lbnQtc2VjcmV0cw",
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
app.register(require('./routes/question-routes'), { prefix: '/api/v1' });
app.register(require('./routes/response-routes'), { prefix: '/api/v1' });
app.register(require('./routes/option-routes'), { prefix: '/api/v1' });

module.exports = app;
