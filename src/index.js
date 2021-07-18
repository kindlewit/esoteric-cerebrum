'use strict';

const logger = require('pino')({ level: 'info' });
const app = require('./app');

app.listen(8000, '0.0.0.0', (err) => {
  if (err) {
    logger.error(err);
  }
});
