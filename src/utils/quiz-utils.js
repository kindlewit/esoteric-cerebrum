"use strict";

const _ = require('lodash');
const db = require('../orm');
const generateThreeWords = require('./word-gen').generateThreeWords;

class Quiz {
  static sanitize(doc) {
    let cleanObj = _.cloneDeep(doc);
    for (let key in doc) {
      if (_.isNil(doc[key]) || key === "created_at" || key === "three_words") {
        _.omit(doc, key);
      }
    }
    if (!_.isNil(doc.duration)) {
      cleanObj.duration = parseInt(doc.duration);
    }
    if (!_.isNil(doc.topics) && _.isString(doc.topics)) {
      cleanObj.topics = doc.topics.split(',');
    }
    return cleanObj;
  }

  static async create(doc) {
    try {
      doc = this.sanitize(doc);
      doc.three_words = generateThreeWords("-");
      await db.quiz.create(doc);
      return doc;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static list(count = false) {
    if (count) {
      return db.quiz.count();
    }
    return db.quiz.findAll({ raw: true })
      .then(() => _.cloneDeep(docs))
      .catch(e => {
        console.error(e);
        return false;
      });
  }

  static get(threeWords) {
    if (_.isNil(threeWords)) {
      return false;
    }
    return db.quiz.findByPk(threeWords, { raw: true })
      .then((doc) => _.cloneDeep(doc))
      .catch(e => {
        console.error(e);
        return false;
      });
  }

  static update(threeWords, changes) {
    if (_.isNil(threeWords) || _.isNil(changes)) {
      return false;
    }
    changes = this.sanitize(changes);
    return db.quiz.update(changes, {
      where: {
        three_words: threeWords
      }
    })
      .then(() => db.quiz.findByPk(threeWords, { raw: true }))
      .then(doc => _.cloneDeep(doc))
      .catch(e => {
        console.error(e);
        return false;
      });
  }

  static delete(threeWords) {
    if (_.isNil(threeWords)) {
      return false;
    }
    return db.quiz.destroy({
      where: {
        three_words: threeWords
      }
    })
      .then(() => true)
      .catch(e => {
        console.error(e);
        return false;
      });
  }
  static deleteLinks(threeWords) {
    if (_.isNil(threeWords)) {
      return false;
    }
    let query = { where: { three_words: threeWords } };
    return db.quiz.destroy(query)
      .then(() => db.question.destroy(query))
      .then(() => db.response.destroy(query))
      .then(() => db.option.destroy(query))
      .then(() => db.answer.destroy(query))
      .then(() => true)
      .catch(e => {
        console.error(e);
        return false;
      });
  }
}

module.exports = Quiz;
