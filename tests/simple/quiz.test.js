/**
 * Unit tests for all /quiz API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app'));
// const db = require(join(__dirname, '..', '..', 'lib', 'orm'));

const { endpoints, data } = require('../constants').quiz;
const {
  updatedFirstUser,
  secondUser,
  thirdUser,
  userWithoutEmail,
  endpoints: userEndpoints
} = require('../constants').user;

let THREE_WORDS, EMPTY_THREE_WORDS;

async function getLoginCookieFor(userObject) {
  const loginRes = await app.inject({
    method: 'PUT',
    url: userEndpoints.loginUser,
    body: JSON.stringify(userObject)
  });
  return loginRes?.headers?.cookie ?? null;
}

describe('Fetch quizzes', () => {
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
        url: endpoints.fetchAllQuizzes
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(Number.isFinite(total_docs)).toBe(true);
      expect(total_docs).toBe(0);
      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBe(0);
    });
  });

  describe('Quiz which does not exist', () => {
    test('should return 400', async () => {
      let randomQuizId = (Math.random() + 1).toString(36).substring(3);

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', randomQuizId)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
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

  describe('Happy path', () => {
    test('should return 201 with data in body', async () => {
      let { updatedFirstUser } = data;
      let tempCookie = await getLoginCookieFor(updatedFirstUser); // Login
      let { singleQuiz } = data;

      // Create request
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: JSON.stringify(singleQuiz),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let body = JSON.parse(res.body);

      expect(body.three_words).toBeDefined();
      expect(body.three_words).not.toBeNull();
      expect(body.username.equals(updatedFirstUser.username)).toBe(true);
      expect(body.title.equals(singleQuiz.title)).toBe(true);
      expect(body.description.equals(singleQuiz.description)).toBe(true);

      THREE_WORDS = body.three_words; // setting constant for further tests
    });

    test('should return 200 on post-create fetch', async () => {
      /**
       * Login is not necessary as it's a fetch call.
       * Create is not necessary as we have constant THREE_WORDS set
       */
      let { singleQuiz } = data;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let body = JSON.parse(res.body);

      expect(body.three_words).toBeDefined();
      expect(THREE_WORDS.equals(body.three_words)).toBe(true);
      expect(body.title).toBeDefined();
      expect(body.title).not.toBeNull();
      expect(singleQuiz.title.equals(body.title)).toBe(true);
    });

    test('should return data on fetch all', async () => {
      let { singleQuiz } = data;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuizzes
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBeGreaterThan(0);
      let quizIsInFetchData = docs.some(
        (doc) =>
          doc.title.equals(singleQuiz.title) &&
          doc.three_words.equals(THREE_WORDS)
      );
      expect(quizIsInFetchData).toBe(true);
    });
  });

  describe('Send empty data', () => {
    test('should return 201', async () => {
      let tempCookie = await getLoginCookieFor(secondUser);

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: JSON.stringify({}),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();

      let { three_words, title, start } = JSON.parse(res.body);

      expect(three_words).toBeDefined();
      expect(three_words).not.toBeNull();
      expect(title).toBeDefined();
      expect(title).not.toBeNull();
      expect(title.equals(three_words)).toBe(true);
      expect(new Date(start).valueOf()).toBeGreaterThan(
        new Date().valueOf() + 8.64e7
      ); // start time is after now + 24hrs
    });

    test('should return data on fetch', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', EMPTY_THREE_WORDS)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { three_words, title, start } = JSON.parse(res.body);

      expect(three_words).toBeDefined();
      expect(three_words).not.toBeNull();
      expect(title).toBeDefined();
      expect(title).not.toBeNull();
      expect(title.equals(three_words)).toBe(true);
      expect(new Date(start).valueOf()).toBeGreaterThan(
        new Date().valueOf() + 8.64e7
      ); // start time is now + 24hrs
    });

    test('should return data on fetch all', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuizzes
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { docs } = JSON.parse(res.body);

      let emptyQuizInDocs = docs.some((doc) =>
        doc.three_words.equals(EMPTY_THREE_WORDS)
      );
      expect(emptyQuizInDocs).toBe(true);
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
        body: JSON.stringify(updatedFirstUser)
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

describe('Update quiz', () => {
  describe('Without login', () => {
    test('should return 401', async () => {
      let { updatedSingleQuiz } = data;

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz,
        body: JSON.stringify(updatedSingleQuiz)
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('With login', () => {
    test('should return 200 with updated data', async () => {
      let { updatedSingleQuiz } = data;
      let tempCookie = await getLoginCookieFor(updatedFirstUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(updatedSingleQuiz),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let body = JSON.parse(res.body);

      expect(body.title.equals(updatedSingleQuiz.title)).toBe(true);
      expect(body.description.equals(updatedSingleQuiz.description)).toBe(true);
    });
  });

  describe('Change username of quiz', () => {
    test('should return 401 irrespective of login', async () => {
      let { quizWithUsernameBypass } = data;
      let tempCookie = await getLoginCookieFor(updatedFirstUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(quizWithUsernameBypass),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Move state', () => {
    test('should return 200 with updated data', async () => {
      let { quizWithStateChange } = data;
      let tempCookie = await getLoginCookieFor(updatedFirstUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(quizWithStateChange),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { status } = JSON.parse(res.body);

      expect(status === quizWithStateChange.status).toBe(true);
    });

    test('should return modified data on post-update fetch', async () => {
      let { quizWithStateChange } = data;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { status } = JSON.parse(res.body);

      expect(status === quizWithStateChange.status).toBe(true);
    });
  });

  describe('Change three_words of quiz', () => {
    test('should return 200 with old three_words', async () => {
      let { quizWithThreeWordChange } = data;
      let tempCookie = await getLoginCookieFor(updatedFirstUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(quizWithThreeWordChange),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { three_words } = JSON.parse(res.body);

      expect(three_words.equals(quizWithThreeWordChange.three_words)).toBe(
        false
      );
      expect(three_words.equals(THREE_WORDS)).toBe(true);
    });

    test('should return 400 on post-update fetch', async () => {
      let { quizWithThreeWordChange } = data;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace(
          '{threeWords}',
          quizWithThreeWordChange.three_words
        )
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });

    test('should not return data with changed three_words', async () => {
      let { quizWithThreeWordChange } = data;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuizzes
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { docs } = JSON.parse(res.body);

      let modified3wrdInFetchData = docs.some((doc) =>
        doc.three_words.equals(quizWithThreeWordChange.three_words)
      );
      expect(modified3wrdInFetchData).toBe(false);
      let threeWordRemainedUnchanged = docs.some((doc) =>
        doc.three_words.equals(THREE_WORDS)
      );
      expect(threeWordRemainedUnchanged).toBe(true);
    });
  });

  describe('Send empty data', () => {
    test('should return 400', async () => {
      let tempCookie = await getLoginCookieFor(secondUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', EMPTY_THREE_WORDS),
        body: JSON.stringify({}),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Delete quiz', () => {
  describe('Without login', () => {
    test('should return 401', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('With array of three_words', () => {
    test('should return 400', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz,
        body: JSON.stringify([THREE_WORDS, EMPTY_THREE_WORDS])
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('With array of objects', () => {
    test('should return 400', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz,
        body: JSON.stringify([
          { three_words: THREE_WORDS },
          { three_words: EMPTY_THREE_WORDS }
        ])
      });

      expect(res.statusCode).toBe();
      expect(res.body).toBeUndefined();
    });
  });

  describe('With login for different user quiz', () => {
    test('should return 401', async () => {
      let tempCookie = await getLoginCookieFor(secondUser);

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz.replace('{threeWords}', THREE_WORDS),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Happy path', () => {
    test('should return 204', async () => {
      let tempCookie = await getLoginCookieFor(updatedFirstUser);

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz.replace('{threeWords}', THREE_WORDS),
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(204);
      expect(res.body).toBeUndefined();
    });

    test('should return 400 on post-delete fetch', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });

    test('should not return data on fetch all', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { docs } = JSON.parse(res.body);

      let deletedDocInFetchData = docs.some((doc) =>
        doc.three_words.equals(THREE_WORDS)
      );
      expect(deletedDocInFetchData).toBe(false);
    });
  });
});

describe('Fetch by username', () => {
  describe('Non-existant user', () => {
    test('should return 404', async () => {
      let { username } = userWithoutEmail; // This user will never be created
      let url = endpoints.fetchByUser.replace('{username}', username);

      const res = await app.inject({ method: 'GET', url });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Existing user without any quiz', () => {
    test('should return 200', async () => {
      let { username } = thirdUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchByUser.replace('{username}', username)
      });

      expect(res.statusCode).toBe(200);
    });

    test('should return data valid to schema', async () => {
      let { username } = thirdUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchByUser.replace('{username}', username)
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

    test('should return 0 docs', async () => {
      let { username } = thirdUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchByUser.replace('{username}', username)
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBe(0);
      expect(docs.length).toBe(0);
    });
  });

  describe('Existing user with quizzes', () => {
    test('should return 200', async () => {
      let { username } = updatedFirstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchByUser.replace('{username}', username)
      });

      expect(res.statusCode).toBe(200);
    });

    test('should return data valid to schema', async () => {
      let { username } = updatedFirstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchByUser.replace('{username}', username)
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

    test('should return more than 0 docs', async () => {
      let { username } = updatedFirstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchByUser.replace('{username}', username)
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBeGreaterThan(0);
      expect(docs.length).toBeGreaterThan(0);
    });

    test('should return quiz data', async () => {
      let { username } = updatedFirstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchByUser.replace('{username}', username)
      });

      let { docs } = JSON.parse(res.body);

      let quizIsInFetchData = docs.some(
        (doc) =>
          doc.username.equals(username) && doc.three_words.equals(THREE_WORDS)
      );
      expect(quizIsInFetchData).toBe(true);
    });
  });
});

/*
test('', async() => { const res = await app.inject({ method: , url: }); });

url = url.replace(
  '{date}', new Date().toISOString()
  .slice(0,10).split('-')
  .reverse().join('-')
);
beforeAll(() => {
  return db.quiz.destroy({ truncate: { cascade: true } });
});
*/
