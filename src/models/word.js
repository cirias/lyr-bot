import Sequelize from 'sequelize';
import sequelize from '../sequelize.js';

const Word = sequelize.define('word', {
  id: {
    field: 'id',
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    field: 'user_id',
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  word: {
    field: 'word',
    type: Sequelize.STRING,
    allowNull: false,
  },
  context: {
    field: 'context',
    type: Sequelize.STRING,
  },
  passes: {
    field: 'passes',
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  testTimestamp: {
    field: 'test_timestamp',
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  testJournal: {
    field: 'test_journal',
    type: Sequelize.ARRAY(Sequelize.JSONB),
    allowNull: false,
    defaultValue: [
    // {
      // when: Date.now(),
      // pass: true,
    // }
    ],
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'word'],
    },
  ],
  createdAt: 'create_timestamp',
  updatedAt: 'update_timestamp',
  freezeTableName: true, // Model tableName will be the same as the model name
});

export default Word;
