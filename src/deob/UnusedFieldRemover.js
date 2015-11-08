import * as _ from 'lodash';
const FieldInstruction = require('jvm/lib/core/jvm/instructions/FieldInstruction');

let visitKey = (owner, name, desc) => [owner, name, desc].join('.');


let findUsedFields = (jar) => {
  let count = 0;
  let visited = new Set();

  for (let [name, cls] of jar) {
    _.each(cls.methods, (m => m.instructions.forEach(insn => {
      if (insn instanceof FieldInstruction) {
        let key = visitKey(insn.owner, insn.name, insn.desc);
        visited.add(key);

        let parent = jar._classes.get(insn.owner);
        while ( !! parent) {
          parent = jar._classes.get(parent.superName);
          if ( !! parent && parent.superName !== 'java/lang/Object') {
            visited.add(visitKey(parent.name, insn.name, insn.desc));
          }
        }
      }
    })));
  }

  return visited;
}

let removeUnusedFields = (jar) => {
  let start = _.now();
  let removed = 0;
  let originalFieldCount = 0;
  let referencedFields = findUsedFields(jar);
  for (let [name, cls] of jar) {
    let orig = cls.fields.length;
    originalFieldCount += orig;
    cls._fields = cls.fields.filter((field) => referencedFields.has(visitKey(name, field.name, field.desc)));
    removed += (orig - cls.fields.length);
  }

  console.log('Removed %d unused fields (%d/%d referenced fields) in %ds', removed, (originalFieldCount - removed), originalFieldCount, (_.now() - start) / 1000.0);

  return jar;
}

export {
  removeUnusedFields
};
