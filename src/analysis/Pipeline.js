import { Context } from './Context';

let timer = (fn) => {
  let start = process.hrtime();
  fn();
};

class Pipeline {
  constructor() {
    this._ctx = new Context;
    this._pipes = new Map();
    this._order = [];
  }

  get context() {
    return this._ctx;
  }

  addCommand(pipe, command) {
    if ( ! this._pipes.has(pipe)) {
      this._order.push(pipe);
      this._pipes.set(pipe, []);
    }

    this._pipes.get(pipe).push(command);
  }

  run(jar) {
    this._order.forEach((pipe) => {
      this._pipes.get(pipe).forEach((command) => {
        command.run(jar, this._ctx);
      });
    });
  }
}

export {
  Pipeline
};
