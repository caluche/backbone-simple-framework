GEORGETTE JS
============

1.  [Installation and Configuration](#installation-and-configuration)
    -   [Dependencies](#dependencies)
    -   [Installing with bower](#installing-with-bower)
    -   [Configure require.js](#configure-requirejs)
    -   [Minification / Production](#minification--production)
    -   [Environment configuration](#environment-configuration)
    -   [Application configuration](#application-configuration)
3.  Initialization
4.  Routing / Dispatching
5.  Controllers
    -   common controllers
    -   state controllers
6.  Request
7.  Layout
8.  Region
9.  Transition
10. Views
    -   BaseView
    -   ModelView
    -   Loader
11. Plugins
12. Assets
    - configuration
    - Loader


Georgette is an architectural framework build on top of [Backbone](backbonejs.org), it's primary goal is to provide an clean way to organize code by creating a controller layer between `Backbone.Router` and `Backbone.View`s.

Aside, it include some generic features to handle views, cf. `Layout`, `Region` and `Transition` abstractions. We should be able to use these components in a standalone mode, without the whole framework.

The framework can also be extended through the use of plugins and an `AssetManager` is available if an `AssetLoader` plugin is installed

Installation and configuration
==============================

### Dependencies

- underscore
- jquery
- backbone
- whenjs (should probably be replaced for a lighter implementation)
- es5-shim (needed by when.js in IE8-9)
- requirejs (hard dependency - _should be replaced by Grunt or Browserify_)
- PreloadJS (default plugin for assets loading - _optionnal_)

_NOTES:_
- `es6-promise` cannot be used as is, cause it silently fails when an error is thrown in a `then` callback_
- _At that time, Georgette cannot be used without RequireJS._


### Installing with [bower](http://bower.io/#installing-bower)

your `bower.json` configuration file must include these lines

```javascript
//  bower.json
"dependencies": {
    "underscore": "~1.6.0",
    "requirejs": "~2.1.11",
    "requirejs-text": "~2.0.10", // (optionnal but highly recommended)
    "jquery": "~2.1.0",
    "backbone": "~1.1.2",
    "when": "~3.1.0",
    "es5-shim": "~3.4.0"
    "PreloadJS": "*", // (optionnal)
    // add georgette line
}
```

to match your app file system while keeping these config files in the root folder, a `.bowerrc` file can be used

```javascript
// .bowerrc
{
    "directory": "public/js/vendors"
}
```

type the following in a command line prompt to install dependencies

```bash
$   bower install <georgette>
```

cf. [http://bob.yexley.net/creating-and-maintaining-your-own-bower-package/](http://bob.yexley.net/creating-and-maintaining-your-own-bower-package/)

### Configure [require.js](http://requirejs.org/docs/start.html#add)

sample configuration file for `requirejs`

```javascript
//  public/js/bootstrap.js
requirejs.config({
    //  add timestamp on required urls to force resource refresh
    //  (usefull for dev)
    urlArgs: 'bust=' + new Date().getTime(),
    baseUrl: 'js',
    shim: {
        jquery: {
            exports: '$'
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            // exports: 'Backbone'
        },
        fw: {
            deps: ['backbone', 'when']
        },
        createjs: {
            exports: 'createjs'
        }
    },
    packages: [
        { name: 'when', location: 'vendors/when', main: 'when' }
    ],
    paths: {
        jquery: 'vendors/jquery/dist/jquery',
        underscore: 'vendors/underscore/underscore',
        backbone: 'vendors/backbone/backbone',
        text: 'vendors/requirejs-text/text',
        createjs: 'vendors/PreloadJS/lib/preloadjs-0.4.1.min',
        fw: 'fw',   // must be updated
        templates: '../templates'
    },
});
```

### Minification / Production

requirejs offers it's own [minification tools](http://requirejs.org/docs/optimization.html) based on nodejs

`$  npm install -g requirejs`

to configure `r.js`, simply add this file at the root of your project to tell `r.js` to parse your bootstrap file for configuration information, this allow to not duplicate the `requirejs` configuration informations.

```javascript
//  build.js
({
    baseUrl: './public/js',
    name: "bootstrap",
    mainConfigFile: './public/js/bootstrap.js',
    out: "./public/js/app-built.js"
})
```

type the following in a command line prompt to build the project

```bash
$   r.js -o build.js`
```

### Environment configuration

to easily switch environments (from developpment to production servers), the following file should be created in your `js` folder

```javascript
//  public/js/env-config.js.dist
window.Env = {
    name: 'dev',
    minify: false,  // switch the use of minified version
    log: true       // enable/disable logging features
}
```

This file is actually never used by the application, it should be shared in your versionning system, and duplicated to `env-config.js` by each user. The `env-config.js` should inversly be ignored by the versionning system, allowing to keep each environment closed from each others.


At the end of the `index.html`, the following strategy can be used to switch environments according to your own configuration file

```html
<!--
    public/index.html
    (assuming the root directory is properly configured side-side)
-->
<script src="/js/env-config.js"></script>
<script>
    var filepath = window.Env.minify ? '/js/app-built.js' : '/js/boostrap.js';
    document.write('<script src="' + filepath + '"><\/script>');
</script>
```

In you application main file, the `window.Env` can be passed as a second argument of the `Georgette.initialize` method.

```javascript
//  public/js/main.js

//  copy window.Env in a new object
var env = _.extend({}, window.Env);

//  erase the old window.Env object (this reference should not be used directly inside the application)
delete window.Env;

//  get `app` config, and then...
Georgette.initialize(app, env);
```

`env` is and should never be used directly by the framework, but is available and can be consumed in your own controllers or plugins


### Application configuration

The framework configuration can be placed in `js/app-config.js`,

```javascript
//  public/js/app-config.js
define([], function() {
    'use strict';

    return {
        states: {
            // states controllers configuration goes here
        },
        regions: {
            // layout configuration goes here
        },
        shared: {
            // a place to store application specific configration
            // these values should be available in controllers as well
            // as in views and templates (through the `_shared` namespace))
            // @NOTE    still needs to be properly implemented
        }
        assets: {
            // optionnal, cf. AssetLoader plugin for specific configuration of this entry
        },
    }
});
```

consume this file as a dependency in the `main.js` file to bootstrap Georgette.

```javascript
//  public/js/main.js
define(
    [
        'app-config'
    ],
    function(config) {
        // do stuff with `env` configuration
        $(document).ready(function() {
            Georgette.configure({
                // ....
            });

            Georgette.initialize(config, env);
        });
    }
);
```

####    `config.states`

This entry is used to configure each state of your application. It allows to configure the route, controller and action to be called when the route match, and default values for optionnal parameters. An example state configuration could look like the following :

```javascript
states: {
    //  id of the state, is added has the `id` property inside itself
    //  content.id === 'content'
    content: {
        //  describe the route pattern of the state, the value of this entry
        //  is used as is by the `Backbone.Router` instance, any valid
        //  Backbone's route should be considered is a valid route
        route: 'content(/:id)',
        //  `::` separated string to describe which controlleur/action
        //  method should be called when the route is matched
        controller: 'main-controller::content',
        //  optionnal, default values for optionnal parameters of the url
        defaults: { id: 25 }
    },
    // other states configurations...
}
```

see also:

- State controllers

####    `config.regions`

This entry is used to configure the layout instance created by the framework. Here is an example configuration for regions

```javascript
regions: {
    //  the key is the id of the region
    //  while the value is the jquery selector matching the DOM element
    'header': '#header',
    'main': '#main',
    'footer': '#footer'
},
```

see also:

- BaseLayout
- Region








