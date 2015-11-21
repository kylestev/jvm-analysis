import * as _ from 'lodash';

export const TypeMap = {
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
    this.timers = [];
    this.classes = new Map();
    this.fields = new Map();
  }

  identifyField(clazz, info) {
    if ( ! this.fields.has(clazz)) {
      this.fields.set(clazz, []);
    }
    this.fields.get(clazz).push(info);
  }

  record(name, fn) {
    let timer = { name };
    timer.start = process.hrtime();
    fn();
    timer.end = process.hrtime(timer.start);

    let [elapsedSeconds, elapsedNanos] = timer.end;
    timer.elapsed = (elapsedSeconds + (elapsedNanos / 1000000000));

    this.timers.push(timer);
  }

  toObject() {
    let hooks = {};
    for (let [identified, name] of this.classes) {
      hooks[identified] = {
        name: name,
        fields: (this.fields.get(identified) || []).map((field) => {
          let desc = field.desc;
          let arrs = desc.lastIndexOf('[') + 1;
          desc = desc.slice(arrs);
          if (desc in TypeMap) {
            desc = TypeMap[desc];
          }

          if (desc[0] === 'L') {
            desc = desc.slice(1).replace(/\//g, '.').slice(0, desc.length - 2);
          }

          field.desc = desc + _.repeat('[]', arrs);

          return field;
        })
      };
    }

    let timeline = _.object(this.timers.map((timer) => {
      return [ timer.name, timer.elapsed ];
    }));

    return { hooks, timeline };
  }

  print() {
    let clsLookup = {};
    for (let [name, obj] in this.classes) {
      clsLookup[obj.name] = name;
    }

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
        } else if (desc in clsLookup) {
          desc = clsLookup[desc];
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
