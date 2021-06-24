"use strict";

const _ = require('lodash');
const db = require('../orm');

function sanitize(doc) {
  let cleanObj = _.cloneDeep(doc);
  for (let key in doc) {
    if (_.isNil(doc[key]) || key === "created_at") {
      // Cannot insert user-defined created_at nor can it be altered
      _.omit(cleanObj, key);
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

function create(doc) {
  return new Promise((resolve, reject) => {
    db.user.create(sanitize(doc))
    .then(() => db.user.findByPk(doc.username))
    .then(doc => resolve(doc))
    .catch(e => reject(e));
  });
}

function list(limit = null, offset = null) {
  return new Promise((resolve, reject) => {
    let query = {
      offset: offset,
      limit: limit,
      order: [
        ['created_at', 'DESC']
      ],
      attributes: {
        exclude: ['password']
      },
      raw: true
    };
    db.user.findAll(query)
      .then(docs => resolve(_.cloneDeep(docs)))
      .catch(e => reject(e));
  });
}

function count() {
  return db.user.count();
}

function listNames() {
  return new Promise((resolve, reject) => {
    db.user.findAll({
      raw: true,
      attributes: {
        include: ['username']
      }
    })
      .then(docs => resolve(_.chain(docs).cloneDeep().map('username').value()))
      .catch(e => reject(e));
  });
}

function get(username, includePass = false) {
  if (_.isNil(username)) {
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    let query = { raw: true };
    if (!includePass) {
      query.attributes = { exclude: ['password'] };
    }
    db.user.findByPk(username, query)
      .then(docs => resolve(_.cloneDeep(docs)))
      .catch(e => reject(e));
  });
}

async function getLinked(username, list) {
  if (_.isEmpty(list) || _.isNil(username)) {
    throw Error("Missing parameters");
  }
  let userDoc = await db.user.findByPk(username, { raw: true, attributes: { exclude: ['password'] } });
  if (_.isEmpty(userDoc)) {
    return {};
  }
  let result = { ...userDoc };
  if (_.includes(list, "quizzes")) {
    let query = {
      where: {
        username: username
      },
      order: [
        ['created_at', 'DESC']
      ],
      attributes: {
        exclude: ['username', 'url', 'file_upload']
      },
      raw: true
    };
    let docs = await db.quiz.findAll(query);
    result.quizzes = !_.isEmpty(docs) ? _.cloneDeep(docs) : [];
  }
  if (_.includes(list, "responses")) {
    let query = {
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
    };
    let docs = await db.response.findAll(query);
    result.responses = !_.isEmpty(docs) ? _.cloneDeep(docs) : [];
  }
  return result;
}

function update(username, changes) {
  if (_.isNil(username) || _.isNil(changes)) {
    throw Error("Missing parameters");
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
    throw Error("Missing parameters");
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
    throw Error("Missing parameters");
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
    throw Error("Missing parameters");
  }
  return new Promise((resolve, reject) => {
    let query = {
      where: {
        username: username
      }
    };
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
  listNames,
  get,
  getLinked,
  update,
  remove,
  purge,
  removeResponses
};
