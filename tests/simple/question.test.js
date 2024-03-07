/**
 * Unit tests for all /questions API endpoints
 */
const { join } = require('path');
const { describe, test, expect } = global;

const app = require(join(__dirname, '..', '..', 'lib', 'app.js')).default;

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

let THREE_WORDS, COOKIES;

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
  COOKIES = getLoginCookieFor(user);
  const quizRes = await app.inject({
    method: 'POST',
    url: quizEndpoints.createQuiz,
    body: JSON.stringify(doc),
    cookies: COOKIES
  });
  if (quizRes.statusCode === 201) {
    return JSON.parse(quizRes.body).three_words;
  }
  return null;
}

beforeAll(async () => {
  await createUserFor(userData.updatedFirstUser);
  THREE_WORDS = await createQuizFor(
    quizData.singleQuiz,
    userData.updatedFirstUser
  );
});

describe('Fetch all questions', () => {
  describe.only('Before any creation', () => {
    test('should return 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
      });
      expect(res.statusCode).toBe(200);
    });

    test('should return valid body', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.genericUrl
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
        url: endpoints.genericUrl
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
        url: endpoints.specificUrl.replace(
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
        url: endpoints.genericUrl + '?page=2'
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });
});

describe('Create questions', () => {
  describe('With fake user', () => {
    test('should return 401', async () => {
      let fakeCookie = {
        _sessionId: new Buffer.from('user doesnt exist').toString('base64url')
      }; // passing fake cookie for user which does not exist
      let { questionWithoutText } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.genericUrl,
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
        url: endpoints.genericUrl,
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
        url: endpoints.genericUrl,
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
        cookies: COOKIES
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
        cookies: COOKIES
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
        cookies: COOKIES
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
        url: endpoints.genericUrl,
        body: JSON.stringify(textQuestions),
        cookies: COOKIES
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
        cookies: COOKIES
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
        cookies: COOKIES
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Unordered: without numbering', () => {
    test('should return', async () => {
      let { msqQuestions } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(msqQuestions),
        cookies: COOKIES
      });

      test('201', () => {
        expect(res.statusCode).toBe(201);
        expect(res.body).toBeDefined();
        expect(res.body).not.toBeNull();
      });

      test('valid schema', () => {
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

      test('request data', () => {
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
          (opt) =>
            opt.text !== undefined && opt.text !== null && opt.text !== ''
        );
        expect(allOptsHaveText).toBe(true);
      });

      test('data on fetch', async () => {
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
          (opt) =>
            opt.text !== undefined && opt.text !== null && opt.text !== ''
        );
        expect(allOptsHaveText).toBe(true);
      });
    });
  });

  describe('Wrong numbering', () => {
    test('should', async () => {
      let wronglyNumberedData = addData(data.mcsQuestions, { number: 42 }); // adding fake number

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(wronglyNumberedData),
        cookies
      });

      test('return 201', () => {
        expect(res.statusCode).toBe(201);
        expect(res.body).toBeDefined();
        expect(res.body).not.toBeNull();
      });
      test('have correct numbering', () => {
        let { docs } = JSON.parse(res.body);

        let allQnsHaveCorrectNumber = docs.every(
          (doc, i) => doc.number === 1 + i
        );
        expect(allQnsHaveCorrectNumber).toBe(true);
      });
    });
  });

  // Happy path
  describe('Single question', () => {
    test('should', async () => {
      let singleQuestion = data.textQuestions[0];

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(singleQuestion), // One question object
        cookies
      });

      test('return 201', () => {
        expect(res.statusCode).toBe(201);
        expect(res.body).toBeDefined();
        expect(res.body).not.toBeNull();
      });

      test('have required fields in response', () => {
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
  });

  describe('With weightage as number', () => {
    test('should', async () => {
      let { questionWithoutText } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(questionWithoutText),
        cookies
      });

      test('return 201', () => {
        expect(res.statusCode).toBe(201);
        expect(res.body).toBeDefined();
        expect(res.body).not.toBeNull();
      });

      test('have weightage as JSON', () => {
        let { weightage } = JSON.parse(res.body);

        expect(weightage).toBeDefined();
        expect(weightage).not.toBeNull();
        expect(typeof weightage === 'object').toBe(true);
        expect(weightage).toHaveProperty('value');
        expect(Number.isFinite(weightage.value)).toBe(true);
        expect(weightage.value).equals(questionWithoutText.weightage);
      });
    });
  });

  describe('Multiple questions', () => {
    test('should return', async () => {
      let { mcsQuestions } = data;

      const res = await app.inject({
        method: 'POST',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(mcsQuestions),
        cookies
      });

      test('201', () => {
        expect(res.statusCode).toBe(201);
        expect(res.body).toBeDefined();
        expect(res.body).not.toBeNull();
      });
    });
  });
});

