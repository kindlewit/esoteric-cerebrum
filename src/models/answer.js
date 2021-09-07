'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'answer',
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
        type: DataTypes.STRING(1),
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
