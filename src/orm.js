'use strict';

const Sequelize = require('sequelize');
const { DB_URI } = require('../config');

const sequelize = new Sequelize(DB_URI, { logging: false });

const db = {
  Sequelize,
  sequelize,
  quiz: require('./models').quiz(sequelize, Sequelize),
  user: require('./models').user(sequelize, Sequelize),
  question: require('./models').question(sequelize, Sequelize),
  response: require('./models').response(sequelize, Sequelize),
  option: require('./models').option(sequelize, Sequelize),
  answer: require('./models').answer(sequelize, Sequelize)
};

// User <=> Quiz
db.user.hasMany(db.quiz, {
  foreignKey: 'username',
  sourceKey: 'username',
  onDelete: 'restrict'
});
db.quiz.belongsTo(db.user, {
  foreignKey: 'username',
  sourceKey: 'username'
});

// Quiz <=> Question
db.quiz.hasMany(db.question, {
  foreignKey: 'three_words',
  sourceKey: 'three_words',
  onDelete: 'cascade'
});
db.question.belongsTo(db.quiz, {
  foreignKey: 'three_words',
  sourceKey: 'three_words'
});

// Quiz <=> Response
db.quiz.hasMany(db.response, {
  foreignKey: 'three_words',
  sourceKey: 'three_words',
  onDelete: 'cascade'
});
db.response.belongsTo(db.quiz, {
  foreignKey: 'three_words',
  sourceKey: 'three_words'
});

// User <=> Response
db.user.hasMany(db.response, {
  foreignKey: 'username',
  sourceKey: 'username',
  onDelete: 'cascade'
});
db.response.belongsTo(db.user, {
  foreignKey: 'username',
  sourceKey: 'username'
});

// Question <=> Response
db.question.hasMany(db.response, {
  foreignKey: 'number',
  sourceKey: 'number'
});
db.response.belongsTo(db.question, {
  foreignKey: 'number',
  sourceKey: 'number'
});

// Quiz <=> Option
db.quiz.hasMany(db.option, {
  foreignKey: 'three_words',
  sourceKey: 'three_words',
  onDelete: 'cascade'
});
db.option.belongsTo(db.quiz, {
  foreignKey: 'three_words',
  sourceKey: 'three_words'
});

// Question <=> Option
db.question.hasMany(db.option, {
  foreignKey: 'number',
  sourceKey: 'number',
  onDelete: 'cascade'
});
db.option.belongsTo(db.question, {
  foreignKey: 'number',
  sourceKey: 'number'
});

// Quiz <=> Answer
db.quiz.hasMany(db.answer, {
  foreignKey: 'three_words',
  sourceKey: 'three_words',
  onDelete: 'cascade'
});
db.answer.belongsTo(db.quiz, {
  foreignKey: 'three_words',
  sourceKey: 'three_words'
});

// Question <=> Answer
db.question.hasMany(db.answer, {
  foreignKey: 'number',
  sourceKey: 'number',
  onDelete: 'cascade'
});
db.answer.belongsTo(db.question, {
  foreignKey: 'number',
  sourceKey: 'number'
});

// Option <=> Answer
db.option.hasMany(db.answer, {
  foreignKey: 'character',
  sourceKey: 'character'
});
db.answer.belongsTo(db.option, {
  foreignKey: 'character',
  sourceKey: 'character'
});

module.exports = db;
