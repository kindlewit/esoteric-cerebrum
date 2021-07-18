'use strict';

const OptionHandler = require('../handlers/option-handlers');

module.exports = (fastify, opts, done) => {
  fastify.route({
    url: '/option',
    method: 'GET',
    handler: OptionHandler.listOptionHandler
  });
  done();
};