// const res = await app.inject({ method: 'GET', url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)});

describe('Fetch questions', () => {
  describe('Fetch all: With non-existant quiz', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', 'Quiz-Not-Found')
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Fetch all: With existing quiz', () => {
    test('should', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });
      let docs;

      test('return 200', () => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
        expect(res.body).not.toBeNull();
      });
      test('have valid body', () => {
        let body = JSON.parse(res.body);

        expect(body).toHaveProperty('docs');
        expect(body.docs).not.toBeNull();
        expect(Array.isArray(body.docs)).toBe(true);
        expect(body.docs.length).toBeGreaterThan(0);

        docs = body.docs;
      });
      test('have question.three_words', () => {
        let allQnsHaveThreeWord = docs.every(
          (doc) => doc.three_words !== undefined && doc.three_words !== null
        );
        let allQnsHaveCorrectThreeWord = docs.every(
          (doc) => doc.three_words === THREE_WORDS
        );
        expect(allQnsHaveThreeWord).toBe(true);
        expect(allQnsHaveCorrectThreeWord).toBe(true);
      });
      test('have question.answer_format', () => {
        let allQnsHaveFormat = docs.every(
          (doc) => doc.answer_format !== undefined && doc.answer_format !== null
        );
        expect(allQnsHaveFormat).toBe(true);
      });
      test('have question.number', () => {
        let allQnsHaveNumber = docs.every(
          (doc) =>
            doc.number !== undefined && doc.number !== null && doc.number > 0
        );
        expect(allQnsHaveNumber).toBe(true);
      });
      test('have question.options', () => {
        let allQnsHaveOptions = docs.every(
          (doc) =>
            doc.options !== undefined &&
            doc.options !== null &&
            doc.options.length > 0
        );
        expect(allQnsHaveOptions).toBe(true);
      });
      test('have question.options.character', () => {
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
      test('have question.options.text', () => {
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
  });

  describe('Paginated request: Answer without login', () => {
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

  describe('Paginated request: Answer with different login', () => {
    test('should return 200 without answers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.answersUrl.replace('{threeWords}', THREE_WORDS),
        cookies: COOKIES
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

  describe('Paginated request: Answer with creator login', () => {
    test('should return 200 with answers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: endpoints.answersUrl.replace('{threeWords}', THREE_WORDS),
        cookies: COOKIES // cookie of updatedFirstUser
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
  describe('With empty data', () => {
    test('should return 400', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify({}),
        cookies: COOKIES
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Wrong numbering', () => {
    test('should throw 500', async () => {
      let wronglyNumberedData = addData(data.mcsQuestions, { number: 44 }); // adding fake number

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(wronglyNumberedData),
        cookies: COOKIES
      });

      expect(res.statusCode).toBe(500); // Due to repeated number key
      expect(res.body).toBeUndefined();
    });
  });

  describe('Adding options', () => {
    test('should', async () => {
      let { extraOptionNonAnswer } = data;

      const fetch = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      let { docs } = JSON.parse(fetch.body);
      docs[0] = docs[0].options.push(extraOptionNonAnswer);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(docs),
        cookies: COOKIES
      });

      test('return 200', () => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
      });

      test('return updated data', () => {
        let body = JSON.parse(res.body);
        expect(Array.isArray(body.docs)).toBe(true);
        expect(body.docs[0]).toMatchObject(docs[0]);
      });
    });
  });

  describe('Adding answers', () => {
    test('should return', async () => {
      let { extraOptionAnswer } = data;

      const fetch = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      let { docs } = JSON.parse(fetch.body);
      docs[0] = docs[0].options.push(extraOptionAnswer);

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(docs),
        cookies
      });

      test('200', () => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
      });

      test('updated data', () => {
        let body = JSON.parse(res.body);
        expect(Array.isArray(body.docs)).toBe(true);
        expect(body.docs[0]).toMatchObject(docs[0]);
      });
    });
  });

  describe('Conflicting option', () => {
    test('should return', async () => {
      let { conflictingOpt } = data;
      const fetch = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      let { docs } = JSON.parse(fetch.body);
      docs.filter((doc) => doc.answer_format === 'msq')[1].options[0] =
        conflictingOpt;

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(docs),
        cookies
      });

      test('200', () => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
      });

      test('updated data', () => {
        let body = JSON.parse(res.body);
        expect(Array.isArray(body.docs)).toBe(true);
        let changedOpt = docs.filter((doc) => doc.answer_format === 'msq')[1]
          .options[0];
        expect(changedOpt).toMatchObject(conflictingOpt);
      });
    });
  });

  describe('Removed options', () => {
    test('should return', async () => {
      const fetch = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      let { docs } = JSON.parse(fetch.body);
      docs.filter((doc) => doc.answer_format === 'msq')[1].options.pop(); // removing last option in 2nd question
      let lengthAfterModification = docs.filter(
        (doc) => doc.answer_format === 'msq'
      )[1].options.length;

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(docs),
        cookies
      });

      test('200', () => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
      });

      test('updated data', () => {
        let body = JSON.parse(res.body);

        expect(body).toHaveProperty('docs');
        let changedOpts = docs.filter((doc) => doc.answer_format === 'msq')[1]
          .options;
        expect(changedOpts.length).equals(lengthAfterModification);
      });
    });
  });

  describe('Removed answers', () => {
    test('should return', async () => {
      const fetch = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      let { docs } = JSON.parse(fetch.body);
      docs
        .filter((doc) => doc.answer_format === 'msq')[2]
        .options.filter((opt) => opt.is_answer === true)
        .pop(); // removing last answer in 3rd question
      let lengthAfterModification = docs.filter(
        (doc) => doc.answer_format === 'msq'
      )[2].options.length;

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(docs),
        cookies
      });

      test('200', () => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
      });

      test('updated data', () => {
        let body = JSON.parse(res.body);

        expect(body).toHaveProperty('docs');
        let changedOpts = docs.filter((doc) => doc.answer_format === 'msq')[1]
          .options;
        expect(changedOpts.length).equals(lengthAfterModification);
      });
    });
  });

  describe('Multiple quizzes', () => {
    test('should return 400', async () => {
      let { questionForMultipleQuiz } = data;

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.genericUrl,
        body: JSON.stringify(questionForMultipleQuiz),
        cookies
      });
    });
  });

  describe('Re-arranged order', () => {
    test('should return', async () => {
      const fetch = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      let { docs } = JSON.parse(fetch.body);
      docs = docs.map((doc) => delete doc.number).reverse();

      const res = await app.inject({
        method: 'PATCH',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(docs),
        cookies
      });

      test('200', () => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
      });

      test('updated data', () => {
        let body = JSON.parse(res.body);

        expect(body).toHaveProperty('docs');
        expect(Array.isArray(body.docs)).toBe(true);
        let orderIsReversed = body.docs.every(doc, (i) => doc === docs[i]);
        expect(orderIsReversed).toBe(true);
      });
    });
  });
});

