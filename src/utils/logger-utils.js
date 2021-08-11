'use strict';

import pino from 'pino';
import pinoES from 'pino-elasticsearch';

import { ES_HOST, ES_API_VER } from '../config';

const apiV1LogStream = pinoES({
  index: 'api-v1-log-2021',
  consistency: 'one',
  node: ES_HOST,
  'es-version': parseInt(ES_API_VER),
  'flush-bytes': 1000
});

const apiV1Logger = pino(
  {
    level: 'info',
    redact: ['req.headers.authorization']
  },
  apiV1LogStream
);

export { apiV1Logger };
