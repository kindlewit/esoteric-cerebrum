export const NODE_ENV = process.env.NODE_ENV || 'dev';

export const DB_URI =
  process.env.DB_URI || 'postgres://username:password@127.0.0.1:5432/thinq';
export const RDS_HOST = process.env.RDS_HOST || '127.0.0.1';
export const RDS_PORT = process.env.RDS_PORT || '6379';
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
      type: 'text',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    pid: {
      type: 'long'
    },
    req: {
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
        method: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        remoteAddress: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        remotePort: {
          type: 'long'
        },
        url: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        }
      }
    },
    reqId: {
      type: 'text',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
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

export const ERROR_MESSAGE =
  'Request caused an error: {errorcode}';

export const PAGE_LIMITS = {
  USER: 20,
  QUIZ: 10,
  QUESTION: 25,
  RESPONSE: 25
};
