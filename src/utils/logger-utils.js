'use strict';

import pino from 'pino';
import pinoES from 'pino-elasticsearch';

import { ES_HOST, ES_API_VERSION } from '../config';

const apiV1LogStream = pinoES({
  index: 'api-v1-log-2021', // change index to log-YYYY-month
  consistency: 'one',
  node: ES_HOST,
  'es-version': parseInt(ES_API_VERSION),
  'flush-bytes': 1000
});

// TODO: Config log as per https://github.com/pinojs/pino/blob/master/docs/api.md#log
/*
const apiV1Logger = pino(
  {
    level: 'info',
    redact: ['req.headers.authorization']
  },
  apiV1LogStream
);
*/
function modifyLog(log) {
  if (log.req) {
    // console.log(log.req.raw.url, log.req.raw);
    return {
      abc: 'jkl',
      method: log.req.raw.method,
      url: log.req.raw.url,
      httpVersion: log.req.raw.httpVersion,
      rawHeaders: log.req.raw.rawHeaders,
      statusCode: log.req.raw.statusCode,
      statusMessage: log.req.raw.statusMessage,
      keepAliveTimeout: log.req.raw.socket.server.keepAliveTimeout
    };
  }
  return log;
}

const apiV1Logger = pino(
  {
    formatters: {
      log: modifyLog
    },
    level: 'info'
  },
  apiV1LogStream
);

export { apiV1Logger };
