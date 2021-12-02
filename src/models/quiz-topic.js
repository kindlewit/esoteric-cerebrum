'use strict';

module.exports = (sequelize) => {
  return sequelize.define(
    'QuizTopics',
    {},
    { timestamps: false, freezeTableName: true }
  );
};
