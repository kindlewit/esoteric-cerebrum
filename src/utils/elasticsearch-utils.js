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
      .then((d) => {
        return resolve(d?.body ?? false);
      })
      .catch(() => {
        reject(false);
      });
  });
};
