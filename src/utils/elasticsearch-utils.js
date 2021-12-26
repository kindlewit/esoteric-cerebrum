import { Client } from '@elastic/elasticsearch';
import { Transform } from 'stream';

export function ElasticSearchUtils(opts) {
  this.client = new Client({
    node: opts.node,
    auth: null,
    cloud: null
  });
  this.index = opts?.index ?? null;
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

ElasticSearchUtils.prototype.createIndex = function (index, mappings = null) {
  return new Promise((resolve, reject) => {
    let body = {};
    if (mappings !== null || mappings !== undefined) {
      body.mappings = mappings;
    }
    return this.client.indices
      .create(
        {
          index,
          body
        },
        { ignore: [400] }
      )
      .then((d) => resolve(d))
      .catch(() => reject(false));
  });
};

ElasticSearchUtils.prototype.client = function () {
  return this.client;
};

ElasticSearchUtils.prototype.setIndex = function (index) {
  this.index = index;
  return true;
};

ElasticSearchUtils.prototype.createLogStream = function () {
  let { index, client } = this;

  return new Transform({
    readableObjectMode: true,
    write: (chunk, encoding, next) => {
      let body;

      try {
        body = JSON.parse(chunk);
        body.timestamp = new Date();
      } catch (e) {
        next();
      }
      console.log(body);
      client
        .index({
          index,
          body
        })
        .then(() => next);
    }
  });
};

ElasticSearchUtils.prototype.bulkIndex = function (data) {
  return new Promise((resolve, reject) => {
    if (
      this.client === null ||
      this.index === undefined ||
      this.index === null
    ) {
      reject(false);
    }
    if (data === null || typeof data !== 'object') {
      reject(false);
    }
    this.client.helpers
      .bulk({
        datasource: data,
        onDocument(doc) {
          doc.timestamp = new Date();
          return {
            index: { _index: this.index }
          };
        }
      })
      .then(() => resolve(true))
      .catch(() => reject(false));
  });
};

/**
 * Creating custom ES actor as custom mappings is not available in Pino
 *
 * As of Dec 26, 2021: logging works perfectly for Server start
 * but not for individual API calls
 */
