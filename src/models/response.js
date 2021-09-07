'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'response',
    {
      three_words: {
        type: DataTypes.TEXT,
        primaryKey: true,
        allowNull: false
      },
      username: {
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
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0
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
