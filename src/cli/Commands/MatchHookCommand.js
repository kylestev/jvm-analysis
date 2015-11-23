import * as _ from 'lodash';
import { Hooks } from '../../Hooks';
import { Command } from './Command';

class MatchHookCommand extends Command {
  static action() {
    return 'match';
  }

  get headers() {
    return ['Revision', 'Class', 'Name', 'Descriptor'];
  }

  parseOpts() {
    let opts = {
      minRev: +this.parameter('min-rev', 1),
      maxRev: +this.parameter('max-rev', 200)
    };

    if (this.parameter('between')) {
      let [minRev, maxRev] = this.parameter('between').split(',');
      opts.minRev = +minRev;
      opts.maxRev = +maxRev;
    }

    return opts;
  }

  findHooks(ident, name, opts) {
    return _.object(_.map(Hooks.match(opts), (log, rev) => {
      let cls = log[ident];
      if (name in cls.fields) {
        let hook = cls.fields[name];
        return [rev, {
          'class': cls.name,
          name: hook.name,
          desc: hook.desc
        }];
      }
      return false;
    }).filter(h => !! h));
  }

  handle() {
    let [ident, name] = this.parameter('hook').split('.');

    _.each(this.findHooks(ident, name, this.parseOpts()), (hook, rev) => {
      let row = [rev, hook['class'], hook.name, hook.desc];
      this.addRow(row);
    });

    this.printTable();
  }
}

export function resolve() {
  return MatchHookCommand;
};
