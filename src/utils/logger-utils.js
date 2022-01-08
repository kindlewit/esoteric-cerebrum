'use strict';

import pino from 'pino';
import dayjs from 'dayjs';

import { ElasticSearchUtils } from './elasticsearch-utils';
import { ES_HOST } from '../config';

let LOG_INDEX = 'api-log-' + dayjs().format('YYYY-MMM').toLowerCase();
let esActor = new ElasticSearchUtils({ node: ES_HOST });
esActor.setIndex(LOG_INDEX);

// TODO: Config log as per https://github.com/pinojs/pino/blob/master/docs/api.md#log
/*
function modifyLog(log) {
  // console.log(log?.req?.raw?.method, log?.res?.raw?.statusMessage);
  if (log.req) {
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
  } else {
    return log;
  }
}
*/
const apiV1Logger = pino({ level: 'info' }, esActor);

/**
 * Set up cron to reset ES index each month
 * by: esActor.setIndex(new_log_index)
 */

export { apiV1Logger };
