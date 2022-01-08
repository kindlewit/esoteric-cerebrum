'use strict';

import app from './app';
import { apiV1Logger } from './utils/logger-utils';

const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    apiV1Logger.error(err);
  }
});
