'use strict';

import db from '../orm';
import { sanitize } from '../utils/user-utils';

function create(doc) {
  return new Promise((resolve, reject) => {
    db.user
      .create(sanitize(doc))
      .then(() =>
        db.user.findByPk(doc.username, {
          attributes: {
            exclude: ['password']
          },
          raw: true
        })
      )
      .then((doc) => resolve(doc))
      .catch((e) => reject(e));
  });
}

function list(limit = null, offset = null) {
  let query = {
    offset,
    limit,
    order: [['created_at', 'DESC']],
    attributes: {
      exclude: ['password']
    },
    raw: false,
    plain: true,
    nest: true
  };
  return db.user.findAndCountAll(query);
}

function count() {
  return db.user.count();
}

function find(query) {
  return db.user.findAll(query);
}

function get(username, includePass = false) {
  return new Promise((resolve, reject) => {
    let query = includePass
      ? { raw: true }
      : {
          attributes: {
            exclude: ['password']
          },
          raw: true
        };
    db.user
      .findByPk(username, query)
      .then((doc) => resolve(doc))
      .catch((e) => reject(e));
  });
}

function getDisplayName(username) {
  return db.user.findByPk(username, {
    attributes: ['display_name'],
    raw: true
  });
}

function update(username, changes) {
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.user
      .update(changes, {
        where: { username }
      })
      .then(() =>
        db.user.findByPk(username, {
          attributes: {
            exclude: ['password']
          },
          raw: true
        })
      )
      .then((doc) => resolve(doc))
      .catch((e) => reject(e));
  });
}

function remove(username) {
  return db.user.destroy(username);
}

function removeQuizzes(username) {
  return db.quiz.destroy({
    where: { username }
  });
}

function removeResponses(username) {
  return db.response.destroy({
    where: { username }
  });
}

function purge(username) {
  return new Promise((resolve, reject) => {
    let query = {
      where: { username }
    };
    db.response
      .destroy(query)
      .then(() => db.quiz.destroy(query))
      .then(() => db.user.destroy(query))
      .then(() => resolve(true))
      .catch((e) => reject(e));
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
