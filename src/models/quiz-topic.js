'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'quizTopic',
    {},
    // {
    //   three_words: {
    //     type: DataTypes.STRING(100),
    //     primaryKey: true,
    //     allowNull: false
    //   },
    //   id: {
    //     type: DataTypes.INTEGER,
    //     primaryKey: true,
    //     allowNull: false
    //   }
    // },
    { timestamps: false, freezeTableName: true }
  );
};
