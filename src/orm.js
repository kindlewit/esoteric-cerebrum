'use strict';

import Sequelize from 'sequelize';

import { DB_URI } from './config';
import { quiz, user, question, option, topic, quizTopic } from './models';

const sequelize = new Sequelize(DB_URI?.toString(), { logging: false });
const db = {
  Sequelize,
  sequelize,
  quiz: quiz(sequelize, Sequelize),
  user: user(sequelize, Sequelize),
  question: question(sequelize, Sequelize),
  option: option(sequelize, Sequelize),
  topic: topic(sequelize, Sequelize),
  quizTopic: quizTopic(sequelize)
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

// Quiz <=> Topic
db.quiz.belongsToMany(db.topic, {
  through: db.quizTopic,
  as: 'topics'
});
db.topic.belongsToMany(db.quiz, {
  through: db.quizTopic,
  as: 'quizzes'
});

// db.sequelize.sync({ force: true });

export default db;
