'use strict';

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    'question',
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
      text: Sequelize.TEXT,
      file: Sequelize.STRING,
      weightage: {
        type: Sequelize.FLOAT,
        required: true,
        allowNull: false
      },
      answer_format: {
        type: Sequelize.ENUM,
        values: [
          'text',
          'mcq',
          'multi'
        ],
        allowNull: false,
        required: true
      }
    },
    {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      freezeTableName: true
    }
  );
};
