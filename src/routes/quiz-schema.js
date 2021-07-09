const idealObjSchema = {
  type: 'object',
  properties: {
    three_words: { type: 'string' },
    url: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    title: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    description: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    duration: {
      oneOf: [
        { type: 'number' },
        { type: 'null' }
      ]
    },
    topics: {
      oneOf: [
        { type: 'array' },
        { type: 'null' }
      ]
    },
    file_upload: { type: 'boolean' },
    is_live: { type: 'boolean' },
    username: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  },
  required: [
    "three_words",
    "username"
  ],
  additionalProperties: true
};
const arrayObjSchema = {
  type: 'object',
  properties: {
    total_docs: { type: 'integer' },
    docs: { type: 'array' }
  }
};

module.exports = {
  createSchema: {
    body: { type: 'object' },
    response: {
      201: idealObjSchema,
      400: { type: 'null' },
      401: { type: 'null' },
      403: { type: 'null' },
      500: { type: 'null' }
    }
  },
  listSchema: {
    querystring: {
      limit: { type: 'integer' },
      offset: { type: 'integer' },
      count: { type: 'boolean' }
    },
    response: {
      200: arrayObjSchema,
      400: { type: 'null' },
      404: { type: 'null' },
      500: { type: 'null' }
    },
    additionalProperties: true
  },
  getSchema: {
    params: {
      threeWords: { type: 'string' }
    },
    querystring: {
      linked: { type: 'string' }
    },
    response: {
      200: idealObjSchema,
      400: { type: 'null' },
      404: { type: 'null' },
      500: { type: 'null' }
    }
  },
  qrSchema: {
    params: {
      threeWords: { type: 'string' }
    },
    response: {
      200: { type: 'string' },
      400: { type: 'null' },
      500: { type: 'null' }
    },
  },
  updateSchema: {
    params: {
      threeWords: { type: 'string' }
    },
    body: { type: 'object' },
    response: {
      200: idealObjSchema,
      400: { type: 'null' },
      401: { type: 'null' },
      403: { type: 'null' },
      404: { type: 'null' },
      500: { type: 'null' }
    }
  },
  deleteSchema: {
    params: {
      threeWords: { type: 'string' }
    },
    querystring: {
      purge: { type: 'string' }
    },
    response: {
      204: { type: 'null' },
      401: { type: 'null' },
      403: { type: 'null' },
      400: { type: 'null' },
      500: { type: 'null' }
    }
  }
};
