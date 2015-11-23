const fs = require('fs');
import * as _ from 'lodash';

let findCommands = () => {
  return _.object(fs.readdirSync(__dirname)
    .map(cmd => require('./' + cmd))
    .filter(mod => 'resolve' in mod)
    .map(mod => {
      let command = mod.resolve();
      return [command.action(), command];
    }));
}

const CommandLookup = findCommands();

export {
  CommandLookup
};
