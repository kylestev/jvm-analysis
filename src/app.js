import * as _ from 'lodash';
import { Jar } from 'jvm';
const Router = require('koa-route');
const koa = require('koa');

import { Hook } from './analysis/Hook';
import { Context } from './analysis/Context';

const removeUnusedFields = require('./deob/UnusedFieldRemover').removeUnusedFields;

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

export function analyzeJar(file) {
  return Jar.unpack(file)
    .then((jar) => {
      return new Context(jar);
    })
    .then((ctx) => {
      ctx.addTransform('unused_fields', removeUnusedFields);
      ctx.addTransform('patch_classes', patchClasses);
      ctx.applyTransforms();

      return ctx;
    })
    .then((ctx) => {
      let hooks = buildHooks(ctx);

      ctx.log.record('hook_analysis', () => {
        _.each(hooks, (hook) => {
          if ( ! hook.canRun()) {
            console.log(':(', hook.name)
            return;
          }

          for (let [name, cls] of ctx.jar) {
            // console.log(name)
            if (hook.run(cls)) {
              break;
            }
          }
        });
      });

      return ctx;
    })
    // .then((ctx) => {
    //   ctx.log.print();
    //   return ctx;
    // })
    .catch(console.error.bind(console));
}

let path = process.argv[2];
if (path) {
  analyzeJar(path)
    .then((ctx) => {
      console.log(ctx.log.toObject());
    });
} else {
  let app = koa();
  app.use(Router.get('/analyze/:jar', function *(jar) {
    let path = '/Users/kylestevenson/Downloads/jars/' + jar + '.jar';
    yield analyzeJar(path)
      .then((ctx) => {
        this.body = JSON.stringify(ctx.log.toObject());
      });
  }));

  app.listen(9001);
  console.log('now ready for connections at: http://localhost:9001');
}
