import Sequelize from 'sequelize';
import sequelize from '../sequelize.js';

const User = sequelize.define('user', {
  id: {
    field: 'id',
    type: Sequelize.BIGINT,
    primaryKey: true,
  },
  state: {
    field: 'state',
    type: Sequelize.ENUM('normal', 'testing', 'saving'),
    allowNull: false,
    defaultValue: 'normal',
  },
  session: {
    field: 'session',
    type: Sequelize.JSONB,
    allowNull: false,
    defaultValue: {},
    // {
      // testingWordId: <id of word>,
      // savingWord: <the word>,
    // }
  },
}, {
  createdAt: 'create_timestamp',
  updatedAt: 'update_timestamp',
  freezeTableName: true, // Model tableName will be the same as the model name
});

export default User;
