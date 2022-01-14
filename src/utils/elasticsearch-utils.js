/**
 * Creating a custom ES actor as custom mappings is not available
 * in Pino-ES package
 *
 * As of Dec 28, 2021: logging works perfectly for simple queries.
 * Checks required for complications
 */
'use strict';

import { Client } from '@elastic/elasticsearch';
import { LOG_MAPPING, SCROLL_SIZE } from '../config';

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
    body.timestamp = new Date().toISOString();
  } catch {
    body = {
      value: line,
      timestamp: new Date().toISOString()
    };
  }
  await this.client.index({
    index: this.index,
    body
  });
  return;
};

ElasticSearchUtils.prototype.upsert = async function (doc) {
  let opts = {};

  if (doc._id) {
    // Extract _id already present within doc
    let { _id, ...docWithoutId } = doc;
    opts.id = _id;
    opts.body = docWithoutId;
  } else {
    opts.body = doc;
  }
  opts.index = this.index;

  return await this.client.index(opts);
};

ElasticSearchUtils.prototype.bulkUpsert = async function (docs) {
  let body;
  let _index = this.index;

  body = docs.flatMap((doc) => {
    if (doc._id) {
      let { _id, ...docWithoutId } = doc;
      return [{ index: { _index, _id } }, docWithoutId]; // Specified _id
    }
    return [{ index: { _index } }, doc]; // Rand gen _id
  });

  return await this.client.bulk({
    index: this.index,
    body
  });
};

ElasticSearchUtils.prototype.search = async function (query) {
  return await this.client.search({
    index: this.index,
    scroll_size: SCROLL_SIZE,
    body: {
      query
    }
  });
};

ElasticSearchUtils.prototype.get = async function (id) {
  return await this.client.get({ index: this.index, id });
};

ElasticSearchUtils.prototype.delete = async function (id) {
  return await this.client.delete({ index: this.index, id });
};

ElasticSearchUtils.prototype.bulkDelete = async function (query) {
  return await this.client.deleteByQuery({
    index: this.index,
    body: query
  });
};
