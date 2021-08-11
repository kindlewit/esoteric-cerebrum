/**
 * Unit tests for all /quiz API endpoints
 */
const app = require('../../lib/app');
const db = require('../../lib/orm');
const { singleQuiz } = require('../data/quiz-data');
const { singleUser } = require('../data/user-data');

beforeAll(() => {
  return db.quiz.destroy({ truncate: { cascade: true } });
});

test('Create Quiz without loing', async function () {
  const res = await app.inject({
    method:'POST',
    url: '/api/v1/quiz',
    body: singleQuiz
  });

});

test('Create Quiz with login', async function () {
  // Login the user
  let { username, password } = singleUser;
  await app.inject({
    method: 'PUT',
    url:`/api/v1/user/${username}/_login`,
    body: { password }
  });
  // Create Quiz record
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/quiz',
    body: singleQuiz
  });
  // Compulsory checks
  expect(res.statusCode).toBe(201);
  expect(res.body).not.toBeNull();

  let body = await JSON.parse(res.body);

  expect(body.three_words).not.toBeNull();
  expect(body.username).not.toBeNull();
});

test("List all quizzes", async function () {
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/quiz'
  });
  // Compulsory checks
  expect(res.statusCode).toBe(200);
  expect(res.body).not.toBeNull();

  let body = JSON.parse(res.body);

  expect(body.docs).not.toBeNull();
});
