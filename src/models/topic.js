'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'topic',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      text: DataTypes.STRING(100)
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
          fields: ['text']
        }
      ]
    }
  );
};
