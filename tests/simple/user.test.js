/**
 * Simple unit tests for all /user API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app')).default();
// const db = require(join(__dirname, '..', '..', 'lib', 'orm'));

const { endpoints, data } = require(join(__dirname, '..', 'constants.js')).user;
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

      let body = JSON.parse(res.body);

      expect(body.total_docs).not.toBeNull();
      expect(body.total_docs).toBeDefined();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body.docs).not.toBeNull();
      expect(body.docs).toBeDefined();
      expect(Array.isArray(body.docs)).toBe(true);
    });

    test('should return 0 users', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllUsers
      });

      let body = JSON.parse(res.body);

      expect(body.total_docs).not.toBeNull();
      expect(body.total_docs).toBeDefined();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body.total_docs).toBe(0);

      expect(body.docs).not.toBeNull();
      expect(body.docs).toBeDefined();
      expect(Array.isArray(body.docs)).toBe(true);
      expect(body.docs.length).toBe(0);
    });
  });
});

describe('Pure user creation', () => {
  describe('Single user', () => {
    test('should return 201 with valid schema', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createNewUser,
        body: JSON.stringify(data.singleUser)
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();

      let body = JSON.parse(res.body);

      expect(body.username).toBeDefined(); // Username should be present
      expect(body.username).not.toBeNull();
      expect(body.username).toBe(data.createNewUser.username); // Same as request
      expect(body.password).toBeUndefined(); // Password should not be present
    });

    test('should return 403 on duplication', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createNewUser,
        body: JSON.stringify(data.singleUser)
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Multiple users', () => {
    test('should return 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createNewUser,
        body: JSON.stringify(data.multiUser)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Impure user creation', () => {
  describe('Without username', () => {
    test('should return 400 without body', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createNewUser,
        body: JSON.stringify(data.userWithoutUsername)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without email', () => {
    test('should return 400 without body', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createNewUser,
        body: JSON.stringify(data.userWithoutEmail)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without password', () => {
    test('should return 400 without body', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createNewUser,
        body: JSON.stringify(data.userWithoutPassword)
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

      let body = JSON.parse(res.body);

      expect(body.total_docs).not.toBeNull();
      expect(body.total_docs).toBeDefined();
      expect(Number.isFinite(body.total_docs)).toBe(true);
      expect(body.docs).not.toBeNull();
      expect(body.docs).toBeDefined();
      expect(Array.isArray(body.docs)).toBe(true);
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
        ({ username }) => username === data.singleUser.username
      );
      expect(userPresentInDocs).toBe(true);
    });
  });
});

describe('Update users', () => {
  describe('Single update', () => {
    test('should return 200 with change', async () => {
      let { updatedSingleUser } = data;
      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateUser + `/${updatedSingleUser.username}`,
        body: JSON.stringify(updatedSingleUser)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let body = JSON.parse(res.body);

      expect(body.display_name === updatedSingleUser.display_name);
    });
  });
  describe('Impure update', () => {});
  describe('Bulk update', () => {});
});

/*
beforeAll(() => {
  return db.user.destroy({ truncate: { cascade: true } });
});
*/
