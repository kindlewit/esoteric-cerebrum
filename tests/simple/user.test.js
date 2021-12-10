/**
 * Unit tests for all /user API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app')).default();
// const db = require(join(__dirname, '..', '..', 'lib', 'orm'));

const { endpoints, data, cookieId } = require(join(
  __dirname,
  '..',
  'constants.js'
)).user;
const COOKIES = {};

describe('Fetch users', () => {
  describe('Before creation', () => {
    test('should return 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllUsers
      });

      expect(res.statusCode).toBe(200);
    });

    test('should have defined response body according to schema', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllUsers
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
        url: endpoints.fetchAllUsers
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
        url: endpoints.createUser,
        body: JSON.stringify(firstUser)
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();

      let body = JSON.parse(res.body);

      expect(body.username).toBeDefined(); // Username should be present
      expect(body.username).not.toBeNull();
      expect(body.username.equals(firstUser.username)).toBe(true); // Same as request
      expect(body.password).toBeUndefined(); // Password should not be present
    });

    test('should return 403 on duplication', async () => {
      let { firstUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: JSON.stringify(firstUser)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeUndefined();
    });

    test('should return 200 & user on post-create fetch', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneUser.replace('{username}', username)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let body = JSON.parse(res.body);

      expect(body.username).toBeDefined();
      expect(body.username).not.toBeNull();
      expect(body.username.equals(username)).toBe(true);
      expect(body.password).toBeUndefined();
    });
  });

  describe('Multiple users', () => {
    test('should return 400', async () => {
      let { multiUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: JSON.stringify(multiUser)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Impure user creation', () => {
  describe('Without username', () => {
    test('should return 400 without body', async () => {
      let { userWithoutUsername } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
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
        url: endpoints.createUser,
        body: JSON.stringify(userWithoutEmail)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without password', () => {
    test('should return 400 without body', async () => {
      let { userWithoutPassword } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: JSON.stringify(userWithoutPassword)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Fetch users', () => {
  describe('After creation', () => {
    test('should return 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllUsers
      });

      expect(res.statusCode).toBe(200);
    });

    test('should have defined response body according to schema', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllUsers
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
        url: endpoints.fetchAllUsers
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
        url: endpoints.fetchAllUsers
      });

      let body = JSON.parse(res.body);
      let { docs } = body;

      let userPresentInDocs = docs.some(({ username }) =>
        data.firstUser.username.equals(username)
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
        url: endpoints.updateUser.replace(
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
        url: endpoints.updateUser.replace('{username}', firstUser.username),
        body: JSON.stringify(userWithChangedUsername)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Bulk update', () => {
    test('should return 403', async () => {
      let { multiUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.updateMultipleUser,
        body: JSON.stringify(multiUser)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Login user', () => {
  test('should return 400 on empty request', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: endpoints.loginUser,
      body: JSON.stringify({})
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBeUndefined();
  });

  test('should return 404 on non-existant user', async () => {
    let { userWithoutEmail } = data;

    const res = await app.inject({
      method: 'PUT',
      url: endpoints.loginUser,
      body: JSON.stringify(userWithoutEmail)
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toBeUndefined();
  });

  test('should return 401 on wrong credentials', async () => {
    let { firstUser } = data;

    const res = await app.inject({
      method: 'PUT',
      url: endpoints.loginUser,
      body: JSON.stringify(firstUser)
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toBeUndefined();
  });

  test('should return 200 on proper login', async () => {
    let { username, password } = data.updatedFirstUser;

    const res = await app.inject({
      method: 'PUT',
      url: endpoints.loginUser,
      body: JSON.stringify({ username, password })
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeUndefined();
  });

  test('should return valid cookie on login', async () => {
    let { username, password } = data.updatedFirstUser;

    const res = await app.inject({
      method: 'PUT',
      url: endpoints.loginUser,
      body: JSON.stringify({ username, password })
    });

    let cookie = res.getHeader(cookieId);

    expect(cookie).toBeDefined();
    expect(cookie).not.toBeNull();
  });
});

describe('Delete users', () => {
  describe('Single User', () => {
    test('should return 204', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteUser.replace('{username}', username)
      });

      expect(res.statusCode).toBe(204);
      expect(res.body).toBeUndefined();
    });

    test('should return 400 on retry', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteUser.replace('{username}', username)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });

    test('should return 400 on post-delete fetch', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneUser.replace('{username}', username)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });

    test('should not have user in post-delete fetch', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllUsers
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { docs } = JSON.parse(res.body);

      let userInFetchedDocs = docs.some((doc) => doc.username.equals(username));
      expect(userInFetchedDocs).toBe(false);
    });
  });

  describe('Multiple users', () => {
    test('should return 403', async () => {
      let { multiUser } = data;

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteMultipleUser,
        body: JSON.stringify(multiUser)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeUndefined();
    });
  });
});

/*
beforeAll(() => {
  return db.user.destroy({ truncate: { cascade: true } });
});
*/
