import * as _ from 'lodash';
const Table = require('cli-table');

class Command {
  constructor(args) {
    this.args = args;
    this.rows = [];
    this.table = null;
  }

  addRow(row) {
    if (this.table === null) {
      this.table = new Table({ head: this.headers });
    }

    this.table.push(row);
  }

  argument(idx) {
    return this.args._[idx];
  }

  parameter(name, _default = false) {
    return this.args[name] || _default;
  }

  printTable() {
    if (this.table === null) {
      console.log('No results!');
    } else {
      console.log(this.table.toString());
    }
  }

  get headers() {
    return [];
  }

  handle() {
    //
  }
}

export {
  Command
};
