import * as _ from 'lodash';
import { Jar } from 'jvm';

class InheritanceNode {
  constructor(name, _super) {
    this.name = name;
    this._super = _super;
    this.children = {};
  }

  add(child) {
    this.children[child.name] = child;
  }

  get isRoot() {
    return this._super === null;
  }

  toObject() {
    return {
      name: this.name,
      'super': this._super,
      children: _.map(this.children, child => child.toObject())
    };
  }
}

function buildSubclassLookup(jar) {
  let subclasses = {};
  for (let [name, cls] of jar) {
    let _super = cls.superName;
    if ( ! _.has(subclasses, _super)) {
      subclasses[_super] = [];
    }
    subclasses[_super].push(cls.name);
  }
  
  return subclasses;
}

function traverseChildren(subclasses, clazz, _super) {
  let node = new InheritanceNode(clazz, _super);

  if ( ! _.has(subclasses, clazz)) {
    return node;
  }

  subclasses[clazz]
    .map(c => traverseChildren(subclasses, c, clazz))
    .forEach(subnode => node.add(subnode));

  return node;
}

export function buildInheritanceTree(jar) {
  let nodes = [];
  let subclasses = buildSubclassLookup(jar);
  let classes = jar._classes;

  Object.keys(subclasses)
    .forEach(clazz => {
      let _super = null;
      if (classes.has(clazz)) {
        _super = classes.get(clazz).superName;
      }

      let node = new InheritanceNode(clazz, _super);

      subclasses[clazz]
        .map(c => traverseChildren(subclasses, c, clazz))
        .map(subnode => node.add(subnode));

      nodes.push(node);
    });

  return nodes;
}
