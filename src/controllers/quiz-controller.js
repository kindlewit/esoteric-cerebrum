'use strict';

import cloneDeep from 'lodash.clonedeep';

import db from '../orm';
import * as QuizServices from '../services/quiz-services';
import * as TopicServices from '../services/topic-services';
import { get as getCreator } from '../services/user-services';

export const createQuiz = async function (request, reply) {
  if (!request.body || Array.isArray(request.body)) {
    return reply.code(400).send();
  }
  try {
    let { topics, ...quizObj } = cloneDeep(request.body);
    quizObj.username = request.session.username;
    let record = await QuizServices.create(quizObj);
    if (topics && topics.length) {
      for (const t of topics) {
        let topicRecord = await TopicServices.fetchOrCreate(t);
        await TopicServices.createQTMapping({
          ...topicRecord,
          three_words: record.three_words
        });
      }
    }
    return reply.code(201).send(record);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
};

export const listQuizzes = async function (request, reply) {
  try {
    let { count, rows } = await QuizServices.list();
    let response = {
      total_docs: count,
      docs: Array.isArray(rows) ? rows : [rows]
    };
    return reply.code(200).send(response);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
};

export const getQuiz = async function (request, reply) {
  if (
    request.params.threeWords === undefined ||
    request.params.threeWords === null ||
    !request.params.threeWords.length
  ) {
    return reply.code(400).send();
  }
  try {
    let { threeWords } = request.params;
    let record = await QuizServices.get(threeWords);
    if (record === undefined || record === null || record === {}) {
      return reply.code(404).send();
    }
    let creator = await getCreator(record.username);
    if (creator && creator?.display_name) {
      record.display_name = creator?.display_name;
    }
    if (record.topics && record.topics.length) {
      record.topics = record.topics.map(({ text }) => text);
    }
    return reply.code(200).send(record);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
};

export const updateQuiz = async function (request, reply) {
  if (
    !request.params.threeWords ||
    !request.params.threeWords.length ||
    !request.body ||
    !Object.keys(request.body).length ||
    Array.isArray(request.body)
  ) {
    return reply.code(400).send();
  }
  try {
    let { threeWords } = request.params;
    let { username } = request.session;
    let record = await QuizServices.get(threeWords);
    if (record === undefined || record === null || record === {}) {
      return reply.code(404).send();
    }
    // Record exists
    if (username !== record.username) {
      // Requesting user is not the creator
      return reply.code(403).send();
    }
    let changes = cloneDeep(request.body);
    if (changes.three_words) {
      return reply.code(400).send('Cannot edit field: Three Words');
    }
    if (changes.username) {
      return reply.code(400).send('Cannot edit field: Username');
    }
    // Cannot edit these 2 attributes
    let modifiedRecord = await QuizServices.update(threeWords, changes);
    if (
      modifiedRecord === undefined ||
      modifiedRecord === null ||
      modifiedRecord === {}
    ) {
      // This block should logically not execute, but
      // in case record was removed async before update query
      return reply.code(404).send('Record missing while update');
    }
    return reply.code(200).send(modifiedRecord);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
};

export const deleteQuiz = async function (request, reply) {
  if (
    !request.params.threeWords ||
    !request.params.threeWords.length ||
    request.body
  ) {
    return reply.code(400).send();
  }
  try {
    let { threeWords } = request.params;
    let { username } = request.session;
    let record = await QuizServices.get(threeWords);
    if (record === undefined || record === null || record === {}) {
      return reply.code(404).send();
    }
    // Record exists
    if (record.username === username) {
      // Requesting user is same as creator
      await QuizServices.remove(threeWords);
      return reply.code(204).send();
    } else {
      return reply.code(403).send();
    }
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
};

export const collateQuiz = async function (request, reply) {
  /**
   * Return quiz data to be displayed
   */
  if (!request.params.threeWords) {
    return reply.code(400).send();
  }
  try {
    // Collate quiz, questions & options
    let { threeWords } = request.params;
    let query = {
      where: {
        three_words: threeWords // filter by three_words
      },
      attributes: ['title', 'start', 'status', 'config'],
      include: [
        {
          model: db.question, // include questions (of quiz)
          attributes: {
            exclude: ['created_at', 'updated_at', 'three_words', 'username']
          },
          as: 'questions',
          include: [
            {
              model: db.option, // include options (of question)
              attributes: {
                exclude: ['three_words', 'username', 'number']
              },
              as: 'options'
            }
          ]
        }
      ],
      order: [[db.question, 'number', 'ASC']],
      raw: false,
      plain: true,
      nest: true
    };
    let cursor = await QuizServices.find(query);
    let data = await cursor.toJSON();
    if (data === undefined || data === null || data === {} || data === []) {
      return reply.code(404).send();
    }
    return reply.code(200).send(data);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
};

// async function evaluateQuizHandler(request, reply) {
//   try {
//     if (request.method === 'GET') {
//       // Get data for manual evaluation
//       let { threeWords } = request.params;
//       // let quizDoc = _.pick(await Quiz.get(threeWords), [
//       //   "three_words",
//       //   "title"
//       // ]);
//       // let questions = await getQuestionsOfQuiz(threeWords);
//       // let responses = await getResponsesOfQuiz(threeWords);
//       // let result = {
//       //   ...quizDoc,
//       //   questions,
//       //   responses
//       // };
//       // return reply.code(202).send(result);
//       let docs = await Quiz.find({
//         where: {
//           three_words: threeWords
//         },
//         attributes: ['title', 'duration', 'file_upload', 'is_live'],
//         include: [
//           {
//             model: db.question,
//             attributes: {
//               exclude: [
//                 'created_at',
//                 'updated_at',
//                 'three_words',
//                 'username'
//               ]
//             },
//             as: 'questions',
//             include: [
//               {
//                 model: db.option,
//                 attributes: {
//                   exclude: [
//                     'three_words',
//                     'username',
//                     'number'
//                   ]
//                 },
//                 as: 'options'
//               },
//               {
//                 model: db.answer,
//                 attributes: {
//                   exclude: [
//                     'three_words',
//                     'username',
//                     'number'
//                   ]
//                 },
//                 as: 'answers'
//               }
//             ]
//           },
//           {
//             model: db.response,
//             attributes: {
//               exclude: [
//                 'created_at',
//                 'updated_at',
//                 'three_words',
//                 'username'
//               ]
//             },
//             as: 'responses'
//           }
//         ],
//         order: [[db.question, 'number', 'ASC']],
//         raw: false,
//         plain: true,
//         nest: true
//       });
//       return reply.code(200).send(docs);
//     } else if (request.method === 'POST') {
//       // Submit data for manual evaluation
//       return reply.code(202).send();
//     } else {
//       // Request auto-evaluation
//       let { threeWords } = request.params;
//       if (await autoEvaluatable(threeWords)) {
//         return reply.code(202).send(true);
//       }
//       return reply.code(406).send();
//     }
//   } catch (e) {
//     request.log.error(e);
//     return reply.code(500).send();
//   }
// }
