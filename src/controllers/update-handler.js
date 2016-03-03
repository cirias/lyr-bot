import User from '../models/user.js';
import Word from '../models/word.js';
import Update from '../models/update.js';
import _ from 'lodash';
import UpdateHandler from '../update-handler.js';
import { InvalidUpdateError, NoWordAvaliableError } from '../errors.js';
import sequelize from '../sequelize.js';

async function createUpdate(update) {
  await Update.create({
    id: update.update_id,
    data: update,
  });
  return update;
}

async function getUser(update) {
  const [user] = await User.findOrCreate({ where: { id: update.message.from.id } });
  const result = update;
  result._user = user;
  return result;
}

async function setState(update) {
  const result = update;
  result._state = result._user.state;
  return result;
}

async function start(update) {
  const result = update;
  result._reply = {
    method: 'sendMessage',
    chat_id: update.message.chat.id,
    text: `Welcome!`,
  };
  return result;
}

async function help(update) {
  const result = update;
  result._reply = {
    method: 'sendMessage',
    chat_id: update.message.chat.id,
    parse_mode: 'Markdown',
    text: `
- /new [word...] - add new word
- /test - start test`,
  };
  return result;
}

async function newWord(update) {
  const words = update.message.text.match(/"[^"]+"|\S+/g).map(word => _.trim(word, '"'));
  words.shift();
  const promises = words.map(word => Word.findOrCreate({
    where: {
      word,
      userId: update._user.id,
    },
  }).all());

  await Promise.all(promises);

  const result = update;
  result._reply = {
    method: 'sendMessage',
    chat_id: update.message.chat.id,
    text: 'Saved',
  };
  return result;
}

async function testAWord(update) {
  const word = await Word.findOne({
    where: {
      userId: update._user.id,
    },
    order: 'passes ASC, test_timestamp ASC',
  });

  if (!word) {
    throw new NoWordAvaliableError('word not found');
  }

  const result = update;
  result._user.session = _.defaults({ testingWordId: word.id }, result._user.session);
  result._reply = {
    method: 'sendMessage',
    chat_id: update.message.chat.id,
    text: `Do you remeber \`${word.word}\`?`,
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [['Yes'], ['No'], ['Quit']],
      resize_keyboard: true,
    },
  };
  return result;
}

async function startTest(update) {
  const user = update._user;

  user.state = 'testing';

  return update;
}

async function yes(update) {
  await Word.update({
    passes: sequelize.literal('passes +1'),
    testTimestamp: new Date(),
    testJournal: sequelize.fn('array_append', sequelize.col('test_journal'), JSON.stringify({
      when: Date.now(),
      pass: true,
    })),
  }, {
    where: {
      id: update._user.session.testingWordId,
    },
  });
  return update;
}

async function no(update) {
  await Word.update({
    passes: sequelize.literal('passes -1'),
    testTimestamp: new Date(),
    testJournal: sequelize.fn('array_append', sequelize.col('test_journal'), JSON.stringify({
      when: Date.now(),
      pass: false,
    })),
  }, {
    where: {
      id: update._user.session.testingWordId,
    },
  });
  return update;
}

async function endTest(update) {
  const user = update._user;

  user.state = 'normal';
  user.session = _.defaults({ testingWordId: null }, user.session);
  await user.save();

  const result = update;
  result._reply = {
    method: 'sendMessage',
    chat_id: update.message.chat.id,
    text: `OK!`,
    reply_markup: {
      hide_keyboard: true,
    },
  };
  return result;
}

async function saveWord(update) {
  await Word.findOrCreate({
    where: {
      word: update.message.text,
      userId: update._user.id,
    },
  });

  const result = update;
  result._reply = {
    method: 'sendMessage',
    chat_id: update.message.chat.id,
    text: 'Saved',
  };
  return result;
}

async function removeWord(update) {
  const words = update.message.text.match(/"[^"]+"|\S+/g).map(word => _.trim(word, '"'));
  words.shift();
  await Word.destroy({
    where: {
      word: {
        $in: words,
      },
      userId: update._user.id,
    },
  });

  const result = update;
  result._reply = {
    method: 'sendMessage',
    chat_id: update.message.chat.id,
    text: 'Removed',
  };
  return result;
}

async function updateUser(update) {
  await update._user.save();
  return update;
}

const Handler = new UpdateHandler();
Handler.register(true, true, createUpdate);
Handler.register(true, true, getUser); // get user for all command
Handler.register(true, true, setState);

Handler.register(true, '/start', start);
Handler.register(true, '/help', help);
Handler.register(true, /^\/new /, newWord);

Handler.register('normal', '/test', testAWord);
Handler.register('normal', '/test', startTest);
Handler.register('normal', '/test', updateUser);

Handler.register('normal', /^\/del /, removeWord);

Handler.register('normal', /^(?!\/)/, saveWord); // match not starting with '/'

Handler.register('testing', 'Yes', yes);
Handler.register('testing', 'Yes', testAWord);
Handler.register('testing', 'Yes', updateUser);

Handler.register('testing', 'No', no);
Handler.register('testing', 'No', testAWord);
Handler.register('testing', 'No', updateUser);

Handler.register('testing', 'Quit', endTest);
Handler.register('testing', 'Quit', updateUser);

function controller(req, res) {
  Handler.handle(req.body).then(result => {
    req.log.info({ reply: result._reply });
    res.status(200).send(result._reply);
  }).catch(err => {
    switch (true) {
      case (err instanceof NoWordAvaliableError):
        const reply = {
          method: 'sendMessage',
          chat_id: req.body.message.chat.id,
          text: `No word avaliable. Add some words first!`,
        };
        res.status(200).send(reply);
        break;
      case (err instanceof InvalidUpdateError):
        res.status(400).send(err);
        break;
      default:
        req.log.error(err);
        res.status(500).send(err);
        break;
    }
  });
}

export default controller;
