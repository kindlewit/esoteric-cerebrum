/**
 * Unit tests for all /questions API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app.js'));

const { data: userData, endpoints: userEndpoints } = require(join(
  __dirname,
  '..',
  'constants.js'
)).user;
const { data: quizData, endpoints: quizEndpoints } = require(join(
  __dirname,
  '..',
  'constants.js'
)).quiz;
const { data, endpoints } = require(join(
  __dirname,
  '..',
  'constants.js'
)).question;

let THREE_WORDS;

async function getLoginCookieFor(userObject) {
  const loginRes = await app.inject({
    method: 'PUT',
    url: userEndpoints.loginUser,
    body: JSON.stringify(userObject)
  });
  return loginRes?.headers?.cookie ?? null;
}

async function createUserFor(user) {
  const userRes = await app.inject({
    method: 'POST',
    url: userEndpoints.createUser,
    body: JSON.stringify(user)
  });
  if (userRes.statusCode === 201) return true;
  return null;
}

async function createQuizFor(doc, user) {
  let cookies = getLoginCookieFor(user);
  const quizRes = await app.inject({
    method: 'POST',
    url: quizEndpoints.createQuiz,
    body: JSON.stringify(doc),
    cookies
  });
  if (quizRes.statusCode === 201) {
    return JSON.parse(quizRes.body).three_words;
  }
  return null;
}

beforeAll(async () => {
  await createUserFor(userData.updatedFirstUser);
  THREE_WORDS = await createQuizFor(quizData.singleQuiz);
});

describe('Fetch all questions', () => {
  describe('Before any creation', () => {
    test('should return 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuestions
      });
      expect(res.statusCode).toBe(200);
    });

    test('should return valid body', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuestions
      });

      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBeDefined();
      expect(total_docs).not.toBeNull();
      expect(Number.isFinite(total_docs)).toBe(true);
      expect(docs).toBeDefined();
      expect(docs).not.toBeNull();
      expect(Array.isArray(docs)).toBe(true);
    });

    test('should return 0 records', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuestions
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBe(0);
      expect(docs.length).toBe(0);
    });
  });

  describe('With non-existant quiz', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchQuestionsForQuiz.replace(
          '{threeWords}',
          'Name-Doesnt-Exists'
        )
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Paginated request', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuestions + '?page=2'
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Create questions', async () => {
  let { updatedFirstUser } = userData;
  let cookies = await getLoginCookieFor(updatedFirstUser);

  describe('With fake user', () => {
    test('should return 401', async () => {
      let fakeCookie = {
        _sessionId: new Buffer.from('user doesnt exist').toString('base64url')
      }; // passing fake cookie for user which does not exist
      let { questionWithoutText } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.generalUrl,
        body: JSON.parse(questionWithoutText),
        cookies: fakeCookie
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without login', () => {
    test('should return 401', async () => {
      let { questionWithoutText } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.generalUrl,
        body: JSON.parse(questionWithoutText)
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without quiz', () => {
    test('should return 400', async () => {
      let { questionWithoutText } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.generalUrl,
        body: JSON.parse(questionWithoutText)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('With non-existant quiz', () => {
    test('should return 404', async () => {
      // With login
      let { textQuestions } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', 'Quiz-Doesnt-Exist'),
        body: JSON.stringify(textQuestions),
        cookies
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('With empty data', () => {
    test('should return 400', async () => {
      // With login
      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify({}),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Missing required field: answer_format', () => {
    test('should return 400', async () => {
      let { questionWithoutFormatWithoutOptions } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify([questionWithoutFormatWithoutOptions]),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Missing required field: three_words', () => {
    test('should return 400', async () => {
      let { textQuestions } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.generalUrl,
        body: JSON.stringify(textQuestions),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Missing required field: options', () => {
    test('should return 400', async () => {
      let { questionWithoutOptionsWithAnswer } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl,
        body: JSON.stringify([questionWithoutOptionsWithAnswer]),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Missing required field: answers', () => {
    test('should return 400', async () => {
      let { questionWithoutAnswer } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuestionsForQuiz,
        body: JSON.stringify([questionWithoutAnswer])
      });
    });
  });

  describe('Unordered: without numbering', async () => {
    let { msqQuestions } = data;

    const res = await app.inject({
      method: 'POST',
      url: endpoints.createQuestionsForQuiz,
      body: JSON.stringify(msqQuestions),
      cookies
    });

    test('should return 200', () => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
    });

    test('should return valid schema', () => {
      let body = JSON.parse(res.body);
      /*
        Sample format: {
          questions: [
            {
              three_words, text, answer_format, number,
              options: [
                { character, text }
              ]
            }
          ]
        }
      */
      expect(body.questions).toBeDefined();
      expect(Array.isArray(body.questions)).toBe(true);
      let questionDoesNotHaveOptions = body.questions.some(
        (qn) =>
          qn.options === undefined || qn.options === null || qn.options === []
      );
      expect(questionDoesNotHaveOptions).toBe(false);
    });

    test('should return request data', () => {
      expect(body.three_words.equals(THREE_WORDS)).toBe(true);
      expect(body.question.length === msqQuestions.length).toBe(true);
    });

    test('should return data with number on fetch', async () => {});
  });

  describe('Wrong numbering', () => {
    test('', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuestionsForQuiz
      });
    });
  });

  // Happy path
  describe('Single question', () => {
    test('', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuestionsForQuiz
      });
    });
  });

  describe('With weightage as number', () => {});

  describe('Multiple questions', () => {
    test('', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuestionsForQuiz
      });
    });
  });
});
describe('Fetch questions', () => {
  describe('Fetch all');
  describe('With non-existant quiz');
  describe('With existing quiz');
  describe('Paginated request');
  describe('Answer without login');
  describe('Answer with different login');
  describe('Answer with creator login');
});
describe('Update question', () => {
  describe('With empty data');
  describe('Re-arranged order');
  describe('Wrong numbering');
  describe('Adding options');
  describe('Adding answers');
  describe('Removed options');
  describe('Removed answers');
  describe('Multiple quizzes');
  // Happy path
  describe('Single question');
  describe('Multiple questions');
});
describe('Delete question', () => {
  describe('Non-existant user');
  describe('Non-existant quiz');
  describe('Non-existant questions');
  describe('Without login');
  describe('Multiple quizzes');
  // Happy path
  describe('Single question');
  describe('Multiple questions');
});
describe('Collate questions', () => {});
describe('Evaluate questions');

/*
test('', async() => {
    const res = await app.inject({ method: , url: });
  });
*/
