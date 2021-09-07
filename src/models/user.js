'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'user',
    {
      username: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true
      },
      email: {
        type: DataTypes.STRING,
        required: true
      },
      display_name: DataTypes.STRING
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
