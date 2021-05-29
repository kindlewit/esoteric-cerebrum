"use strict";

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "question",
    {
      three_words: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      number: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT,
        required: true,
        allowNull: false
      },
      file: Sequelize.STRING,
      weightage: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      answer_format: {
        type: Sequelize.ENUM,
        values: [
          "text",
          "mcq",
          // Upload answer as file
          "multi"
        ],
        allowNull: false,
        required: true
      }
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true
    }
  );
};
