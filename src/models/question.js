'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'question',
    {
      three_words: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      number: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      text: DataTypes.TEXT,
      answer_format: {
        type: DataTypes.ENUM,
        values: [
          'text',
          'mcq',
          'msq'
        ],
        allowNull: false,
        required: true
      },
      weightage: DataTypes.JSON,
      files: DataTypes.ARRAY(DataTypes.STRING(255))
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
