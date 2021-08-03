import app from '../../lib/app';
import db from '../../lib/orm';
import { singleUser } from '../data/user-data';

beforeAll(() => {
  return db.user.destroy({ truncate: { cascade: true } });
});

test("Success response even without any users", async function () {
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/user'
  });
  expect(res.statusCode).toBe(200);
  expect(res.body).not.toBeNull();
  expect(res.body).toBeDefined();

  let body = JSON.parse(res.body);

  expect(body.total_docs).not.toBeNull();
  expect(body.total_docs).toBeDefined();
  expect(Number.isFinite(body.total_docs)).toBe(true);
  expect(body.docs).not.toBeNull();
  expect(body.docs).toBeDefined();
  expect(Array.isArray(body.docs)).toBe(true);
});

test("Create new user", async function () {
  const res = await app.inject({
    method: 'POST',
    url:'/api/v1/user',
    body: singleUser
  });
  expect(res.statusCode).toBe(201);
  expect(res.body).not.toBeNull();
  expect(res.body).toBeDefined();

  // let body = JSON.parse(res.body);
});
