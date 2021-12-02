/**
 * Simple unit tests for all /user API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app'));
const db = require(join(__dirname, '..', '..', 'lib', 'orm'));

const { endpoints, data } = require(join(__dirname, '..', 'constants.js')).user;

describe('Fetch users before creation', () => {
  test('should return 200 without any users', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoints.fetchAllUsers
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).to.toBeNull();
    expect(res.body).toBeDefined();

    let body = JSON.parse(res.body);

    expect(body.total_docs).not.toBeNull();
    expect(body.total_docs).toBeDefined();
    expect(Number.isFinite(body.total_docs)).toBe(true);
    expect(body.docs).not.toBeNull();
    expect(body.docs).toBeDefined();
    expect(Array.isArray(body.docs)).toBe(true);
  });
});

describe('Create user', () => {
  test('should return 0 users before', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoints.fetchAllUsers
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();

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

  test('should return 201', async () => {
    const res = await app.inject({
      method: 'POST',
      url: endpoints.createNewUser,
      body: JSON.stringify(data.singleUser)
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toBeDefined();

    let body = JSON.parse(res.body);

    expect(body.username).not.toBeNull();
    expect(body.username).toBe(data.createNewUser.username);
    expect(body.password).toBeUndefined();
  });
});

describe('Fetch users after creation', () => {
  test('should return at least 1 user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoints.fetchAllUsers
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).to.toBeNull();
    expect(res.body).toBeDefined();

    let body = JSON.parse(res.body);

    expect(body.total_docs).not.toBeNull();
    expect(body.total_docs).toBeDefined();
    expect(Number.isFinite(body.total_docs)).toBe(true);
    expect(body.docs).not.toBeNull();
    expect(body.docs).toBeDefined();
    expect(Array.isArray(body.docs)).toBe(true);

    let { docs } = body;
    expect(docs[0]).toBeDefined();
    expect(docs[0]).not.toBeNull();
    expect(docs[0] instanceof Object).toBe(true);
    expect(docs[0].username).toBeDefined();
    expect(docs[0].username).not.toBeNull();
  });
});

/*
beforeAll(() => {
  return db.user.destroy({ truncate: { cascade: true } });
});
*/
