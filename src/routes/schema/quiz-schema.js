const quizObjectResponse = {
  type: 'object',
  properties: {
    three_words: { type: 'string' },
    title: {
      oneOf: [{ type: 'string' }, { type: 'null' }]
    },
    description: {
      oneOf: [{ type: 'string' }, { type: 'null' }]
    },
    start: { type: 'string' },
    status: { type: 'number' },
    topics: {
      oneOf: [{ type: 'array' }, { type: 'null' }]
    },
    config: { type: 'object' },
    username: { type: 'string' },
    display_name: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  },
  required: ['three_words', 'username'],
  additionalProperties: true
};
const quizArrayResponse = {
  type: 'object',
  properties: {
    total_docs: { type: 'integer' },
    docs: { type: 'array' }
  },
  additionalProperties: true
};

const createQuiz = {
  body: { type: 'object' },
  response: {
    201: quizObjectResponse,
    400: { type: 'null' },
    401: { type: 'null' },
    403: { type: 'null' },
    500: { type: 'null' }
  }
};

const listQuizzes = {
  querystring: {
    page: { type: 'integer' },
    size: { type: 'integer' },
    count: { type: 'boolean' }
  },
  response: {
    200: quizArrayResponse,
    400: { type: 'null' },
    404: { type: 'null' },
    500: { type: 'null' }
  },
  additionalProperties: true
};

const getQuiz = {
  params: {
    threeWords: { type: 'string' }
  },
  querystring: {
    linked: { type: 'string' }
  },
  response: {
    200: quizObjectResponse,
    400: { type: 'null' },
    404: { type: 'null' },
    500: { type: 'null' }
  }
};

const updateQuiz = {
  params: {
    threeWords: { type: 'string' }
  },
  body: { type: 'object' },
  response: {
    200: quizObjectResponse,
    400: { type: 'null' },
    401: { type: 'null' },
    403: { type: 'null' },
    404: { type: 'null' },
    500: { type: 'null' }
  }
};

const deleteQuiz = {
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
};

const collateQuiz = {
  params: {
    threeWords: { type: 'string' }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        start: { type: 'string' },
        status: { type: 'number' },
        config: { type: 'object' },
        questions: { type: 'array' }
      },
      additionalProperties: true
    }
  }
};

export default {
  createQuiz,
  listQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  collateQuiz
};
