import { Client } from '@elastic/elasticsearch';

export function ElasticSearchUtils(opts) {
  this.client = new Client({
    node: opts.node,
    auth: null,
    cloud: null
  });
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

ElasticSearchUtils.prototype.bulkIndex = function (index, data) {
  /**
   * Index bulk documents into ES
   */
  return new Promise((resolve, reject) => {
    this.client.helpers
      .bulk({
        datasource: data,
        onDocument(doc) {
          doc.timestamp = new Date();
          return {
            index: { _index: index }
          };
        }
      })
      .then(() => resolve(true))
      .catch(() => reject(false));
  });
};

/**
 * Creating custom ES actor as custom mappings is not available in Pino
 */
