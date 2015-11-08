import * as _ from 'lodash';

class ClassWrapper {
  constructor(cls) {
    this.cls = cls;
  }

  fieldCount(desc) {
    return this.cls.fields.filter(f => f.desc === desc).length;
  }

  fieldTypes() {
    return _.unique(_.pluck(this.cls.fields, 'desc')).length;
  }
}

export {
  ClassWrapper
};
