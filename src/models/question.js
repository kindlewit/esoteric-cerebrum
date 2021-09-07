'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'question',
    {
      three_words: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      number: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      text: DataTypes.TEXT,
      file: DataTypes.STRING,
      weightage: {
        type: DataTypes.FLOAT,
        required: true,
        allowNull: false
      },
      answer_format: {
        type: DataTypes.ENUM,
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
