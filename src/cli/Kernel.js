#!/usr/local/bin/babel-node --harmony

import { CommandLookup } from './Commands';
const args = require('minimist')(process.argv.slice(2));
let action = args._;
let command = CommandLookup[action];
if (command) {
  let handler = new command(args);
  handler.handle();
  console.log(args);
} else {
  console.log('Command %s not recognized!', action);
}
