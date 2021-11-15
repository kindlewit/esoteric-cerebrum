'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'quiz',
    {
      three_words: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false
      },
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      topics: DataTypes.ARRAY(DataTypes.SMALLINT.UNSIGNED),
      start: DataTypes.DATE,
      status: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0
      },
      username: DataTypes.STRING,
      config: DataTypes.JSON
      // JSON will contain: meet, duration, file_upload
    },
    {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      freezeTableName: true,
      indexes: [
        {
          fields: ['start']
        },
        {
          fields: ['username']
        },
        {
          fields: ['topics']
        }
      ]
    }
  );
};
