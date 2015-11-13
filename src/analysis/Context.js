import { UpdaterLog } from './UpdaterLog';

class Context {
  constructor(jar) {
    this.jar = jar;
    this.transforms = [];
    this.log = new UpdaterLog;
  }

  addTransform(name, fn) {
    this.transforms.push({ name, fn });
  }

  applyTransforms() {
    let jar = this.jar;
    this.transforms.forEach((transform) => {
      this.log.record(transform.name, function () {
        jar = transform.fn(jar);
      });
    });
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
