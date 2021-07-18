'use strict';

const _ = require('lodash');
const Option = require('../services/option-services');

function listOptionHandler(request, reply) {
  if (_.has(request.query, 'count') && request.query.count) {
    Option.count()
      .then(count => {
        return reply.code(200).send({ total_docs: count });
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  } else {
    let lt = _.has(request.query, 'limit') ? parseInt(request.query.limit) : null;
    let off = _.has(request.query, 'offset') ? parseInt(request.query.offset) : null;
    Option.list(lt, off)
      .then(docs => {
        return reply.code(200).send({ total_docs: docs.length, docs });
      })
      .catch(e => {
        request.log.error(e);
        return reply.code(500).send();
      });
  }
}

module.exports = {
  listOptionHandler
};
