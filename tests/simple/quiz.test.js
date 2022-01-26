/**
 * Unit tests for all /quiz API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app')).default;
const db = require(join(__dirname, '..', '..', 'lib', 'orm')).default;
const redis = require(join(
  __dirname,
  '..',
  '..',
  'lib',
  'utils',
  'cache-utils'
));

const { endpoints, data } = require('../constants').quiz;
const { data: userData, endpoints: userEndpoints } =
  require('../constants').user;

let THREE_WORDS, EMPTY_THREE_WORDS;

async function getLoginCookieFor(userObject) {
  const login = await app.inject({
    method: 'PUT',
    url: userEndpoints.loginUser,
    body: userObject
  });
  return login?.cookies?.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {});
}

beforeAll(async () => {
  await db.quiz.destroy({
    truncate: true,
    cascade: true
  });
  await db.user.destroy({
    truncate: true,
    cascade: true
  });
  // Creating 1 test user
  await app.inject({
    url: '/api/v1/user',
    method: 'POST',
    body: userData.firstUser
  });
});

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
    test('should return 404', async () => {
      let randomQuizId = (Math.random() + 1).toString(36).substring(3);

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', randomQuizId)
      });

      expect(res.statusCode).toBe(404);
    });
  });
});

describe('Create quiz', () => {
  describe('Without login', () => {
    test('should return 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: {}
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Happy path', () => {
    test('should return 201 with data in body', async () => {
      let cookies = await getLoginCookieFor(userData.firstUser); // Login
      let { singleQuiz } = data;
      // Create request
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: singleQuiz,
        cookies
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let body = JSON.parse(res.body);

      expect(body.three_words).toBeDefined();
      expect(body.three_words).not.toBeNull();

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
      expect(body.three_words === THREE_WORDS).toBe(true);
      expect(body).toHaveProperty('title');
      expect(body.title).not.toBeNull();
      expect(body.title === singleQuiz.title).toBe(true);
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
          doc.title === singleQuiz.title && doc.three_words === THREE_WORDS
      );
      expect(quizIsInFetchData).toBe(true);
    });
  });

  describe('Send empty data', () => {
    // Sending empty data is also part of happy path :)
    test('should return 201', async () => {
      // Create second user
      await app.inject({
        method: 'POST',
        url: userEndpoints.createUser,
        body: userData.secondUser
      });
      let cookies = await getLoginCookieFor(userData.secondUser);

      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body: {},
        cookies
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();

      let { three_words, title, start } = JSON.parse(res.body);

      expect(three_words).toBeDefined();
      expect(three_words).not.toBeNull();
      expect(title).toBeDefined();
      expect(title).not.toBeNull();
      expect(title === three_words).toBe(true);
      expect(new Date(start).valueOf()).toBeGreaterThan(
        new Date().valueOf() + 8.64e7
      ); // start time is after now + 24hrs

      EMPTY_THREE_WORDS = three_words;
    });

    test('should return data on post-create fetch', async () => {
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
      expect(title === three_words).toBe(true);
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

      let emptyQuizInDocs = docs.some(
        (doc) => doc.three_words === EMPTY_THREE_WORDS
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
        body: singleQuiz,
        cookies: {
          _sessionId: 'dGhpc2lzbXlmYWtldXNlcm5hbWU='
        }
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Bypass username without login', () => {
    test('should return 401', async () => {
      // Passing username attribute within request body
      let { singleQuiz, quizWithUsernameBypass } = data;
      let body = Object.assign({}, singleQuiz, quizWithUsernameBypass);
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Bypass username with login', () => {
    test('should return 403', async () => {
      // Passing username attribute within request body
      let { singleQuiz, quizWithUsernameBypass } = data;
      let body = Object.assign({}, singleQuiz, quizWithUsernameBypass);
      let cookies = await getLoginCookieFor(userData.firstUser);
      const res = await app.inject({
        method: 'POST',
        url: endpoints.createQuiz,
        body,
        cookies
      });

      expect(res.statusCode).toBe(403);
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
        body: updatedSingleQuiz
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('With login', () => {
    test('should return 200 with updated data', async () => {
      let { updatedSingleQuiz } = data;
      let cookies = await getLoginCookieFor(userData.firstUser);
      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz.replace('{threeWords}', THREE_WORDS),
        body: updatedSingleQuiz,
        cookies
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let body = JSON.parse(res.body);

      expect(body.title === updatedSingleQuiz.title).toBe(true);
      expect(body.description === updatedSingleQuiz.description).toBe(true);
    });
  });

  describe('Change username of quiz', () => {
    test('should return 403 irrespective of login', async () => {
      let { quizWithUsernameBypass } = data;
      let cookies = await getLoginCookieFor(userData.firstUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz.replace('{threeWords}', THREE_WORDS),
        body: quizWithUsernameBypass,
        cookies
      });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Move state', () => {
    test('should return 200 with updated data', async () => {
      let { quizWithStateChange } = data;
      let cookies = await getLoginCookieFor(userData.firstUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz.replace('{threeWords}', THREE_WORDS),
        body: quizWithStateChange,
        cookies
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
    test('should return 400', async () => {
      let { quizWithThreeWordChange } = data;
      let cookies = await getLoginCookieFor(userData.firstUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.updateQuiz.replace('{threeWords}', THREE_WORDS),
        body: quizWithThreeWordChange,
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
    });

    test('should return 404 on post-update fetch', async () => {
      let { quizWithThreeWordChange } = data;

      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace(
          '{threeWords}',
          quizWithThreeWordChange.three_words
        )
      });

      expect(res.statusCode).toBe(404);
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

      let modified3wrdInFetchData = docs.some(
        (doc) => doc.three_words === quizWithThreeWordChange.three_words
      );
      expect(modified3wrdInFetchData).toBe(false);
      let threeWordRemainedUnchanged = docs.some(
        (doc) => doc.three_words === THREE_WORDS
      );
      expect(threeWordRemainedUnchanged).toBe(true);
    });
  });

  describe('Send empty data', () => {
    test('should return 400', async () => {
      let tempCookie = await getLoginCookieFor(userData.secondUser);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', EMPTY_THREE_WORDS),
        body: {},
        cookies: tempCookie
      });

      expect(res.statusCode).toBe(400);
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
    });
  });

  describe('With array of three_words', () => {
    test('should return 400', async () => {
      let cookies = await getLoginCookieFor(userData.secondUser);

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz,
        body: [THREE_WORDS, EMPTY_THREE_WORDS],
        cookies
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('With array of objects', () => {
    test('should return 400', async () => {
      let cookies = await getLoginCookieFor(userData.secondUser);

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz,
        body: [
          { three_words: THREE_WORDS },
          { three_words: EMPTY_THREE_WORDS }
        ],
        cookies
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('With login for different user', () => {
    test('should return 403', async () => {
      let cookies = await getLoginCookieFor(userData.secondUser);

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz.replace('{threeWords}', THREE_WORDS),
        cookies
      });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Happy path', () => {
    test('should return 204', async () => {
      let cookies = await getLoginCookieFor(userData.firstUser);

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.deleteQuiz.replace('{threeWords}', THREE_WORDS),
        cookies
      });

      expect(res.statusCode).toBe(204);
    });

    test('should return 404 on post-delete fetch', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchOneQuiz.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(404);
    });

    test('should not return data on fetch all', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuizzes
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { docs } = JSON.parse(res.body);

      let deletedDocInFetchData = docs.some(
        (doc) => doc.three_words === THREE_WORDS
      );
      expect(deletedDocInFetchData).toBe(false);
    });
  });
});

// describe('Collate quiz', () => {
//   describe('Create without login', () => {
//     test('should return 404', async () => {
//       const res = await app.inject({
//         method: 'POST',
//         url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
//       });

//       expect(res.statusCode).toBe(404);
//     });
//   });

//   describe('Create with login', () => {
//     test('should return 404', async () => {
//       let cookies = getLoginCookieFor(userData.firstUser);

//       const res = await app.inject({
//         method: 'POST',
//         url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
//         cookies
//       });

//       expect(res.statusCode).toBe(404);
//     });
//   });

//   describe('Update without login', () => {
//     test('should return 404', async () => {
//       const res = await app.inject({
//         method: 'PATCH',
//         url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
//       });

//       expect(res.statusCode).toBe(404);
//     });
//   });

//   describe('Update with login', () => {
//     test('should return 404', async () => {
//       let cookies = getLoginCookieFor(userData.firstUser);

//       const res = await app.inject({
//         method: 'POST',
//         url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
//         cookies
//       });

//       expect(res.statusCode).toBe(404);
//     });
//   });

//   describe('Delete without login', () => {
//     test('should return 404', async () => {
//       const res = await app.inject({
//         method: 'POST',
//         url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
//       });

//       expect(res.statusCode).toBe(404);
//     });
//   });

//   describe('Delete with login', () => {
//     test('should return 404', async () => {
//       let cookies = getLoginCookieFor(userData.firstUser);

//       const res = await app.inject({
//         method: 'POST',
//         url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
//         cookies
//       });

//       expect(res.statusCode).toBe(404);
//     });
//   });

//   describe('Fetch', () => {
//     test('should return 200', async () => {
//       const res = await app.inject({
//         method: 'GET',
//         url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
//       });

//       expect(res.statusCode).toBe(200);
//       expect(res.body).toBeDefined();
//       expect(res.body).not.toBeNull();
//     });

//     test('should return valid body', async () => {
//       const res = await app.inject({
//         method: 'GET',
//         url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
//       });

//       let body = JSON.parse(res.body);

//       expect(body).toHaveProperty('quiz');
//       expect(body).toHaveProperty('question');
//       expect(body.quiz).not.toBeNull();
//       expect(body.quiz).not.toBe({});
//       expect(Array.isArray(body.question)).toBe(true);
//       let allQnsHaveFormat = body.question.every(
//         (qn) => qn.answer_format !== undefined && qn.answer_format !== null
//       );
//       expect(allQnsHaveFormat).toBe(true);
//       let allQnsHaveNumber = body.question.every(
//         (qn) => qn.answer_format !== undefined && qn.answer_format !== null
//       );
//       expect(allQnsHaveNumber).toBe(true);
//       let allQnsHaveText = body.question.every(
//         (qn) => qn.answer_format !== undefined && qn.answer_format !== null
//       );
//       expect(allQnsHaveText).toBe(true);
//     });
//   });

//   describe('Fetch with answer bypass', () => {
//     test('should return 200', async () => {
//       const res = await app.inject({
//         method: 'GET',
//         url: endpoints.answersUrl.replace('{threeWords}', THREE_WORDS)
//       });

//       expect(res.statusCode).toBe(200);
//       expect(res.body).toBeDefined();
//       expect(res.body).not.toBeNull();
//     });

//     test('should return valid body', async () => {
//       const res = await app.inject({
//         method: 'GET',
//         url: endpoints.answersUrl.replace('{threeWords}', THREE_WORDS)
//       });
//       let body = JSON.parse(res.body);

//       expect(body).toHaveProperty('quiz');
//       expect(body).toHaveProperty('question');
//       expect(body.quiz).not.toBeNull();
//       expect(body.quiz).not.toBe({});
//       expect(Array.isArray(body.question)).toBe(true);
//       let allQnsHaveFormat = body.question.every(
//         (qn) => qn.answer_format !== undefined && qn.answer_format !== null
//       );
//       expect(allQnsHaveFormat).toBe(true);
//       let allQnsHaveNumber = body.question.every(
//         (qn) => qn.answer_format !== undefined && qn.answer_format !== null
//       );
//       expect(allQnsHaveNumber).toBe(true);
//       let allQnsHaveText = body.question.every(
//         (qn) => qn.answer_format !== undefined && qn.answer_format !== null
//       );
//       expect(allQnsHaveText).toBe(true);
//     });

//     test('should not return answers', async () => {
//       const res = await app.inject({
//         method: 'GET',
//         url: endpoints.answersUrl.replace('{threeWords}', THREE_WORDS)
//       });
//       let body = JSON.parse(res.body);

//       expect(body).not.toHaveProperty('answer');
//       expect(body).not.toHaveProperty('answers');
//       let optionsFetched = body.question
//         .filter(
//           ({ answer_format }) =>
//             answer_format === 'mcq' || answer_format === 'msq'
//         )
//         .map(({ options }) => ({ options }))
//         .flat();
//       let someOptHasAnswer = optionsFetched.some(
//         (opt) => opt.is_answer !== undefined
//       );
//       expect(someOptHasAnswer).toBe(false);
//     });
//   });
// });

// describe('Evaluate quiz', () => {
//   describe('Create without login', () => {
//     test('should return 401', async () => {
//       const res = await app.inject({
//         method: 'POST',
//         url: endpoints.evaluateUrl.replace('{threeWords}', THREE_WORDS)
//       });

//       expect(res.statusCode).toBe(401);
//     });
//   });

//   describe('Create non-existant quiz', () => {
//     test('should return 404', async () => {
//       const res = await app.inject({
//         method: 'POST',
//         url: endpoints.evaluateUrl.replace('{threeWords}', 'text-doesnt-exist')
//       });

//       expect(res.statusCode).toBe(404);
//     });
//   });

//   describe('Create with login', () => {
//     test('should return 201 with valid body', async () => {
//       let cookies = await getLoginCookieFor(userData.firstUser);
//       const res = await app.inject({
//         method: 'POST',
//         url: endpoints.evaluateUrl.replace('{threeWords}', THREE_WORDS),
//         cookies
//       });

//       expect(res.statusCode).toBe(201);
//       expect(res.body).toBeDefined();

//       let body = JSON.parse(res.body);

//       expect(body).toHaveProperty('three_words');
//       expect(body).toHaveProperty('responses');
//     });
//   });

//   // describe('Update without login', () => {
//   //   test('should return 401');
//   // });
//   // describe('Update as different user', () => {
//   //   test('should return 403');
//   // });
//   // describe('Update non-existant quiz', () => {
//   //   test('should return 404');
//   // });
//   // describe('Update with login');
//   // describe('Delete without login', () => {
//   //   test('should return 404');
//   // });
//   // describe('Delete with login', () => {
//   //   test('should return 404');
//   // });
//   // describe('Fetch without login', () => {
//   //   test('should return 401');
//   // });
//   // describe('Fetch as different user', () => {
//   //   test('should return 403');
//   // });
//   // describe('Fetch non-existant quiz', () => {
//   //   test('should return 404');
//   // });
//   // describe('Fetch with login');
// });

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

afterAll(async () => {
  await db.quiz.destroy({ truncate: true, cascade: true });
  await db.user.destroy({ truncate: true, cascade: true });
  await redis.flush();
  await redis.quit();
});
