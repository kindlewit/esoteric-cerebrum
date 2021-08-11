'use strict';

import app from './app';
import { apiV1Logger } from './utils/logger-utils';

app.listen(8000, '0.0.0.0', (err) => {
  if (err) {
    apiV1Logger.error(err);
  }
});
