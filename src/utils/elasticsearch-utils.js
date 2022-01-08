/**
 * Creating custom ES actor as custom mappings is not available in Pino
 *
 * As of Dec 28, 2021: logging works perfectly for simple queries.
 * Checks required for complications
 */
'use strict';

import { Client } from '@elastic/elasticsearch';
import { LOG_MAPPING } from '../config';

export function ElasticSearchUtils(opts) {
  this.client = new Client({
    node: opts.node,
    auth: null,
    cloud: null
  });
  this.index = opts.index ?? null;
}

ElasticSearchUtils.prototype.indexExists = function (name) {
  // for some reason using arrow function won't work here ^
  return new Promise((resolve, reject) => {
    this.client.indices
      .exists({
        index: name
      })
      .then((d) => resolve(d?.body ?? false))
      .catch(() => reject(false));
  });
};

ElasticSearchUtils.prototype.setIndex = async function (index, mapping) {
  if (!this.client.indices.exists({ index })) {
    let body = {
      mappings:
        mapping !== undefined && mapping !== null ? mapping : LOG_MAPPING
    };
    await this.client.indices.create(
      {
        index,
        body
      },
      { ignore: [400] }
    );
  }
  this.index = index;
  return true;
};

ElasticSearchUtils.prototype.write = async function (line) {
  let body;
  try {
    body = { ...JSON.parse(line) };

    // Push below loc into log_formatter fn
    if (Object.prototype.hasOwnProperty.call(body, 'time')) delete body.time;
    body.timestamp = new Date().valueOf();
  } catch {
    body = {
      value: line,
      timestamp: new Date().valueOf()
    };
  }
  await this.client.index({
    index: this.index,
    body
  });
  return;
};
