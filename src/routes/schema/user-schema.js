const userObjectResponse = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    email: { type: 'string' },
    display_name: {
      oneOf: [{ type: 'string' }, { type: 'null' }]
    },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  },
  additionalProperties: true
};
const userArrayResponse = {
  type: 'object',
  properties: {
    total_docs: { type: 'number' },
    docs: { type: 'array' }
  },
  additionalProperties: true
};

const signupUser = {
  body: {
    username: { type: 'string' },
    password: { type: 'string' },
    email: { type: 'string' }
  },
  response: {
    201: userObjectResponse,
    400: { type: 'null' },
    500: { type: 'string' }
  }
};

const listUsers = {
  querystring: {
    page: { type: 'integer' }
  },
  response: {
    200: userArrayResponse,
    500: { type: 'string' }
  }
};

const getUser = {
  params: {
    username: { type: 'string' }
  },
  response: {
    200: userObjectResponse,
    400: { type: 'null' },
    404: { type: 'null' },
    500: { type: 'string' }
  }
};

const updateUser = {
  params: {
    username: { type: 'string' }
  },
  body: { type: 'object' },
  response: {
    200: userObjectResponse,
    400: { type: 'null' },
    401: { type: 'null' },
    403: { type: 'null' },
    404: { type: 'null' },
    500: { type: 'string' }
  }
};

const deleteUser = {
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
    500: { type: 'string' }
  }
};

const loginUser = {
  body: {
    username: { type: 'string' },
    password: { type: 'string' }
  },
  response: {
    200: { type: 'null' },
    400: { type: 'null' },
    401: { type: 'null' },
    404: { type: 'null' },
    500: { type: 'string' }
  }
};

const statsUser = {
  params: {
    username: { type: 'string' }
  },
  querystring: {
    mode: { type: 'string' }
  },
  response: {
    200: { type: 'array' },
    204: { type: 'null' },
    400: { type: 'null' },
    401: { type: 'null' },
    404: { type: 'null' },
    403: { type: 'null' },
    500: { type: 'null' }
  }
};

export default {
  signupUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  statsUser
};
