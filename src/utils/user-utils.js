"use strict";

const _ = require('lodash');
const db = require('../orm');

class User {
  static sanitize(doc) {
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

  static async create(doc) {
    try {
      doc = this.sanitize(doc);
      await db.user.create(doc);
      return doc;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static list(count = false) {
    if (count) {
      return db.user.count();
    }
    return db.user.findAll({ raw: true })
      .then(docs => _.cloneDeep(docs))
      .catch(e => {
        console.error(e);
        return false;
      });
  }

  static get(username) {
    if (_.isNil(username)) {
      return false;
    }
    return db.user.findByPk(username, { raw: true })
      .then(doc => _.cloneDeep(doc))
      .catch(e => {
        console.error(e);
        return false;
      });
  }

  static update(username, changes) {
    if (_.isNil(username) || _.isNil(changes)) {
      return false;
    }
    changes = this.sanitize(changes);
    return db.user.update(changes, {
      where: {
        username: username
      }
    })
      .then(() => db.user.findByPk(username, { raw: true }))
      .then(doc => _.cloneDeep(doc))
      .catch(e => {
        console.error(e);
        return false;
      });
  }

  static delete(username) {
    if (_.isNil(username)) {
      return false;
    }
    return db.user.destroy({
      where: {
        username: username
      }
    })
      .then(() => true)
      .catch(e => {
        console.error(e);
        return false;
      });
  }

  static deleteLinks(username) {
    if (_.isNil(username)) {
      return false;
    }
    let query = { where: { username: username } };
    return db.user.destroy(query)
      .then(() => db.quiz.destroy(query))
      .then(() => db.response.destroy(query))
      .then(() => true)
      .catch(e => {
        console.error(e);
        return false;
      });
  }
}

module.exports = User;
