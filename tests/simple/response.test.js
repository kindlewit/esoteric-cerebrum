/**
 * Unit tests for all /response API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app')).default;

describe('Fetch response before creation', () => {
  describe('Through quiz', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.quizUrl.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Through username', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.userUrl.replace('{username}', USERNAME)
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Fetch cache response', () => {
  describe('Without login');
  describe('With login');
  describe('Multiple calls');
});

describe('Create cache response', () => {
  describe('Without login');
  describe('With login');
  describe('Multiple calls');
  describe('Empty data');
});

describe('Create response', () => {
  describe('Without login');
  describe('With login');
  describe('Multiple calls');
  describe('Empty data');
});

describe('Update response', () => {
  describe('Without login');
  describe('With login');
  describe('Empty data');
});

describe('Fetch response');
describe('Delete response');
