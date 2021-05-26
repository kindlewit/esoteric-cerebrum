"use strict";

const Sequelize = require('sequelize');
const config = require('./config');

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

/*
sequelize.sync()
  .then(() => {
    db.user.hasMany(db.quiz, { foreignKey: "creator" }) // 1 user (creator) has N quiz
    db.quiz.belongsTo(db.user, { foreignKey: "creator" }); // 1 quiz belongs to 1 user (creator)
  })
  .then(() => {
    db.quiz.hasMany(db.question, { foreignKey: "three_words" });
    db.question.belongsTo(db.quiz, { foreignKey: "three_words" });
  })
  .then(() => {
    db.quiz.hasMany(db.response, { foreignKey: "three_words" });
    db.response.belongsTo(db.quiz, { foreignKey: "three_words" });
    db.user.hasMany(db.response, { foreignKey: "username" });
    db.response.belongsTo(db.user, { foreignKey: "username" });
    db.question.hasMany(db.response, { foreignKey: "question_number" });
    db.response.belongsTo(db.question, { foreignKey: "question_number" });
  })
  .then(() => {
    db.quiz.hasMany(db.option, { foreignKey: "three_words" });
    db.question.hasMany(db.option, { foreignKey: "question_number" });
    db.option.belongsTo(db.quiz, { foreignKey: "three_words" });
    db.option.belongsTo(db.question, { foreignKey: "question_number" });
  })
  .then(() => {
    db.quiz.hasMany(db.answer, { foreignKey: "three_words" });
    db.question.hasMany(db.answer, { foreignKey: "question_number" });
    db.option.hasOne(db.answer, { foreignKey: "character" });
    db.answer.belongsTo(db.quiz, { foreignKey: "three_words" });
    db.answer.belongsTo(db.question, { foreignKey: "question_number" });
    db.answer.belongsTo(db.option, { foreignKey: "character" });
  })
  .then(() => {
    return sequelize.sync();
  });
*/
// User <=> Quiz
db.user.hasMany(db.quiz, {
  foreignKey: "creator",
  sourceKey: "username"
});
db.quiz.belongsTo(db.user, {
  foreignKey: "creator",
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
  foreignKey: "question_number",
  sourceKey: "number"
});
db.response.belongsTo(db.question, {
  foreignKey: "question_number",
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
  foreignKey: "question_number",
  sourceKey: "number"
});
db.option.belongsTo(db.question, {
  foreignKey: "question_number",
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
  foreignKey: "question_number",
  sourceKey: "number"
});
db.answer.belongsTo(db.question, {
  foreignKey: "question_number",
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
