import { InvalidUpdateError } from './errors.js';

export default class UpdateHandler {
  constructor() {
    this.methods = new Map();
  }
  register(state, cmd, method) {
    if (this.methods.has(state)) {
      const stateMethods = this.methods.get(state);
      if (stateMethods.has(cmd)) {
        stateMethods.get(cmd).push(method);
      } else {
        stateMethods.set(cmd, [method]);
      }
    } else {
      this.methods.set(state, new Map([[cmd, [method]]]));
    }
  }
  async handle(update) {
    // Ignore `inline_query`
    if (update.message === undefined) {
      throw new InvalidUpdateError('update.message is undefined');
    }

    // Sender, can be empty for messages sent to channels
    if (update.message.from === undefined) {
      throw new InvalidUpdateError('update.message.from is undefined');
    }

    // Ignore no text situation
    if (update.message.text === undefined) {
      throw new InvalidUpdateError('update.message.text is undefined');
    }

    const text = update.message.text;

    let result = update;

    for (const [state, stateMethods] of this.methods) {
      if (state === true || state === result._state) {
        for (const [cmd, methods] of stateMethods) {
          if (cmd === true
              || (typeof cmd === 'string' && cmd === text)
              || (cmd instanceof RegExp && cmd.test(text))) {
            for (const method of methods) {
              result = await method(result);
            }
          }
        }
      }
    }

    return result;
  }
}
