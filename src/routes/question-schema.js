const idealObjSchema = {
  type: 'object',
  properties: {
    three_words: { type: 'string' },
    number: { type: 'integer' },
    text: { type: 'string' },
    file: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    weightage: { type: 'number' },
    answer_format: {
      enum: [
        "text",
        "mcq",
        "multi"
      ]
    },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  },
  required: [
    "three_words",
    "number",
    "text",
    "weightage",
    "answer_format"
  ],
  additionalProperties: true
};
const idealObjArraySchema = {
  type: 'object',
  properties: {
    three_words: { type: 'string' },
    questions: { type: 'array' }
  },
  required: [
    "three_words",
    "questions"
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
      403: { type: 'null' },
      500: { type: 'null' }
    }

  },
  listSchema: {
    querystring: {
      count: { type: 'boolean' },
      limit: { type: 'integer' },
      offset: { type: 'integer' }
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
      500: { type: 'null' }
    }
  },
  cacheSchema: {
    body: {
      three_words: { type: 'string' },
      questions: { type: 'array' },
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
      number: { type: 'integer' }
    },
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
    querystring: {
      purge: { type: 'boolean' }
    },
    body: {
      three_words: { type: 'string' },
      number: { type: 'integer' }
    },
    response: {
      204: { type: 'null' },
      400: { type: 'null' },
      401: { type: 'null' },
      403: { type: 'null' },
      500: { type: 'null' }
    }
  }
};
