/**
 * Unit tests for search API endpoints
 */

const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app')).default;
const { endpoint, data } = require('../constants.js').search;
const { data: userData, endpoints: userEndpoints } = require('../constants.js').user;
const { data: quizData, endpoints: quizEndpoints } = require('../constants.js').quiz;

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
  let cookies = await getLoginCookieFor(user);
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

let THREE_WORDS, USERNAME;

beforeAll(async () => {
  await createUserFor(userData.firstUser);
  USERNAME = userData.firstUser.username;
  THREE_WORDS = await createQuizFor(quizData.singleQuiz, userData.firstUser);
});

describe('Invalid method requests', () => {
  describe('POST method', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoint
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('PATCH method', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: endpoint
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('PUT method', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: endpoint
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('DELETE method', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: endpoint
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('OPTIONS method', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'OPTIONS',
        url: endpoint
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('GET requests', () => {
  describe('Search by: three_words', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoint + `?term=${THREE_WORDS}`
    });
    test('should return 200', () => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });

    test('should return valid body', () => {
      let body = JSON.parse(res.body);

      expect(body).toHaveProperty('total_docs');
      expect(body.total_docs).not.toBeNull();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body).toHaveProperty('docs');
      expect(body.docs).not.toBeNull();
      expect(Array.isArray(body.docs)).toBe(true);
    });

    test('should return data in search', () => {
      let { docs } = JSON.parse(res.body);

      let dataInSearchResult = docs.some((doc) =>
        doc.three_words.equals(THREE_WORDS)
      );
      expect(dataInSearchResult).toBe(true);
    });
  });

  describe('Search by: title', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoint + `?term=${data.titleToSearch}`
    });
    test('should return 200', () => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });

    test('should return valid body', () => {
      let body = JSON.parse(res.body);

      expect(body).toHaveProperty('total_docs');
      expect(body.total_docs).not.toBeNull();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body).toHaveProperty('docs');
      expect(body.docs).not.toBeNull();
      expect(Array.isArray(body.docs)).toBe(true);
    });

    test('should return data in search', () => {
      let { docs } = JSON.parse(res.body);

      let dataInSearchResult = docs.some((doc) =>
        doc.title.equals(data.titleToSearch)
      );
      expect(dataInSearchResult).toBe(true);
    });
  });

  describe('Search by: date', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoint + `?term=${data.dateToSearch}`
    });
    test('should return 200', () => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });

    test('should return valid body', () => {
      let body = JSON.parse(res.body);

      expect(body).toHaveProperty('total_docs');
      expect(body.total_docs).not.toBeNull();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body).toHaveProperty('docs');
      expect(body.docs).not.toBeNull();
      expect(Array.isArray(body.docs)).toBe(true);
    });

    test('should return data in search', () => {
      let { docs } = JSON.parse(res.body);

      let dataInSearchResult = docs.some((doc) =>
        new Date(doc.start)
          .toISOString()
          .slice(0, 10)
          .equals(data.dateToSearch)
      );
      expect(dataInSearchResult).toBe(true);
    });
  });

  describe('Search by: ISO date', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoint + `?term=${data.isoDateToSearch}`
    });
    test('should return 200', () => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });

    test('should return valid body', () => {
      let body = JSON.parse(res.body);

      expect(body).toHaveProperty('total_docs');
      expect(body.total_docs).not.toBeNull();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body).toHaveProperty('docs');
      expect(body.docs).not.toBeNull();
      expect(Array.isArray(body.docs)).toBe(true);
    });

    test('should return data in search', () => {
      let { docs } = JSON.parse(res.body);

      let dataInSearchResult = docs.some((doc) =>
        new Date(doc.start).toISOString().equals(data.isoDateToSearch)
      );
      expect(dataInSearchResult).toBe(true);
    });
  });

  describe('Search by: topic', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoint + `?term=${data.topicToSearch}`
    });
    test('should return 200', () => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });

    test('should return valid body', () => {
      let body = JSON.parse(res.body);

      expect(body).toHaveProperty('total_docs');
      expect(body.total_docs).not.toBeNull();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body).toHaveProperty('docs');
      expect(body.docs).not.toBeNull();
      expect(Array.isArray(body.docs)).toBe(true);
    });

    test('should return data in search', () => {
      let { docs } = JSON.parse(res.body);

      let dataInSearchResult = docs.some((doc) =>
        doc.topics.includes(data.topicToSearch)
      );
      expect(dataInSearchResult).toBe(true);
    });
  });

  describe('Search by: username', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoint + `?term=${USERNAME}`
    });
    test('should return 200', () => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });

    test('should return valid body', () => {
      let body = JSON.parse(res.body);

      expect(body).toHaveProperty('total_docs');
      expect(body.total_docs).not.toBeNull();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body).toHaveProperty('docs');
      expect(body.docs).not.toBeNull();
      expect(Array.isArray(body.docs)).toBe(true);
    });

    test('should return data in search', () => {
      let { docs } = JSON.parse(res.body);

      let dataInSearchResult = docs.some((doc) =>
        doc.username.equals(USERNAME)
      );
      expect(dataInSearchResult).toBe(true);
    });
  });
});
