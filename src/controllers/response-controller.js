import { ERROR_MESSAGES } from '../config';
import ResponseServices from '../services/response-services';

export const create = async function (request, reply) {
  if (!request.body || !request.params.threewords) {
    return reply.code(400).send();
  }
  try {
    let { username } = request.session;
    let { threewords } = request.params;
    let docs = [];

    for (let i = 0; i < request.body.length; i++) {
      const doc = request.body[i];
      if (!doc.number || !(doc.choice || doc.text)) {
        // Record is missing required fields
        return reply.code(400).send(`Required fields missing in:\n${JSON.stringify(doc, null, 2)}`);
      }
      docs.push({
        ...doc,
        username,
        three_words: threewords,
        _id: `${username}:${threewords}:${doc.number}`
      });
    }
    let records = await ResponseServices.bulkCreate(docs);
    console.log(records);
    return reply.code(201).send();
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const submitResponse = async function (request, reply) {
  /**
   * API Endpoint: /quiz/:threewords/_submit
   */
  if (
    !request.body ||
    !Array.isArray(request.body) ||
    !request.body.length ||
    !request.params.threewords
  ) {
    return reply.code(400).send();
  }
  try {
    let { username } = request.session;
    let { threewords } = request.params;
    let docs = [];
    for (let i = 0; i < request.body.length; i++) {
      const doc = request.body[i];
      if (doc.username) {
        // Passing username within response
        let errorMessage = ERROR_MESSAGES.FORBIDDEN + ` in ${JSON.stringify(doc, null, 1)}`;
        return reply.code(403).send(errorMessage);
      }
      if (!doc.number || (!doc.choice && !doc.text)) {
        // Record is missing required fields
        let errorMessage = !doc.number
          ? ERROR_MESSAGES.MISSING_REQUIRED + 'number'
          : ERROR_MESSAGES.MISSING_REQUIRED + 'choice/text';
        return reply.code(400).send(errorMessage + ` in:\n${JSON.stringify(doc, null, 1)}`);
      }
      if (doc.choice && doc.text) {
        // Cannot pass both params
        let errorMessage = ERROR_MESSAGES.CONFLICT + JSON.stringify(doc, null, 1);
        return reply.code(400).send(errorMessage);
      }

      docs.push({
        ...doc,
        username,
        three_words: threewords,
        _id: `${username}:${threewords}:${doc.number}`
      });
    }
    let response = await ResponseServices.bulkCreate(docs);
    if (response.errors) {
      return reply.code(500).send(ERROR_MESSAGES.GENERIC);
    }
    console.log(response?.items);
    return reply.code(201).send();
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send(e);
  }
};
