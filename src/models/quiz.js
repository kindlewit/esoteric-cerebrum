"use strict";

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "quiz",
    {
      three_words: {
        type: Sequelize.STRING(100),
        primaryKey: true,
        allowNull: false
      },
      url: Sequelize.STRING,
      title: Sequelize.STRING,
      description: Sequelize.TEXT,
      topics: Sequelize.ARRAY(Sequelize.STRING),
      duration: Sequelize.INTEGER,
      file_upload: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_live: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      username: Sequelize.STRING
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
