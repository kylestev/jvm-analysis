const fs = require('fs');
import * as _ from 'lodash';

class HookLoader {
  constructor() {
    this._hooks = {};
    this._revisions = null;
  }

  all() {
    return this.match({ minRev: 1, maxRev: 200 });
  }

  match(opts = { minRev: 1, maxRev: 200 }) {
    return _.object(this.filter(opts).map(rev => {
      return [rev, this.hooks(rev)];
    }));
  }

  filter(opts = { minRev: 1, maxRev: 200 }) {
    return this.revisions.filter(rev => rev >= opts.minRev && rev <= opts.maxRev);
  }

  get(rev) {
    if ( ! (rev in this._hooks)) {
      this._hooks[rev] = require('../data/hooks/' + rev + '.json');
    }

    return this._hooks[rev];
  }

  hooks(rev) {
    return this.get(rev).classes;
  }

  get revisions() {
    if ( ! this._revisions) {
      this._revisions = _.sortBy(fs.readdirSync('./data/hooks').map(f => +f.split('.')[0]));
    }

    return this._revisions;
  }
}

const Hooks = new HookLoader;

export {
  Hooks
};


