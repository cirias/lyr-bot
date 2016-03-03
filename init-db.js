import Word from './src/models/word.js';
import User from './src/models/user.js';
import Update from './src/models/update.js';

console.log('123');

Promise.all([
  User.sync({ force: true }),
  Word.sync({ force: true }),
  Update.sync({ force: true }),
]).then(() => {
  console.log('init database success');
}).catch(console.error);
