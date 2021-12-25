'use strict';

import pino from 'pino';
import pinoES from 'pino-elasticsearch';
import dayjs from 'dayjs';

import { ElasticSearchUtils } from './elasticsearch-utils';
import { ES_HOST, ES_API_VERSION } from '../config';

let INDEX = 'api-log-' + dayjs().format('YYYY-MMM').toLowerCase();
let es = new ElasticSearchUtils({ node: ES_HOST });

const esLogStream = pinoES({
  index: INDEX,
  consistency: 'one',
  node: ES_HOST,
  'es-version': parseInt(ES_API_VERSION)
});

// TODO: Config log as per https://github.com/pinojs/pino/blob/master/docs/api.md#log
/*
const apiV1Logger = pino(
  {
    level: 'info',
    redact: ['req.headers.authorization']
  },
  esLogStream
);
*/
function modifyLog(log) {
  if (log.req) {
    // console.log(log.req.raw.url, log.req.raw);
    return {
      method: log.req?.raw?.method,
      url: log.req?.raw?.url,
      httpVersion: log.req?.raw?.httpVersion,
      headers: log.req?.raw?.rawHeaders,
      statusCode: log.req?.raw?.statusCode,
      statusMessage: log.req?.raw?.statusMessage,
      keepAliveTimeout: log.req?.raw?.socket.server.keepAliveTimeout
    };
  } else if (log.res && log.res.raw) {
    return {
      keepAliveTimeout: log.res.raw?._keepAliveTimeout,
      shouldKeepAlive: log.res?.raw?.shouldKeepAlive,
      statusCode: log.res?.raw?.statusCode,
      statusMessage: log.res?.raw?.statusMessage
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
  esLogStream
);

export { apiV1Logger };
