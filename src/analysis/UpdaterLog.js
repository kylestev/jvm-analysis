import * as _ from 'lodash';

const TypeMap = {
  D: 'double',
  J: 'long',
  I: 'int',
  Z: 'boolean',
  C: 'char',
  B: 'byte',
  F: 'float',
  S: 'short',
  'Ljava/lang/String;': 'String'
};


class UpdaterLog {
  constructor() {
    this.classes = new Map();
    this.fields = new Map();
    this.start = 0;
    this.end = 0;
  }

  identifyField(clazz, info) {
    if ( ! this.fields.has(clazz)) {
      this.fields.set(clazz, []);
    }
    this.fields.get(clazz).push(info);
  }

  record(fn) {
    this.start = process.hrtime();
    fn();
    this.end = process.hrtime(this.start);
  }

  print() {
    let [elapsedSeconds, elapsedNanos] = this.end;
    let elapsed = (elapsedSeconds + (elapsedNanos / 1000000000));
    for (let [identified, name] of this.classes) {
      console.log('%s implements %s', name, identified);
      let fields = this.fields.get(identified) || [];
      fields.forEach((field) => {
        let desc = field.desc;
        let arrs = desc.lastIndexOf('[') + 1;
        desc = desc.slice(arrs);
        if (desc in TypeMap) {
          desc = TypeMap[desc];
        }

        if (desc[0] === 'L') {
          desc = desc.slice(1).replace(/\//g, '.').slice(0, desc.length - 2);
        }

        desc = desc + _.repeat('[]', arrs);

        console.log('  - %s %s <-- %s', desc, field.name, field.field);
      });
    }
    console.log('ran updater in %ds', elapsed);
  }
}

export {
  UpdaterLog
};
