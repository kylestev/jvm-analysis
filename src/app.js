import * as _ from 'lodash';
import { Jar } from 'jvm';

import { Hook } from './analysis/Hook';
import { Context } from './analysis/Context';

let patchClasses = (jar) => {
  for (let [name, cls] of jar) {
    cls.fieldTypes = () => {
      return _.unique(_.pluck(cls.fields, 'desc')).length;
    };
    cls.fieldCount = (desc) => {
      return cls.fields.filter(f => f.desc === desc).length;
    };
    cls.findField = (desc) => {
      return _.find(cls.fields, (f) => f.desc === desc);
    }
  }

  return jar;
};

let buildHooks = (ctx) => {
  let hooks = _.map(require('../hooks'), (def, name) => new Hook(ctx, name, def));
  return _.sortBy(hooks, (hook) => hook.dependsOn.length);
}

Jar.unpack(process.argv[2])
  .then(patchClasses)
  .then((jar) => {
    let ctx = new Context(jar);
    let hooks = buildHooks(ctx);

    ctx.log.record(() => {
      _.each(hooks, (hook) => {
        if ( ! hook.canRun()) {
          console.log(':(', hook.name)
          return;
        }

        for (let [name, cls] of jar) {
          if (hook.run(cls)) {
            break;
          }
        }
      });
    });

    return ctx;
  })
  .then((ctx) => {
    ctx.log.print();
  })
  .catch(console.error.bind(console));
