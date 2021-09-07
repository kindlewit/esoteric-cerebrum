'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'option',
    {
      three_words: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false
      },
      number: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      character: {
        type: DataTypes.CHAR(1),
        primaryKey: true,
        allowNull: false
      },
      text: DataTypes.TEXT,
      is_answer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true
    }
  );
};
