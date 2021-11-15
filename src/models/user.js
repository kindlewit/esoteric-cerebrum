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
      password: DataTypes.STRING, // NULLable with Google login
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
      updatedAt: 'updated_at',
      freezeTableName: true,
      indexes: [
        {
          unique: true,
          fields: ['email']
        }
      ]
    }
  );
};
