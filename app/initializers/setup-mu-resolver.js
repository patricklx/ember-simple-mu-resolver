import Resolver from 'ember-resolver';
import { capitalize } from '@ember/string';
import GlimmerComponent from '@glimmer/component';
import EmberComponent from '@ember/component';


const { TemplateOnlyComponent } = require('@glimmer/runtime');

/*
 * Ember Tiny Module Unification Resolver
 * this does not resolve local componentns and helpers, instead this should
 * to be used together with ember-template-component-import and ember-template-helper-import
 */
const resolver = {
  // just to get some autocompletion
  _moduleRegistry: Resolver._moduleRegistry,
  namespace: Resolver.namespace,
  resolveOther: Resolver.resolveOther,
  resolve(name) {
    const root = name.split(':')[1].split('/')[0];
    let al = null;
    const methodName = `resolve${capitalize(name.split(':')[0])}`;
    let result;
    if (this[methodName]) {
      try {
        const parsedName = this.myParseName(name);
        result = this[methodName](parsedName, [root, al]);
        if (result) return result;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }
    }
    return result;
  },

  resolveModule(path, useDefault=true) {
    if (!path) return null;
    if (this._moduleRegistry.has(path)) {
      return useDefault ? this._moduleRegistry.get(path).default : this._moduleRegistry.get(path);
    }
    if (this._moduleRegistry.has(path + '/index')) {
      return useDefault ? this._moduleRegistry.get(path + '/index').default : this._moduleRegistry.get(path + '/index');
    }

    const name = path.split('/').slice(-1)[0];
    const inFile = path.split('/').slice(0, -1).join('/');
    const inFileResolved = this.resolveModule(inFile, false);
    if (inFileResolved) {
      return inFileResolved[name] || null;
    }
    return null;
  },

  resolveService(parsedName) {
    let classicPath;
    if (parsedName.fullNameWithoutType.includes('@')) {
      let [pkg, name] = parsedName.fullNameWithoutType.split('@');
      const muPath = `${pkg}/services/${name}/service`;
      if (this.resolveModule(muPath)) {
        return this.resolveModule(muPath);
      }
      [pkg, name] = parsedName.fullNameWithoutType.split('@');
      classicPath = `${pkg}/services/${name}`;
      if (this.resolveModule(classicPath)) {
        return this.resolveModule(classicPath);
      }
    }
    const prefix = this.namespace.modulePrefix;
    classicPath = `${prefix}/services/${parsedName.fullNameWithoutType}/service`;
    if (this.resolveModule(classicPath)) {
      return this.resolveModule(classicPath);
    }
    classicPath = `${prefix}/services/${parsedName.fullNameWithoutType}`;
    if (this.resolveModule(classicPath)) {
      return this.resolveModule(classicPath);
    }
    return this.resolveOther(parsedName);
  },

  resolveModel(parsedName) {
    let path = '';
    const prefix = this.namespace.modulePrefix;
    path = `${prefix}/data/models/${parsedName.fullNameWithoutType}`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    path = `${prefix}/data/models/${parsedName.fullNameWithoutType}/model`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    return undefined;
  },

  resolveModifier(parsedName) {
    return this.resolveHelper(parsedName);
  },

  resolveHelper(parsedName) {
    let fullNameWithoutType = parsedName.fullNameWithoutType;
    const prefix = this.namespace.modulePrefix;
    const hasSlash = fullNameWithoutType.includes('/');

    let normalizedModuleName = prefix + '/' + fullNameWithoutType;
    if (this.resolveModule(normalizedModuleName)) {
      const module = this.resolveModule(normalizedModuleName);
      return module;
    }

    if (hasSlash && this.resolveModule(fullNameWithoutType)) {
      const module = this.resolveModule(fullNameWithoutType);
      return module;
    }

    return undefined;
  },

  resolveAdapter(parsedName) {
    let fullNameWithoutType = parsedName.fullNameWithoutType;
    const prefix = this.namespace.modulePrefix;
    let path = `${prefix}/data/models/${fullNameWithoutType}/adapter`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    path = `${prefix}/data/adapters/${fullNameWithoutType}`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    return this.resolveOther(parsedName);
  },

  resolveSerializer(parsedName) {
    let fullNameWithoutType = parsedName.fullNameWithoutType;
    const prefix = this.namespace.modulePrefix;
    let path = `${prefix}/data/models/${fullNameWithoutType}/serializer`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    path = `${prefix}/data/serializers/${fullNameWithoutType}`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    return this.resolveOther(parsedName);
  },

  resolveTransform(parsedName) {
    let path = parsedName.fullNameWithoutType;
    const prefix = this.namespace.modulePrefix;
    path = `${prefix}/data/transforms/${path}`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    return this.resolveOther(parsedName);
  },

  resolveController(parsedName) {
    const prefix = this.namespace.modulePrefix;
    let path = `${prefix}/ui/routes/${parsedName.fullNameWithoutType}/controller`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    path = `${prefix}/ui/routes/${parsedName.fullNameWithoutType}/index/controller`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    return this.resolveOther(parsedName);
  },

  resolveRoute(parsedName) {
    let path = parsedName.fullNameWithoutType;
    const prefix = this.namespace.modulePrefix;
    path = `${prefix}/ui/routes/${path}/route`;
    if (this.resolveModule(path)) {
      return this.resolveModule(path);
    }
    return this.resolveOther(parsedName);
  },

  resolveTemplate(parsedName) {
    let path = parsedName.fullNameWithoutType.replace('components/', '');
    let path2 = `${path}/template`;
    if (this.resolveModule(path2)) {
      return this.resolveModule(path2);
    }
    path2 = path.replace('/components/', '/templates/components/');
    if (path2.includes('/templates/components/') && this.resolveModule(path2)) {
      return this.resolveModule(path2);
    }
    const prefix = this.namespace.modulePrefix;
    path2 = `${prefix}/ui/routes/${parsedName.fullNameWithoutType}/template`;
    if (this.resolveModule(path2)) {
      return this.resolveModule(path2);
    }

    path2 = `${prefix}/ui/${path}/template`;
    if (this.resolveModule(path2)) {
      return this.resolveModule(path2);
    }

    path2 = `${prefix}/ui/components/${path}/template`;
    if (this.resolveModule(path2)) {
      return this.resolveModule(path2);
    }
    return this.resolveOther(parsedName);
  },

  resolveComponent(parsedName, suffix='component') {
    let path = parsedName.fullNameWithoutType;
    let path2 = path;
    function checkInstance(instance) {
      if (TemplateOnlyComponent && instance instanceof TemplateOnlyComponent) {
        return true;
      }
      instance = instance.prototype;
      return instance instanceof GlimmerComponent || instance instanceof EmberComponent;
    }
    if (this.resolveModule(path2) && checkInstance(this.resolveModule(path2))) {
      return this.resolveModule(path2);
    }
    path2 = `${path}/${suffix}`;
    if (this.resolveModule(path2) && checkInstance(this.resolveModule(path2))) {
      return this.resolveModule(path2);
    }

    let prefix = this.namespace.modulePrefix;
    path2 = `${prefix}/ui${path}/${suffix}`;
    if (this.resolveModule(path2) && checkInstance(this.resolveModule(path2))) {
      return this.resolveModule(path2);
    }

    path2 = `${prefix}/ui/${path}/${suffix}`;
    if (this.resolveModule(path2) && checkInstance(this.resolveModule(path2))) {
      return this.resolveModule(path2);
    }

    path2 = `${prefix}/ui/components/${path}/${suffix}`;
    if (this.resolveModule(path2) && checkInstance(this.resolveModule(path2))) {
      return this.resolveModule(path2);
    }

    path2 = `${prefix}/${path}/${suffix}`;
    if (this.resolveModule(path2) && checkInstance(this.resolveModule(path2))) {
      return this.resolveModule(path2);
    }

    const withIndex = suffix === 'component' ? this.resolveComponent(parsedName, 'index') : undefined;
    return withIndex || this.resolveOther(parsedName);
  },

  myParseName(name) {
    if (name.includes('/') && !name.includes('@ember-data')) {
      const [, path] = name.split(':');
      return {
        root: {},
        fullName: name,
        fullNameWithoutType: path
      };
    }
    return this.parseName(name);
  }
};

function patch(emberRes, name) {
  const original = emberRes[name];
  emberRes[name] = function(...args) {
    const resolved = original && original.call(this, ...args);
    if (resolved && typeof resolved !== 'string') {
      return resolved;
    }
    if (this._moduleRegistry.has(resolved)) {
      const module = this._moduleRegistry.get(resolved);
      return module;
    }
    return resolver[name].call(emberRes, ...args);
  }
}

export default {
  name: 'setup-template-modifier-resolver',
  initialize: function initialize(application) {
    let emberResolver = application.__registry__.resolver._fallback || application.__registry__.resolver;
    Object.keys(resolver).forEach((k) => {
      if (!k.includes('resolve')) return;
      if (!resolver[k]) return;
      patch(emberResolver, k);
    });
    emberResolver.myParseName = resolver.myParseName;
  }
}
