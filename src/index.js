"use strict";

const app = require('./app');

app.listen(8000, '0.0.0.0', (err) => {
  if (err) {
    logger.error(err);
  }
});
