/**
 * Unit tests for all /user API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app')).default;
const db = require(join(__dirname, '..', '..', 'lib', 'orm')).default;

const { endpoints, data } = require(join(__dirname, '..', 'constants.js')).user;

beforeAll(async () => {
  await db.user.destroy({
    truncate: true,
    cascade: true
  });
});

describe('Fetch users', () => {
  describe('Before creation', () => {
    test('should return 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });

      expect(res.statusCode).toBe(200);
    });

    test('should have defined response body according to schema', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBeDefined();
      expect(total_docs).not.toBeNull();
      expect(Number.isFinite(total_docs)).toBe(true);
      expect(docs).not.toBeNull();
      expect(docs).toBeDefined();
      expect(Array.isArray(docs)).toBe(true);
    });

    test('should return 0 users', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBeDefined();
      expect(total_docs).not.toBeNull();
      expect(Number.isFinite(total_docs)).toBe(true);
      expect(total_docs).toBe(0);
      expect(docs).not.toBeNull();
      expect(docs).toBeDefined();
      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBe(0);
    });
  });
});

describe('Pure user creation', () => {
  describe('Single user', () => {
    test('should return 201 with valid schema', async () => {
      let { firstUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.genericUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(firstUser)
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();

      let body = JSON.parse(res.body);

      expect(body.username).toBeDefined(); // Username should be present
      expect(body.username).not.toBeNull();
      expect(body.username).toEqual(firstUser.username); // Same as request
      expect(body.password).toBeUndefined(); // Password should not be present
    });

    test('should return 403 on duplication', async () => {
      let { firstUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.genericUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(firstUser)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeNull();
    });

    test('should return 200 & user on post-create fetch', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{username}', username),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let body = JSON.parse(res.body);

      expect(body.username).toBeDefined();
      expect(body.username).not.toBeNull();
      expect(body.username).toEqual(username);
      expect(body.password).toBeUndefined();
    });
  });

  describe('Multiple users', () => {
    test('should return 400', async () => {
      let { multiUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.genericUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(multiUser)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeNull();
    });
  });
});

describe('Impure user creation', () => {
  describe('Without username', () => {
    test('should return 400 without body', async () => {
      let { userWithoutUsername } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.genericUrl,
        body: JSON.stringify(userWithoutUsername)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without email', () => {
    test('should return 400 without body', async () => {
      let { userWithoutEmail } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.genericUrl,
        body: JSON.stringify(userWithoutEmail)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeNull();
    });
  });

  describe('Without password', () => {
    test('should return 400 without body', async () => {
      let { userWithoutPassword } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.genericUrl,
        body: JSON.stringify(userWithoutPassword)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeNull();
    });
  });
});

describe('Fetch users', () => {
  describe('After creation', () => {
    test('should return 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });

      expect(res.statusCode).toBe(200);
    });

    test('should have defined response body according to schema', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBeDefined();
      expect(total_docs).not.toBeNull();
      expect(Number.isFinite(total_docs)).toBe(true);
      expect(docs).toBeDefined();
      expect(docs).not.toBeNull();
      expect(Array.isArray(docs)).toBe(true);
    });

    test('should have atleast 1 user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });

      let body = JSON.parse(res.body);
      let { docs } = body;

      expect(docs[0]).toBeDefined();
      expect(docs[0]).not.toBeNull();
      expect(docs[0] instanceof Object).toBe(true);
      expect(docs[0].username).toBeDefined();
      expect(docs[0].username).not.toBeNull();
    });

    test('should have created username', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });

      let body = JSON.parse(res.body);
      let { docs } = body;

      let userPresentInDocs = docs.some(
        ({ username }) => data.firstUser.username === username
      );
      expect(userPresentInDocs).toBe(true);
    });
  });
});

describe('Update users', () => {
  describe('Single update', () => {
    test('should return 200 with change', async () => {
      let { updatedFirstUser } = data;

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace(
          '{username}',
          updatedFirstUser.username
        ),
        body: JSON.stringify(updatedFirstUser)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let body = JSON.parse(res.body);

      expect(body.display_name === updatedFirstUser.display_name);
    });
  });

  describe('Username change', () => {
    test('should return 403', async () => {
      let { firstUser, userWithChangedUsername } = data;

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{username}', firstUser.username),
        body: JSON.stringify(userWithChangedUsername)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeNull();
    });
  });

  describe('Bulk update', () => {
    test('should return 403', async () => {
      let { multiUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.genericUrl,
        body: JSON.stringify(multiUser)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeNull();
    });
  });
});

describe('Login user', () => {
  describe('With empty request', () => {
    test('should return 400', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUrl,
        body: JSON.stringify({})
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeNull();
    });
  });

  describe('With non-existant user', () => {
    test('should return 404 on non-existant user', async () => {
      let { userWithoutEmail } = data;

      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUrl,
        body: JSON.stringify(userWithoutEmail)
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeNull();
    });
  });

  describe('With wrong credentials', () => {
    test('should return 401 on wrong credentials', async () => {
      let { firstUser } = data;

      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUrl,
        body: JSON.stringify(firstUser)
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeNull();
    });
  });
  describe('Happy path', () => {
    test('should return 200', async () => {
      let { username, password } = data.updatedFirstUser;

      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUrl,
        body: JSON.stringify({ username, password })
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeNull();
    });

    test('should return valid cookie on login', async () => {
      let { username, password } = data.updatedFirstUser;

      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUrl,
        body: JSON.stringify({ username, password })
      });

      let cookie = res?.headers?.cookie;

      expect(cookie).toBeDefined();
      expect(cookie).not.toBeNull();
    });
  });
});

describe('Delete users', () => {
  describe('Single User', () => {
    test('should return 204', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.specificUrl.replace('{username}', username)
      });

      expect(res.statusCode).toBe(204);
      expect(res.body).toBeNull();
    });

    test('should return 400 on retry', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.specificUrl.replace('{username}', username)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeNull();
    });

    test('should return 400 on post-delete fetch', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{username}', username)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeNull();
    });

    test('should not have user in post-delete fetch', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { docs } = JSON.parse(res.body);

      let userInFetchedDocs = docs.some((doc) => doc.username === username);
      expect(userInFetchedDocs).toBe(false);
    });
  });

  describe('Multiple users', () => {
    test('should return 403', async () => {
      let { multiUser } = data;

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.genericUrl,
        body: JSON.stringify(multiUser)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeNull();
    });
  });
});
