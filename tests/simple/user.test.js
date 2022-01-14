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

describe('Fetch users: before creation', () => {
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

describe('Pure user creation', () => {
  describe('Single user', () => {
    test('should return 201 with valid schema', async () => {
      let { firstUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: firstUser
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();

      let body = JSON.parse(res.body);

      expect(body.username).toBeDefined(); // Username should be present
      expect(body.username).not.toBeNull();
      expect(body.username === firstUser.username).toBe(true); // Same as request
      expect(body.password).toBeUndefined(); // Password should not be present
    });

    test('should return 403 on duplication', async () => {
      let { firstUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: firstUser
      });

      expect(res.statusCode).toBe(403);
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
      expect(body.username === username).toBe(true);
      expect(body.password).toBeUndefined();
    });
  });
});

describe('Impure user creation', () => {
  describe('Multiple users', () => {
    test('should return 400', async () => {
      let { multiUser } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: multiUser
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Without username', () => {
    test('should return 400 without body', async () => {
      let { userWithoutUsername } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: userWithoutUsername
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Without email', () => {
    test('should return 400 without body', async () => {
      let { userWithoutEmail } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: userWithoutEmail
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Without password', () => {
    test('should return 400 without body', async () => {
      let { userWithoutPassword } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createUser,
        body: userWithoutPassword
      });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('Fetch users: after creation', () => {
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

    let userPresentInDocs = docs.some(
      ({ username }) => data.firstUser.username === username
    );
    expect(userPresentInDocs).toBe(true);
  });
});

describe('Login user', () => {
  describe('With empty request', () => {
    test('should return 400', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: {}
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('With non-existant user', () => {
    test('should return 404 on non-existant user', async () => {
      let { userWithoutEmail } = data;

      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: userWithoutEmail
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('With wrong credentials', () => {
    test('should return 401 on wrong credentials', async () => {
      let { username } = data.firstUser;

      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: { username, password: 'ABC!@' }
      });

      expect(res.statusCode).toBe(401);
    });
  });
  describe('Happy path', () => {
    test('should return 200', async () => {
      let { firstUser } = data;

      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: firstUser
      });

      expect(res.statusCode).toBe(200);
    });

    test('should return valid cookie on login', async () => {
      let { firstUser } = data;

      const res = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: firstUser
      });

      expect(res.cookies).toBeDefined();
      expect(res.cookies).not.toBeNull();
      expect(Array.isArray(res.cookies)).toBe(true);
      expect(res.cookies.length).toBeGreaterThan(0);
      expect(res.cookies[0].name === '_sessionId').toBe(true);
      expect(res.cookies[0].value).toBeDefined();
      expect(res.cookies[0].value).not.toBeNull();
    });
  });
});

describe('Update users', () => {
  describe('Username change', () => {
    test('should return 403', async () => {
      let { firstUser, userWithChangedUsername } = data;

      const login = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: firstUser
      });
      let cookies = login.cookies?.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {});

      let url = endpoints.updateUser.replace('{username}', firstUser.username);
      const res = await app.inject({
        method: 'PATCH',
        url,
        body: userWithChangedUsername,
        cookies
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Bulk update', () => {
    test('should return 404', async () => {
      let { multiUser, updatedFirstUser } = data;

      const login = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: updatedFirstUser
      });
      let cookies = login.cookies?.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {});

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateMultipleUser,
        body: multiUser,
        cookies
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Single update', () => {
    test('should return 200 with changes', async () => {
      let { updatedFirstUser, firstUser } = data;
      // Login as existing user
      const login = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: firstUser
      });
      let cookies = login.cookies?.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {});
      let url = endpoints.updateUser.replace('{username}', firstUser.username);
      const res = await app.inject({
        method: 'PATCH',
        url,
        body: updatedFirstUser,
        cookies
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let body = JSON.parse(res.body);

      expect(body.display_name === updatedFirstUser.display_name).toBe(true);
      expect(body).not.toHaveProperty('password');
      expect(body.password).toBeUndefined();
    });

    test('should have changes in post-update fetch', async () => {
      let { updatedFirstUser, firstUser } = data;
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneUser.replace('{username}', firstUser.username)
      });

      expect(res.statusCode).toBe(200);

      let body = JSON.parse(res.body);

      expect(body.display_name === updatedFirstUser.display_name).toBe(true);
      expect(body).not.toHaveProperty('password');
      expect(body.password).toBeUndefined();
    });

    test('should return 200 on post-update login', async () => {
      let { firstUser, updatedFirstUser } = data;
      const login = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: {
          username: firstUser.username,
          password: updatedFirstUser.password
        }
      });

      expect(login.statusCode).toBe(200);

      let cookies = login.cookies?.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {});

      expect(cookies === {}).toBe(false);
      expect(cookies._sessionId).toBeDefined();
      expect(cookies._sessionId).not.toBeNull();
    });
  });
});

describe('Delete users', () => {
  describe('Without login', () => {
    test('should return 401', async () => {
      let { firstUser } = data;
      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteUser.replace('{username}', firstUser.username)
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Single User', () => {
    test('should return 204', async () => {
      let { firstUser, updatedFirstUser } = data;
      const login = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: {
          username: firstUser.username,
          password: updatedFirstUser.password
        }
      });
      let cookies = login.cookies?.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {});

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteUser.replace('{username}', firstUser.username),
        cookies
      });

      expect(res.statusCode).toBe(204);
    });

    test('should return 401 on retry', async () => {
      let { firstUser, updatedFirstUser } = data;
      const login = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: {
          username: firstUser.username,
          password: updatedFirstUser.password
        }
      });

      let cookies = login.cookies?.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {});

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteUser.replace('{username}', firstUser.username),
        cookies
      });

      expect(res.statusCode).toBe(401);
    });

    test('should return 404 on post-delete fetch', async () => {
      let { username } = data.updatedFirstUser;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneUser.replace('{username}', username)
      });

      expect(res.statusCode).toBe(404);
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

      let userInFetchedDocs = docs.some((doc) => doc.username === username);
      expect(userInFetchedDocs).toBe(false);
    });

    test('should return 404 on post-delete login', async () => {
      let { firstUser, updatedFirstUser } = data;
      const login = await app.inject({
        method: 'PUT',
        url: endpoints.loginUser,
        body: {
          username: firstUser.username,
          password: updatedFirstUser.password
        }
      });

      expect(login.statusCode).toBe(404);
      expect(login.cookies.length).toBe(0);
    });
  });

  describe('Multiple users', () => {
    test('should return 404', async () => {
      let { multiUser } = data;

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteMultipleUser,
        body: multiUser
      });

      expect(res.statusCode).toBe(404);
    });
  });
});
