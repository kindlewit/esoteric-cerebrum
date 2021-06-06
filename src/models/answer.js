"use strict";

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "answer",
    {
      three_words: {
        type: Sequelize.STRING(100),
        primaryKey: true,
        allowNull: false
      },
      number: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      character: {
        type: Sequelize.STRING(1),
        primaryKey: true,
        allowNull: false
      }
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true
    }
  );
};
