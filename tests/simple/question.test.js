/**
 * Unit tests for all /questions API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app.js'));

const { data: userData, endpoints: userEndpoints } = require(join(
  __dirname,
  '..',
  'constants.js'
)).user;
const { data: quizData, endpoints: quizEndpoints } = require(join(
  __dirname,
  '..',
  'constants.js'
)).quiz;
const { data, endpoints, addData } = require(join(
  __dirname,
  '..',
  'constants.js'
)).question;

let THREE_WORDS;

async function getLoginCookieFor(userObject) {
  const loginRes = await app.inject({
    method: 'PUT',
    url: userEndpoints.loginUser,
    body: JSON.stringify(userObject)
  });
  return loginRes?.headers?.cookie ?? null;
}

async function createUserFor(user) {
  const userRes = await app.inject({
    method: 'POST',
    url: userEndpoints.createUser,
    body: JSON.stringify(user)
  });
  if (userRes.statusCode === 201) return true;
  return null;
}

async function createQuizFor(doc, user) {
  let cookies = getLoginCookieFor(user);
  const quizRes = await app.inject({
    method: 'POST',
    url: quizEndpoints.createQuiz,
    body: JSON.stringify(doc),
    cookies
  });
  if (quizRes.statusCode === 201) {
    return JSON.parse(quizRes.body).three_words;
  }
  return null;
}

beforeAll(async () => {
  await createUserFor(userData.updatedFirstUser);
  THREE_WORDS = await createQuizFor(quizData.singleQuiz);
});

describe('Fetch all questions', () => {
  describe('Before any creation', () => {
    test('should return 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuestions
      });
      expect(res.statusCode).toBe(200);
    });

    test('should return valid body', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuestions
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

    test('should return 0 records', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuestions
      });

      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBe(0);
      expect(docs.length).toBe(0);
    });
  });

  describe('With non-existant quiz', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchQuestionsForQuiz.replace(
          '{threeWords}',
          'Name-Doesnt-Exists'
        )
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Paginated request', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.fetchAllQuestions + '?page=2'
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Create questions', async () => {
  let { updatedFirstUser } = userData;
  let cookies = await getLoginCookieFor(updatedFirstUser);

  describe('With fake user', () => {
    test('should return 401', async () => {
      let fakeCookie = {
        _sessionId: new Buffer.from('user doesnt exist').toString('base64url')
      }; // passing fake cookie for user which does not exist
      let { questionWithoutText } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.generalUrl,
        body: JSON.parse(questionWithoutText),
        cookies: fakeCookie
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without login', () => {
    test('should return 401', async () => {
      let { questionWithoutText } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.generalUrl,
        body: JSON.parse(questionWithoutText)
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without quiz', () => {
    test('should return 400', async () => {
      let { questionWithoutText } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.generalUrl,
        body: JSON.parse(questionWithoutText)
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('With non-existant quiz', () => {
    test('should return 404', async () => {
      // With login
      let { textQuestions } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', 'Quiz-Doesnt-Exist'),
        body: JSON.stringify(textQuestions),
        cookies
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('With empty data', () => {
    test('should return 400', async () => {
      // With login
      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify({}),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Missing required field: answer_format', () => {
    test('should return 400', async () => {
      let { questionWithoutFormatWithoutOptions } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify([questionWithoutFormatWithoutOptions]),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Missing required field: three_words', () => {
    test('should return 400', async () => {
      let { textQuestions } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.generalUrl,
        body: JSON.stringify(textQuestions),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Missing required field: options', () => {
    test('should return 400', async () => {
      let { questionWithoutOptionsWithAnswer } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify([questionWithoutOptionsWithAnswer]),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Missing required field: answers', () => {
    test('should return 400', async () => {
      let { questionWithoutAnswer } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify([questionWithoutAnswer]),
        cookies
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Unordered: without numbering', async () => {
    let { msqQuestions } = data;

    const res = await app.inject({
      method: 'POST',
      url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
      body: JSON.stringify(msqQuestions),
      cookies
    });

    test('should return 201', () => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
    });

    test('should return valid schema', () => {
      /*
        Sample format: {
          total_docs,
          docs: [
            {
              three_words, text, answer_format, number,
              options: [
                { character, text }
              ]
            }
          ]
        }
      */
      let { total_docs, docs } = JSON.parse(res.body);

      expect(total_docs).toBeDefined();
      expect(total_docs).not.toBeNull();
      expect(Number.isFinite(total_docs)).toBe(true);
      expect(docs).toBeDefined();
      expect(docs).not.toBeNull();
      expect(Array.isArray(body.questions)).toBe(true);
    });

    test('should return request data', () => {
      let { docs } = JSON.parse(res.body);

      let allQnsHaveThreeWord,
        allQnsHaveText,
        allQnsHaveFormat,
        allQnsHaveNumber,
        allQnsHaveOptions,
        allQnsHaveCorrectThreeWord,
        allQnsHaveWeightageJson;

      allQnsHaveThreeWord = docs.every(
        (doc) => doc.three_words !== undefined && doc.three_words !== null
      );
      allQnsHaveText = docs.every(
        (doc) => doc.text !== undefined && doc.text !== null
      );
      allQnsHaveFormat = docs.every(
        (doc) => doc.answer_format !== undefined && doc.answer_format !== null
      );
      allQnsHaveNumber = docs.every(
        (doc) =>
          doc.number !== undefined && doc.number !== null && doc.number > 0
      );
      allQnsHaveOptions = docs.every(
        (doc) =>
          doc.options !== undefined &&
          doc.options !== null &&
          doc.options.length > 0
      );
      allQnsHaveCorrectThreeWord = docs.every(
        (doc) => doc.three_words === THREE_WORDS
      );
      allQnsHaveWeightageJson = docs.every(
        (doc) =>
          doc.weightage !== undefined &&
          doc.weightage !== null &&
          doc.weightage.value !== undefined &&
          doc.weightage.value !== null
      );
      expect(allQnsHaveThreeWord).toBe(true);
      expect(allQnsHaveText).toBe(true);
      expect(allQnsHaveFormat).toBe(true);
      expect(allQnsHaveNumber).toBe(true);
      expect(allQnsHaveOptions).toBe(true);
      expect(allQnsHaveCorrectThreeWord).toBe(true);
      expect(allQnsHaveWeightageJson).toBe(true);

      let optionsFetched = docs.map((doc) => doc.options).flat();

      let allOptsHaveCharacter = optionsFetched.every(
        (opt) =>
          opt.character !== undefined &&
          opt.character !== null &&
          opt.character !== ''
      );
      expect(allOptsHaveCharacter).toBe(true);
      let allOptsHaveText = optionsFetched.every(
        (opt) => opt.text !== undefined && opt.text !== null && opt.text !== ''
      );
      expect(allOptsHaveText).toBe(true);
    });

    test('should return data on fetch', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      let { total_docs, docs } = JSON.parse(res.body);

      expect(Number.isFinite(total_docs)).toBe(true);
      expect(docs.length).toBeGreaterThan(0);

      let allQnsHaveThreeWord,
        allQnsHaveText,
        allQnsHaveFormat,
        allQnsHaveNumber,
        allQnsHaveOptions,
        allQnsHaveCorrectThreeWord,
        allQnsHaveWeightageJson;

      allQnsHaveThreeWord = docs.every(
        (doc) => doc.three_words !== undefined && doc.three_words !== null
      );
      allQnsHaveText = docs.every(
        (doc) => doc.text !== undefined && doc.text !== null
      );
      allQnsHaveFormat = docs.every(
        (doc) => doc.answer_format !== undefined && doc.answer_format !== null
      );
      allQnsHaveNumber = docs.every(
        (doc) =>
          doc.number !== undefined && doc.number !== null && doc.number > 0
      );
      allQnsHaveOptions = docs.every(
        (doc) =>
          doc.options !== undefined &&
          doc.options !== null &&
          doc.options.length > 0
      );
      allQnsHaveCorrectThreeWord = docs.every(
        (doc) => doc.three_words === THREE_WORDS
      );
      allQnsHaveWeightageJson = docs.every(
        (doc) =>
          doc.weightage !== undefined &&
          doc.weightage !== null &&
          doc.weightage.value !== undefined &&
          doc.weightage.value !== null
      );

      expect(allQnsHaveThreeWord).toBe(true);
      expect(allQnsHaveText).toBe(true);
      expect(allQnsHaveFormat).toBe(true);
      expect(allQnsHaveNumber).toBe(true);
      expect(allQnsHaveOptions).toBe(true);
      expect(allQnsHaveCorrectThreeWord).toBe(true);
      expect(allQnsHaveWeightageJson).toBe(true);

      let optionsFetched = docs.map((doc) => doc.options).flat();

      let allOptsHaveCharacter = optionsFetched.every(
        (opt) =>
          opt.character !== undefined &&
          opt.character !== null &&
          opt.character !== ''
      );
      expect(allOptsHaveCharacter).toBe(true);
      let allOptsHaveText = optionsFetched.every(
        (opt) => opt.text !== undefined && opt.text !== null && opt.text !== ''
      );
      expect(allOptsHaveText).toBe(true);
    });
  });

  describe('Wrong numbering', async () => {
    let wronglyNumberedData = addData(data.mcsQuestions, { number: 42 }); // adding fake number

    const res = await app.inject({
      method: 'POST',
      url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
      body: JSON.stringify(wronglyNumberedData),
      cookies
    });

    test('should return 201', () => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
    });
    test('should have correct numbering', () => {
      let { docs } = JSON.parse(res.body);

      let allQnsHaveCorrectNumber = docs.every(
        (doc, i) => doc.number === 1 + i
      );
      expect(allQnsHaveCorrectNumber).toBe(true);
    });
  });

  // Happy path
  describe('Single question', async () => {
    let singleQuestion = data.textQuestions[0];

    const res = await app.inject({
      method: 'POST',
      url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
      body: JSON.stringify(singleQuestion), // One question object
      cookies
    });

    test('should return 201', () => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
    });

    test('should have required fields in response', () => {
      /**
       * Required fields: [ three_words, answer_format, number ]
       */
      let body = JSON.parse(res.body);

      expect(body.three_words).toBeDefined();
      expect(body.three_words === THREE_WORDS).toBe(true);
      expect(body.answer_format).equals(singleQuestion.answer_format);
      expect(body.number).toBeDefined();
      expect(Number.isFinite(body.number)).toBe(true);
      expect(body.number).toBeGreaterThan(0);
    });
  });

  describe('With weightage as number', async () => {
    let { questionWithoutText } = data;

    const res = await app.inject({
      method: 'POST',
      url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
      body: JSON.stringify(questionWithoutText),
      cookies
    });

    test('should return 201', () => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
    });

    test('should have weightage as JSON', () => {
      let { weightage } = JSON.parse(res.body);

      expect(weightage).toBeDefined();
      expect(weightage).not.toBeNull();
      expect(typeof weightage === 'object').toBe(true);
      expect(weightage).toHaveProperty('value');
      expect(Number.isFinite(weightage.value)).toBe(true);
      expect(weightage.value).equals(questionWithoutText.weightage);
    });
  });

  describe('Multiple questions', async () => {
    let { mcsQuestions } = data;

    const res = await app.inject({
      method: 'POST',
      url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
      body: JSON.stringify(mcsQuestions),
      cookies
    });

    test('should return 201', () => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
    });
  });
});

