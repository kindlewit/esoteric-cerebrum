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
      meet: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      start: DataTypes.DATE,
      duration: DataTypes.INTEGER,
      file_upload: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      status: {
        type: DataTypes.SMALLINT,
        defaultValue: 0
      },
      username: DataTypes.STRING
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
