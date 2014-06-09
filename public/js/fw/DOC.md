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
4.  [Routing / Dispatching](#routing--dispatching)
5.  [Request](#request)
6.  [Controllers](#controllers)
    -   [Common Controllers](#common-controllers)
    -   [State Controllers](#state-controllers)
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


@TODOS
======

-   `config.states`: rename attribute `controller` to `command` - DONE






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
//  public/js/app.js

//  copy window.Env in a new object
var env = _.extend({}, window.Env);

//  erase the old window.Env object (this reference should not be used directly inside the application)
delete window.Env;

//  get `app` config, and then...
Georgette.initialize(app, env);
```

`env` is and should never be used directly inside the framework, but is available and can be consumed in final users controllers or plugins


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

consume this file as a dependency in the `app.js` file to bootstrap Georgette.

```javascript
//  public/js/app.js
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

- [State controllers](#state-controllers)

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


Initialization
==============


Routing / Dispatching
=====================

While the Backbone's router is available in controllers (`this.router`), the naviagation is mainly handled by native behavior of the browser, and Backbone router implementation on hash change. Links must be written in templates, allowing deep linking. The Backbone's `Router.navigate` method should only be used for actions forwarding or redictions (`{ trigger: true }`)

When a route is triggered on hash change (@TODO : add a catch all route to handle 404 response), the Router creates a `Request` object for the given route and publish an event (`router:change`)

_Notes on events: all Georgette internal events are share through a `PubSub` instance which is accessible in `Georgette.com` namespace. A list of internal events is available in Appendix A [Events](#events)_

This event is a good entry point to create plugins for analytics.

The `dispatcher` listen this event and receive the partial `request` object, its purporse is to find which state is associated to this route, instanciate controllers and trigger the requested action.

The `dispatcher` keeps track of the previous route to define if a new controller must be instanciated or if the previous controller should be reused. It also define which part of the action (`show`, `update` or `close`) should be triggered based on the last route

    _Example:_

    Assuming a first route associated with the command `main:blog` and an url parameter `blogId` with value 4, the controller `MainController` is instanciated and is method `blog.show` is triggered

    In a second time, the url parameter `blogId` changes to 2. The instance of mainController is reused, but as the command didn't change, the method triggered is `blog.update` with a new `request` object containing the updated parameters.

    Finally, the route changes to the command `newsletter:subscribe`:
    -   a new controller `NewsletterController` is instanciated
    -   the method `blog.close` is triggered on the `MainController` which is then destroyed (`destroy` method is called).
    -   finally the method `subscribe.show` is called on the new `NewsletterController` instance with a new `request` object


Request
=======

Each time an action is called, it receive a `request` object as parameter. This object is a parameter bag grouping all available informations about the current route.

```javascript
//  anatomy of a `request` object
request = {
    //  original parameters created by Backbone's route
    originalParams: Array
    //  based on `config.states` informations
    command: {
        controller: 'main-controller',
        action: 'home'
    }
    //  controllers: Object - not used for the moment
    //  window.location.hash
    hash: "#home"
    //  mapped object url parameter
    //  for a given state, if route definition is 'content/:id'
    //  and actual hash is `#content/16`
    //  the params object would be populated with { id: 16 }
    //  this object is merged with the defaults defined in the state config
    params: Object
    //  a mapped object of the query parameters:
    //  for the url `index.html?param=abcd#home`, the query object
    //  would be { param: 'abcd' }
    query: Object
    //  a reference to the definition of the state. Should be considered as
    //  read-only at it is a reference, but could probably be altered for
    //  some specific use case
    state: Object
}
```


Controllers
===========

Controllers must extend `Georgette.AbstractController`

The controllers are supposed to be a layer between router and views, this is the place where business logic must be done and views instanciated. This allow to have a better separation of concern, while keeping views simple and reusable. It also permit to dispatch the work in the team based on tasks and specializations more easily.

It receives as dependencies the instances of : `layout`, `com`, `services` (all registered plugins) and the `assetsManager` if assets loading is configured.

#### `initialize()`

called when the object is instanciated

#### `destroy()`

called when the object is destroyed

#### `beforeAction(request, previousRequest)`

this method is called before each action of the current controller and received the same params as a standart action method

#### `actions`

this object is main purpose of the controller, it defines all the actions for this controller as well as their 3 possible behaviors (`show`, `update`, `close`). Each of these methods receive as parameter the current `request` object and the previous `request` object.

```javascript
//  app/controller/main-controller.js
var MainController = Georgette.AbstractController.extend({
    initialize: function(options) {
        // ...
    },

    actions: {
        home: {
            show: function(request, prevRequest) {
                var homeView = new HomeView({
                    model: new Backbone.Model({ id: request.params.id });
                });
                var region = this.layout.getRegion('main');
                var transition = region.createTransition(true);
                transition.show(homeView);
            },
            update: function(request, prevRequest) {
                var homeView = this.layout.getRegion('main').getView();
                // the view is binded to its model and then updated
                homeView.model.set('id', request.params.id);
            },
            close: function(request, prevRequest) {
                // clean subscriptions, etc...
            }
        },
        // ...
    }
});
```

While the syntax for `actions` can looks odd, it offers a good way to group related logic. The context inside actions is ketp to the current controller so any controller attribute can be accessed the way we expect.


### Common Controllers

Common Controllers are a special type of controllers wich are not related to a state, so it's not related to the config object neither. All the actions defined in these controllers are triggered on each requests. Should be used for common parts of the website such as header, nav, footer...

The foolowing example show how to update the header or the navigation according to the current state.

Note: as a matter of fact, the `show` method is only called once, then the action is always updated.

```javascript
// app/controllers/common-controller.js
actions: {
    header: {
        show: function(request, prevRequest) {
            var headerView = new HeaderView({
                model: new Backbone.Model({ state: request.state.id });
            });

            var transition = this.layout.createTransition('header', true);
            transition.show(headerView);
        },
        update: function(request, prevRequest) {
            var headerView = this.layout.getRegion('header').getView();
            // update through model
            headerView.model.set('state', request.state.id);
        }
    },
    // ...
}
```

Common Controllers are registered in Georgette.Configure

_(@TODO should allow array as well as object, controller id will never be used)_

```javascript
Georgette.configure({
    // ...
    commonControllers: {
        'commonController': CommonController
    },
    // ...
})
```

### State Controllers

State controllers are bound to a state. they are instanciated and triggered according to the application current state and the application configuration.

These controllers are registered this way, the `key` (its `id`) of the controller must match the first part of the `command` defined in the state configuration:

```javascript
//  app-config.js
states: {
    home: {
        command: 'static-controller::home'
    }
}

//  app.js
Georgette.configure({
    controllers: {
        'static-controller': StaticController
    },
});
```

See also:

-   (cf. [Routing - Dispatching](#routing--dispatching))