describe('Delete question', () => {
  describe('Non-existant user', () => {
    test('should return', async () => {
      let cookies = getLoginCookieFor(userData.multiUsers[1]);

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.genericUrl,
        body: JSON.stringify({
          three_words: THREE_WORDS,
          number: 3
        }),
        cookies
      });

      test('should return 401', () => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toBeUndefined();
      });
    });
  });

  describe('Non-existant quiz', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.specificUrl.replace('{threeWords}', 'fake-quiz-word'),
        body: JSON.parse({
          number: 3
        }),
        cookies: COOKIES
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Non-existant questions', () => {
    test('should return 404', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify({
          number: 42
        }),
        cookies: COOKIES
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Without login', () => {
    test('should return 401', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify({
          number: 42
        })
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Multiple quizzes', () => {
    test('should return 400', async () => {
      let { questionForMultipleQuiz } = data;

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(questionForMultipleQuiz),
        cookies: COOKIES
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBeUndefined();
    });
  });
  // Happy path
  describe('Single question', () => {
    test('should return 204', async () => {
      const fetch = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      let fetchData = JSON.parse(fetch.body);

      let qnToBeDeleted = fetchData.docs.find(
        (doc) => doc.text === data.textQuestions[1].text
      );

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(qnToBeDeleted),
        cookies: COOKIES
      });

      expect(res.statusCode).toBe(204);
      expect(res.body).toBeUndefined();
    });
  });

  describe('Multiple questions', () => {
    test('should return 204', async () => {
      const fetch = await app.inject({
        method: 'GET',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS)
      });

      let { docs } = JSON.parse(fetch.body);

      const res = await app.inject({
        method: 'DELETE',
        url: endpoints.specificUrl.replace('{threeWords}', THREE_WORDS),
        body: JSON.stringify(docs.slice(3, 2)),
        cookies: COOKIES
      });
      expect(res.statusCode).toBe(204);
      expect(res.body).toBeUndefined();
    });
  });
});
