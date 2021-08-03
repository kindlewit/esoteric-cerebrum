const idealObjSchema = {
  type: 'object',
  properties: {
    three_words: { type: 'string' },
    username: { type: 'string' },
    number: { type: 'integer' },
    text: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    score: {
      oneOf: [
        { type: 'number' },
        { type: 'null' }
      ]
    },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  },
  required: [
    'three_words',
    'username',
    'number'
  ],
  additionalProperties: true
};
const idealObjArraySchema = {
  type: 'object',
  properties: {
    three_words: { type: 'string' },
    username: { type: 'string' },
    responses: { type: 'array' }
  },
  required: [
    'three_words',
    'username',
    'responses'
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
    body: idealObjArraySchema,
    response: {
      201: idealObjArraySchema,
      400: { type: 'null' },
      401: { type: 'null' },
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
      500: { type: 'null' }
    }
  },
  getSchema: {
    body: { type: 'object' },
    response: {
      200: {
        oneOf: [
          idealObjSchema,
          arrayObjSchema
        ]
      },
      400: { type: 'null' },
      404: { type: 'null' },
      500: { type: 'null' }
    }
  },
  cacheSchema: {
    body: {
      three_words: { type: 'string' },
      responses: { type: 'array' }
    },
    response: {
      200: idealObjArraySchema,
      204: { type: 'null' },
      400: { type: 'null' },
      401: { type: 'null' },
      500: { type: 'null' }
    }
  },
  updateSchema: {
    body: {
      three_words: { type: 'string' },
      username: { type: 'string' },
      number: { type: 'integer' }
    },
    response: {
      200: idealObjSchema,
      400: { type: 'null' },
      401: { type: 'null' },
      404: { type: 'null' },
      500: { type: 'null' }
    }
  },
  deleteSchema: {
    body: {
      three_words: { type: 'string' },
      username: { type: 'string' },
      number: { type: 'integer' }
    },
    response: {
      204: { type: 'null' },
      400: { type: 'null' },
      401: { type: 'null' },
      500: { type: 'null' }
    }
  }
};
