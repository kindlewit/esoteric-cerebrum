'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'topic',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false
      },
      text: DataTypes.STRING(100)
    },
    {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      freezeTableName: true
    }
  );
};
