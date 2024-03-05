export const NODE_ENV = process.env.NODE_ENV || 'development';

const RDS_HOSTNAME = process.env.RDS_HOSTNAME || '127.0.0.1';
const RDS_PORT = process.env.RDS_PORT || '5432';
const RDS_DB_NAME = process.env.RDS_DB_NAME || 'thinq';
const RDS_USERNAME = process.env.RDS_USERNAME || 'thinq_username';
const RDS_PASSWORD = process.env.RDS_PASSWORD || 'thinq_password';

export const DB_URI =
  process.env.DB_URI ||
  `postgres://${RDS_USERNAME}:${RDS_PASSWORD}@${RDS_HOSTNAME}:${RDS_PORT}/${RDS_DB_NAME}`;
export const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
export const REDIS_PORT = process.env.REDIS_PORT || '6379';
export const ES_HOST = process.env.ES_HOST || 'http://localhost:9200';
export const ES_API_VERSION = process.env.ES_API_VERSION || '7.2';

export const SALT_LENGTH = 8;

export const QR_URL = 'https://api.qrserver.com/v1/create-qr-code';
export const DEFAULT_QR_OPTS = {
  size: '300x300',
  margin: '5',
  qzone: '1',
  format: 'png',
  color: 'FA8072',
  bgcolor: 'FFFAFA'
};

export const LOG_MAPPING = {
  properties: {
    hostname: {
      type: 'text',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    level: {
      type: 'long'
    },
    msg: {
      type: 'text'
    },
    pid: {
      type: 'long'
    },
    req: {
      properties: {
        hostname: {
          type: 'keyword'
        },
        method: {
          type: 'keyword'
        },
        remoteAddress: {
          type: 'keyword'
        },
        remotePort: {
          type: 'long'
        },
        url: {
          type: 'text'
        }
      }
    },
    reqId: {
      type: 'keyword'
    },
    res: {
      properties: {
        statusCode: {
          type: 'long'
        }
      }
    },
    responseTime: {
      type: 'float'
    },
    timestamp: {
      type: 'date'
    }
  }
};

export const RESPONSE_MAPPING = {
  properties: {
    three_words: {
      type: 'keyword'
    },
    username: {
      type: 'keyword'
    },
    number: {
      type: 'unsigned_long'
    },
    text: {
      type: 'text'
    },
    choice: {
      type: 'keyword'
    },
    score: {
      type: 'float'
    },
    created_at: {
      type: 'date'
    },
    updated_at: {
      type: 'date'
    }
  }
};

export const PAGE_LIMITS = {
  USER: 20,
  QUIZ: 10,
  QUESTION: 25,
  RESPONSE: 25
};

export const SEARCH_LIMITS = {
  USER: 5,
  QUIZ: 10,
  TOPIC: 5
};

export const ERROR_MESSAGES = {
  GENERIC: 'Request caused an error. Please try again later.',
  MISSING_REQUIRED: 'Required field(s) missing in request: ',
  FORBIDDEN: 'Requesting data for different user',
  CONFLICT: 'Received conflicting data: '
};
