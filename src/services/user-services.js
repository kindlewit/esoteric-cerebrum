"use strict";

const _ = require('lodash');
const db = require('../orm');

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[key]) || key === "created_at") {
      _.omit(doc, key);
    }
  }
  if (!_.isNil(doc.duration)) {
    cleanObj.duration = parseInt(doc.duration);
  }
  if (!_.isNil(doc.attended) && _.isString(doc.attended)) {
    cleanObj.attended = doc.attended.split(',');
  }
  return cleanObj;
}

async function create(doc) {
  try {
    doc = sanitize(doc);
    await db.user.create(doc);
    return doc;
  } catch (e) {
    throw Error(e);
  }
}

function list(limit = null, offset = null) {
  return new Promise((resolve, reject) => {
    db.user.findAll({
      offset: offset,
      limit: limit,
      order: [
        ['created_at', 'DESC']
      ],
      raw: true
    })
      .then(docs => resolve(_.cloneDeep(docs)))
      .catch(e => reject(e));
  });
}

function count() {
  return db.user.count();
}

async function listLinked(username, list) {
  if (_.isEmpty(list)) {
    return false;
  }
  try {
    let result = await db.user.findByPk(username, { raw: true });
    if (_.includes(list, "quiz")) {
      let docs = await db.quiz.findAll({
        where: {
          creator: username
        },
        order: [
          ['created_at', 'DESC']
        ],
        attributes: {
          exclude: ['creator', 'url', 'file_upload']
        },
        raw: true
      });
      result.quiz = _.cloneDeep(docs);
    }
    if (_.includes(list, "response")) {
      let docs = await db.response.findAll({
        where: {
          username: username
        },
        order: [
          ['created_at', 'DESC']
        ],
        attributes: {
          exclude: ['username']
        },
        raw: true
      });
      result.response = _.cloneDeep(docs);
    }
    return result;
  } catch (e) {
    throw Error(e);
  }
}

function get(username) {
  if (_.isNil(username)) {
    return false;
  }
  return new Promise((resolve, reject) => {
    db.user.findByPk(username, { raw: true })
      .then(docs => resolve(_.cloneDeep(docs)))
      .catch(e => reject(e));
  });
}

function update(username, changes) {
  if (_.isNil(username) || _.isNil(changes)) {
    return false;
  }
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.user.update(changes, {
      where: {
        username: username
      }
    })
      .then(() => db.user.findByPk(username, { raw: true }))
      .then(doc => resolve(_.cloneDeep(doc)))
      .catch(e => reject(e));
  });
}

function remove(username) {
  if (_.isNil(username)) {
    return false;
  }
  return new Promise((resolve, reject) => {
    db.user.destroy({
      where: {
        username: username
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function removeResponses(username) {
  if (_.isNil(username)) {
    return false;
  }
  return new Promise((resolve, reject) => {
    db.response.destroy({
      where: {
        username: username
      }
    })
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

function purge(username) {
  if (_.isNil(username)) {
    return false;
  }
  return new Promise((resolve, reject) => {
    let query = { where: { username: username } };
    db.user.destroy(query)
      .then(() => db.quiz.destroy(query))
      .then(() => db.response.destroy(query))
      .then(() => resolve(true))
      .catch(e => reject(e));
  });
}

module.exports = {
  create,
  list,
  count,
  listLinked,
  get,
  update,
  remove,
  purge,
  removeResponses
};
