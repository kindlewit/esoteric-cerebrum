const idealObjSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    email: { type: 'string' },
    display_name: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    attended: {
      oneOf: [
        { type: 'null' },
        { type: 'array' }
      ]
    },
    created_at: { type: 'string' }
  },
  required: [
    'username'
  ],
  additionalProperties: true
};
const arrayObjSchema = {
  type: 'object',
  properties: {
    total_docs: { type: 'number' },
    docs: { type: 'array' }
  },
  additionalProperties: true
};

module.exports = {
  signupSchema: {
    body: {
      username: { type: 'string' },
      password: { type: 'string' },
      email: { type: 'string' }
    },
    response: {
      201: idealObjSchema,
      400: { type: 'null' },
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
      500: { type: 'null' }
    }
  },
  getSchema: {
    params: {
      username: { type: 'string' }
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
  loginSchmea: {
    params: {
      username: { type: 'string' }
    },
    body: {
      password: { type: 'string' }
    },
    response: {
      200: { type: 'null' },
      400: { type: 'null' },
      401: { type: 'null' },
      404: { type: 'null' },
      500: { type: 'null' }
    }
  },
  updateSchema: {
    params: {
      username: { type: 'string' }
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
      username: { type: 'string' }
    },
    querystring: {
      purge: { type: 'boolean' }
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
