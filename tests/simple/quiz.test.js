/**
 * Simple unit tests for all /quiz API endpoints
 */
const { join } = require('path');

const app = require(join(__dirname, '..', '..', 'lib', 'app'));
// const db = require(join(__dirname, '..', '..', 'lib', 'orm'));

const { endpoints, data } = require('../constants').quiz;
const { updatedSingleUser, endpoints: userEndpoints } =
  require('../constants').user;

describe('Fetch all quizzes', () => {
  describe('Before creation', () => {
    test('should return 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuizzes
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });

    test('should have response body as per schema', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuizzes
      });

      expect(res.body).toBeDefined();
      let { total_docs, docs } = JSON.parse(req.body);

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
        url: endpoints.fetchAllQuizzes
      });

      expect(res.body).toBeDefined();
      let { total_docs, docs } = JSON.parse(req.body);

      expect(Number.isFinite(total_docs)).toBe(true);
      expect(total_docs).toBe(0);

      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBe(0);
    });
  });
  describe('Without existing user', () => {
    test('should return 404', async () => {});
  });
});

describe('Create quiz', () => {
  describe('Without login', () => {
    test('should return 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Proper creation flow', () => {
    test('should return 200 on login', async () => {
      const log = await app.inject({
        method: 'PATCH',
        url: userEndpoints.loginUser,
        body: JSON.stringify(updatedSingleUser)
      });

      expect(log.statusCode).toBe(200); // Quick login check
      expect(log.headers).not.toBeNull();
      expect(log.headers.cookie).toBeDefined();
    });

    test('should return 201', async () => {
      // Login
      const log = await app.inject({
        method: 'PATCH',
        url: userEndpoints.loginUser,
        body: JSON.stringify(updatedSingleUser)
      });

      expect(log.headers).not.toBeNull();
      expect(log.headers.cookie).toBeDefined();

      let { cookie } = log.headers;

      // Create request
      let { singleQuiz } = data;
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: JSON.stringify(singleQuiz),
        cookies: cookie
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let body = JSON.parse(res.body);

      expect(body.three_words).toBeDefined();
      expect(body.three_words).not.toBeNull();

      expect(body.username.equals(updatedSingleUser.username)).toBe(true);
      expect(body.title.equals(singleQuiz.title)).toBe(true);
      expect(body.description.equals(singleQuiz.description)).toBe(true);
    });
  });
});

describe('Create impure quiz', () => {
  describe('Fake cookie', () => {
    test('should return 401', async () => {
      let { singleQuiz } = data;
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: JSON.stringify(singleQuiz),
        cookies: {
          _sessionId: 'dGhpc2lzbXlmYWtldXNlcm5hbWU='
        }
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Bypass username without login', () => {
    test('should return 401', async () => {
      let { quizWithUsernameBypass } = data;
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: JSON.stringify(quizWithUsernameBypass)
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Bypass username with login', () => {
    test('should return 403', async () => {
      const log = await app.inject({
        method: 'PATCH',
        url: userEndpoints.loginUser,
        body: JSON.stringify(updatedSingleUser)
      });

      expect(log.headers).not.toBeNull();
      expect(log.headers.cookie).toBeDefined();

      let { cookie } = log.headers;

      let { quizWithUsernameBypass } = data;
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: JSON.stringify(quizWithUsernameBypass),
        cookies: cookie
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeUndefined();
    });
  });
});

// beforeAll(() => {
//   return db.quiz.destroy({ truncate: { cascade: true } });
// });
