class ExtendableError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.name = this.constructor.name;
  }
}

export class InvalidUpdateError extends ExtendableError {
  constructor(m) {
    super(m);
  }
}

export class NoWordAvaliableError extends ExtendableError {
  constructor(m) {
    super(m);
  }
}
