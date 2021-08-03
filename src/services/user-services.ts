'use strict';

import db from '../orm';
import { sanitize } from '../utils/user-utils';

function create(doc: any): Promise<any> {
  return new Promise((resolve, reject) => {
    db.user.create(sanitize(doc))
      .then(() => db.user.findByPk(doc.username, {
        attributes: {
          exclude: ['password']
        },
        raw: true
      }))
      .then((doc: object) => resolve(doc))
      .catch((e: object) => reject(e));
  });
}

function list(limit: number | null = null, offset: number | null = null): Promise<any> {
  let query = {
    offset,
    limit,
    order: [
      ['created_at', 'DESC']
    ],
    attributes: {
      exclude: ['password']
    },
    raw: false,
    plain: true,
    nest: true
  };
  return db.user.findAndCountAll(query);
}

function count(): Promise<any> {
  return db.user.count();
}

function find(query: object): Promise<any> {
  return db.user.findAll(query);
}

function get(username: string, includePass: boolean = false): Promise<any> {
  return new Promise((resolve, reject) => {
    let query = includePass
      ? { raw: true }
      : {
        attributes: {
          exclude: ['password']
        },
        raw: true
      };
    db.user.findByPk(username, query)
      .then((doc: any) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

function getDisplayName(username: string): Promise<any> {
  return db.user.findByPk(username, {
    attributes: ['display_name'],
    raw: true
  });
}

function update(username: string, changes: object): Promise<any> {
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.user.update(changes, {
      where: { username }
    })
      .then(() => db.user.findByPk(username, {
        attributes: {
          exclude: ['password']
        },
        raw: true
      }))
      .then((doc: object) => resolve(doc))
      .catch((e: any) => reject(e));
  });
}

function remove(username: string): Promise<any> {
  return db.user.destroy(username);
}

function removeQuizzes(username: string): Promise<any> {
  return db.quiz.destroy({
    where: { username }
  });
}

function removeResponses(username: string): Promise<any> {
  return db.response.destroy({
    where: { username }
  });
}

function purge(username: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let query = {
      where: { username }
    };
    db.response.destroy(query)
      .then(() => db.quiz.destroy(query))
      .then(() => db.user.destroy(query))
      .then(() => resolve(true))
      .catch((e: any) => reject(e));
  });
}

export default {
  create,
  list,
  count,
  find,
  get,
  getDisplayName,
  update,
  remove,
  removeQuizzes,
  removeResponses,
  purge
};
