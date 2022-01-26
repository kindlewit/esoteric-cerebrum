/**
 * Complete search util
 */

import { Op } from 'sequelize';

import db from '../orm';
import { SEARCH_LIMITS } from '../config';
import * as UserServices from '../services/user-services';
import * as QuizServices from '../services/quiz-services';
import * as TopicServices from '../services/topic-services';

export const search = async function (term: string) {
  let response = {
    user: [],
    quiz: [],
    topic: []
  }; // Make linear array
  // Searching quiz
  let quizQuery = {
    where: {
      [Op.or]: [
        { description: { [Op.iLike]: `%${term}%` } },
        { title: { [Op.iLike]: `%${term}%` } },
        { username: term }
      ]
    },
    include: [
      {
        model: db.user,
        attributes: ['display_name']
      }
    ],
    attributes: [
      'three_words',
      'title',
      'description',
      'start',
      'username',
      'created_at',
      'updated_at'
    ],
    limit: SEARCH_LIMITS.QUIZ,
    order: [['start', 'DESC']]
  }
  // Searching user
  let userQuery = {
    where: {
      display_name: { [Op.iLike]: `%${term}%` }
    },
    include: [
      {
        model: db.quiz,
        attributes: [
          'three_words',
          'title',
          'description',
          'start',
          'username',
          'created_at',
          'updated_at'
        ]
      }
    ],
    attributes: ['display_name'],
    limit: SEARCH_LIMITS.USER,
    order: [['display_name', 'DESC']]
  }
  // Searching topic
  let topicQuery = {
    where: { text: { [Op.iLike]: `%${term}%` } },
    include: [
      {
        model: db.quiz,
        as: 'quizzes',
        attributes: [
          'three_words',
          'title',
          'description',
          'start',
          'username',
          'created_at',
          'updated_at'
        ]
      }
    ],
    attributes: ['id', 'text'],
    limit: SEARCH_LIMITS.TOPIC,
    order: [['text', 'ASC']]
  }
  let results: any[] = await Promise.all([
    QuizServices.find(quizQuery),
    UserServices.find(userQuery),
    TopicServices.find(topicQuery)
  ])
  response.quiz = results[0].map((q: any) => q.dataValues);
  response.user = results[1].map((q: any) => q.dataValues);
  response.topic = results[2].map((q: any) => q.dataValues);
  return response;
}

export default async function searchHandler(request: any, reply: any) {
  if (!request.query.term) {
    return reply.code(400).send();
  }
  try {
    let { term } = request.query;
    return reply.code(200).send(await search(term));
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
}
