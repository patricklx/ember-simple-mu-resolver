ember-simple-mu-resolver
==============================================================================

Ember Simple Module Unification Resolver
this does not resolve local components and helpers, instead this should
to be used together with [ember-template-component-import](https://github.com/crashco/ember-template-component-import) and [ember-template-helper-import](https://github.com/patricklx/ember-template-helper-imports)
and I suggest to use [ember-template-styles-import](https://github.com/patricklx/ember-template-styles-import)

### Use addon service
```js
@service('myaddon@myservice')
```

### initializers in init folder
in `app.js` add
```js
loadInitializers(App, config.modulePrefix + '/init');
```

### styles in ui folder
```js
new EmberApp({
    trees: {
      styles: 'app/ui/styles'
    },
   ...
```

### index.html in ui folder
add the following to `ember-cli-build.js`
```js
const tree = new Funnel('app/ui', {
    allowEmtpy: true,
    include: ['index.html'],
    destDir: app.name,
    annotation: 'ui to index.html'
  });

  const toArray = app.toArray;
  app.toArray = function () {
    const arr = toArray.call(this);
    arr.push(tree);
    return arr;
  };
```

Installation
------------------------------------------------------------------------------

```
ember install ember-simple-mu-resolver
```


Usage
------------------------------------------------------------------------------

This will automatically setup the resolver


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
