'use strict';

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    'user',
    {
      username: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
      },
      email: {
        type: Sequelize.STRING,
        required: true
      },
      display_name: Sequelize.STRING,
      attended: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      }
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
