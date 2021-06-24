"use strict";

const Sequelize = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASS,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: 'postgres'
  }
);

const db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  quiz: require('./models').quiz(sequelize, Sequelize),
  user: require('./models').user(sequelize, Sequelize),
  question: require('./models').question(sequelize, Sequelize),
  response: require('./models').response(sequelize, Sequelize),
  option: require('./models').option(sequelize, Sequelize),
  answer: require('./models').answer(sequelize, Sequelize)
};

// User <=> Quiz
db.user.hasMany(db.quiz, {
  foreignKey: "username",
  sourceKey: "username"
});
db.quiz.belongsTo(db.user, {
  foreignKey: "username",
  sourceKey: "username"
});

// Quiz <=> Question
db.quiz.hasMany(db.question, {
  foreignKey: "three_words",
  sourceKey: "three_words"
});
db.question.belongsTo(db.quiz, {
  foreignKey: "three_words",
  sourceKey: "three_words"
});

// Quiz <=> Response
db.quiz.hasMany(db.response, {
  foreignKey: "three_words",
  sourceKey: "three_words"
});
db.response.belongsTo(db.quiz, {
  foreignKey: "three_words",
  sourceKey: "three_words"
});

// User <=> Response
db.user.hasMany(db.response, {
  foreignKey: "username",
  sourceKey: "username"
});
db.response.belongsTo(db.user, {
  foreignKey: "username",
  sourceKey: "username"
});

// Question <=> Response
db.question.hasMany(db.response, {
  foreignKey: "number",
  sourceKey: "number"
});
db.response.belongsTo(db.question, {
  foreignKey: "number",
  sourceKey: "number"
});

// Quiz <=> Option
db.quiz.hasMany(db.option, {
  foreignKey: "three_words",
  sourceKey: "three_words"
});
db.option.belongsTo(db.quiz, {
  foreignKey: "three_words",
  sourceKey: "three_words"
});

// Question <=> Option
db.question.hasMany(db.option, {
  foreignKey: "number",
  sourceKey: "number"
});
db.option.belongsTo(db.question, {
  foreignKey: "number",
  sourceKey: "number"
});

// Quiz <=> Answer
db.quiz.hasMany(db.answer, {
  foreignKey: "three_words",
  sourceKey: "three_words"
});
db.answer.belongsTo(db.quiz, {
  foreignKey: "three_words",
  sourceKey: "three_words"
});

// Question <=> Answer
db.question.hasMany(db.answer, {
  foreignKey: "number",
  sourceKey: "number"
});
db.answer.belongsTo(db.question, {
  foreignKey: "number",
  sourceKey: "number"
});

// Option <=> Answer
db.option.hasOne(db.answer, {
  foreignKey: "character",
  sourceKey: "character"
});
db.answer.belongsTo(db.option, {
  foreignKey: "character",
  sourceKey: "character"
});

module.exports = db;
