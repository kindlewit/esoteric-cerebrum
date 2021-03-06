const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app')).default;

describe('Health checks', () => {
  test('should return 200 with body', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).not.toBeNull();

    let { healthy } = JSON.parse(res.body);

    expect(healthy).toBeDefined();
    expect(healthy).not.toBeNull();
    expect(healthy).toBe(true);
  });
});
