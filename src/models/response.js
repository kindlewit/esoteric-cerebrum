"use strict";

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "response",
    {
      three_words: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.TEXT(100),
        primaryKey: true,
        allowNull: false
      },
      question_number: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      text: Sequelize.TEXT,
      score: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
      }
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true
    }
  );
};
