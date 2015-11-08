import { UpdaterLog } from './UpdaterLog';

class Context {
  constructor(jar) {
    this.log = new UpdaterLog;
  }

  identified(name) {
    return this.log.classes.get(name);
  }

  identify(name, clazz) {
    this.log.classes.set(name, clazz);
  }

  identifyField(clazz, info) {
    this.log.identifyField(clazz, info);
  }
}

export {
  Context
};
