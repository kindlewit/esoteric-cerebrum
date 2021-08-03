'use strict';

import pino from 'pino';
import app from './app';

const logger = pino({ level: 'info' });

app.listen(8000, '0.0.0.0', (err) => {
  if (err) {
    logger.error(err);
  }
});
