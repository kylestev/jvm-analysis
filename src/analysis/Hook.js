import * as _ from 'lodash';

let identityResolver = (ctx, cls, desc) => {
  if (desc[0] !== '@') {
    return desc;
  }

  let type = desc.slice(1);
  if (type === 'self') {
    type = cls.name;
  } else {
    type = ctx.identified(type);
  }

  return type;
}

let descResolver = (ctx, cls, desc) => {
  if (desc[0] !== '@') {
    return desc;
  }
  return 'L' + identityResolver(ctx, cls, desc) + ';';
}

const Matchers = {
  superName: (ctx, cls, value) => {
    return cls.superName === identityResolver(ctx, cls, value);
  },

  fields: (ctx, cls, matchers) => {
    return _.every(matchers, (matcher) => {
      let desc = descResolver(ctx, cls, matcher.desc);

      let count = cls.fieldCount(desc);
      let op = matcher.op || 'eq';
      switch (op) {
        case 'eq':
          return count === matcher.count;
        case 'gt':
          return count > matcher.count;
        case 'gte':
          return count >= matcher.count;
        case 'lt':
          return count < matcher.count;
        case 'lte':
          return count <= matcher.count;
      }
    });
  },

  $fieldTypes: (ctx, cls, count) => {
    return cls.fieldTypes() === count;
  }
}

class Hook {
  constructor(ctx, name, def) {
    this.ctx = ctx;
    this.def = def;
    this.name = name;
  }

  canRun() {
    return _.every(this.dependsOn, (dep) => !! this.ctx.identified(dep));
  }

  get dependsOn() {
    return _.get(this.def, 'after', []);
  }

  run(cls) {
    let match = this.def.$match;
    let matched = _.every(match, (val, name) => {
      return name in Matchers && Matchers[name](this.ctx, cls, val);
    });

    if (matched) {
      this.ctx.identify(this.name, cls.name);

      _.each(this.def.identifies || [], (identity) => {
        if (identity.type === 'field') {
          let found = false;
          let count = cls.fieldCount(identity.$match.desc);
          if (count === 1) {
            found = cls.findField(identity.$match.desc);
          }

          if (found) {
            this.ctx.identifyField(this.name, {
              desc: identity.$match.desc,
              name: identity.name,
              field: found.name
            });
          }
        }
      });
    }
  }
}

export {
  Hook
};