// const res = await app.inject({ method: 'GET', url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)});

describe('Fetch questions', () => {
  describe('Fetch all');
  describe('With non-existant quiz', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', 'Quiz-Not-Found')
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('With existing quiz', async () => {
    const res = await app.inject({
      method: 'GET',
      url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
    });
    let docs;

    test('should return 200', () => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
    });
    test('should have valid body', () => {
      let body = JSON.parse(res.body);

      expect(body).toHaveProperty('docs');
      expect(body.docs).not.toBeNull();
      expect(Array.isArray(body.docs)).toBe(true);
      expect(body.docs.length).toBeGreaterThan(0);

      docs = body.docs;
    });
    test('should have question.three_words', () => {
      let allQnsHaveThreeWord = docs.every(
        (doc) => doc.three_words !== undefined && doc.three_words !== null
      );
      let allQnsHaveCorrectThreeWord = docs.every(
        (doc) => doc.three_words === THREE_WORDS
      );
      expect(allQnsHaveThreeWord).toBe(true);
      expect(allQnsHaveCorrectThreeWord).toBe(true);
    });
    test('should have question.answer_format', () => {
      let allQnsHaveFormat = docs.every(
        (doc) => doc.answer_format !== undefined && doc.answer_format !== null
      );
      expect(allQnsHaveFormat).toBe(true);
    });
    test('should have question.number', () => {
      let allQnsHaveNumber = docs.every(
        (doc) =>
          doc.number !== undefined && doc.number !== null && doc.number > 0
      );
      expect(allQnsHaveNumber).toBe(true);
    });
    test('should have question.options', () => {
      let allQnsHaveOptions = docs.every(
        (doc) =>
          doc.options !== undefined &&
          doc.options !== null &&
          doc.options.length > 0
      );
      expect(allQnsHaveOptions).toBe(true);
    });
    test('should have question.options.character', () => {
      let allOptsHaveCharacter = docs
        .map((doc) => doc.options)
        .flat()
        .every(
          (opt) =>
            opt.character !== undefined &&
            opt.character !== null &&
            opt.character !== ''
        );
      expect(allOptsHaveCharacter).toBe(true);
    });
    test('should have question.options.text', () => {
      let allOptsHaveText = docs
        .map((doc) => doc.options)
        .flat()
        .every(
          (opt) =>
            opt.text !== undefined && opt.text !== null && opt.text !== ''
        );
      expect(allOptsHaveText).toBe(true);
    });
  });

  describe('Paginated request');
  describe('Answer without login', () => {
    test('should return 200 with without answers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.answersUrl.replace('{threeWords}', THREE_WORDS)
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      let { docs } = JSON.parse(body);

      expect(docs).toBeDefined();
      expect(docs).not.toBeNull();

      let someQnHasAnswer = docs
        .map((doc) => doc.options)
        .flat()
        .some((opt) => opt.is_answer !== undefined);
      expect(someQnHasAnswer).toBe(false);
    });
  });

  describe('Answer with different login', () => {
    test('should return 200 without answers', async () => {
      let cookies = await getLoginCookieFor(userData.secondUser);

      const res = await app.inject({
        method: 'GET',
        url: endpoints.answersUrl.replace('{threeWords}', THREE_WORDS),
        cookies
      });

      expect(res.statusCode).toBe(200);

      let { docs } = JSON.parse(res.body);

      expect(docs).toBeDefined();
      expect(docs).not.toBeNull();

      let someQnHasAnswer = docs
        .map((doc) => doc.options)
        .flat()
        .some((opt) => opt.is_answer !== undefined);
      expect(someQnHasAnswer).toBe(false);
    });
  });

  describe('Answer with creator login', () => {
    test('should return 200 with answers', async () => {
      let cookies = await getLoginCookieFor(userData.updatedFirstUser);

      const res = await app.inject({
        method: 'GET',
        url: endpoints.answersUrl.replace('{threeWords}', THREE_WORDS),
        cookies
      });

      expect(res.statusCode).toBe(200);

      let { docs } = JSON.parse(res.body);

      expect(docs).toBeDefined();
      expect(docs).not.toBeNull();

      let allAutoQnsHasAnswer = docs
        .filter(
          (doc) => doc.answer_format === 'mcq' || doc.answer_format === 'msq'
        )
        .map((doc) => doc.options) // pick only the options
        .flat() // flatten
        .every((opt) => opt.is_answer !== undefined && opt.is_answer !== null);
      expect(allAutoQnsHasAnswer).toBe(true);
    });
  });
});

describe('Update question', () => {
  describe('With empty data');
  describe('Re-arranged order');
  describe('Wrong numbering');
  describe('Adding options');
  describe('Adding answers');
  describe('Removed options');
  describe('Removed answers');
  describe('Multiple quizzes');
  // Happy path
  describe('Single question');
  describe('Multiple questions');
});

describe('Delete question', () => {
  describe('Non-existant user');
  describe('Non-existant quiz');
  describe('Non-existant questions');
  describe('Without login');
  describe('Multiple quizzes');
  // Happy path
  describe('Single question');
  describe('Multiple questions');
});
describe('Collate questions', () => {});
describe('Evaluate questions');

/*
test('', async() => {
    const res = await app.inject({ method: , url: });
  });
*/
