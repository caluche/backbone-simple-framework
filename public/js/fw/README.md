Georgette
============================================

Georgette is an architectural framework build on top of [Backbone(backbonejs.org)], it's primary purpose is provide an clean way to organize the code by creating a contoller layer between `Backbone.Router` and `Backbone.View`. Aside, it offers some nice features like `Transition` abstraction to help build visually centered websites faster, it also implement a optionnal `AssetManager` which is only instanciated if an implementation of `AssetLoader` plugin is given in the framework configuration

Georgette is focused, and hopefully suited, on Agency's small to medium projects.


dependencies
--------------------------------------------

- underscore
- jquery
- backbone
- whenjs (will probably be replaced for a lighter implementation)
- es5-polyfill (needed to make when.js work in IE8-9)

_NOTE: `es6-promise` cannot be used as is, at it is silently fail when an error is thrown in a `then` callback_

- requirejs (is actually a hard dependency - _will be removed for Grunt or Browserify_)
- PreloadJS (default plugin for assets loading - _is optionnal_)

install
--------------------------------------------

```sh
$ cd path/to/project
$ npm install
$ bower install
$ node app.js
```


folder structure
--------------------------------------------

`/components` : objects that can be used outside the framework, we should be able to use these objects in any backbone project
`/views` : idem as components but all these object extends Backbones.View
`/core` : core objects of the framework
`/plugins` :  _(should be moved from framework to their own repos)_



object list
--------------------------------------------

_objects with '*' still have to be implemented_


_services_


_core_

    -   com (* instance of PubSub)
    -   Router
    -   Dispatcher
    -   Request
    -   AssetManager
    -   * AbstractPlugin

_components_

    -   AssetCollection
    -   AssetModel
    -   AbstractController
    -   UILocker
    -   AbstractLayout
    -   DefaultTransition
    -   Region
    -   AbstractLoader
    -   PubSub

_views_

    -   BaseView
    -   ModelView
    -   * CollectionView
    -   * ...

fw.js

    -   Backbone.History
    -   _.mixin
    -   return framework contructor
    -   should namespace to all framework constructors

Core
--------------------------------------------

### Georgette

`// fw.js`

A declarative object used for framework boostraping, it's public methods are `configure`, `initialize`, `install`

```javascript
    // main.js

    // configure framework
    Georgette.configure({
        layout: AppLayout,          // optionnal
        loader: Loader,             // optionnal
        assetLoader: AssetLoader,   // optionnal
        controllers: {
            'main-controller': MainController
        },
        commonControllers: {
            'commonController': CommonController
        }
    });

    // initialize framework
    Georgette.initialize(config, env);
```

####    Public API

#####   `Georgette.configure(options)`

options description (all options wait construtors) :

-   `options.layout` _(extend `Components/AbstractLayout`, defaults to `AbstractLayout`)_

is instanciated with the `config.regions` entry

```
    // config.js
    regions: {
        'header': '#header',
        'main': '#main',
        'footer': '#footer'
    },
```
where the key is the region id and value a jquery selector

-   `options.loader` _(extend `Components/AbstractLayout)_

-   `options.assetLoader` _(extend `Core/AbstractPlugin`)_

if is defined, the `AssetManager` is internally created, a default implementation using `create.js` is available

-   `options.controllers` an object of `controller-id: controllerCtor` for states control

the `controller-id` key should map the first part of a controller entry (before the `::` separator) in a state entry

```
    // config.js
    states: {
        home: {
            route: '(home)',
            // controller is the name of the file where the controller object can be found,
            // allow to create an autoload system with require
            // example : 'path/to/controller::action'
            controller: 'main-controller::home',
            defaults: {}
        },
        // ...
    }

    // main.js
    Georgette.configure({
        controllers: {
            'main-controller': ControllerCtor
        }
    });
```

-   `options.commonControllers` an object of controllers to trigger on each request.

usefull for static parts of a website like header or footer, while still allowing to simply update them based on the state of the application


#####   `Georgette.initialize(config, env)`

initialize the framework based on configuration options and a config declarative object
the `config` object must at least has `states` and `regions` property defined and configured

#####   `Georgette.install(Ctor)`

allow to install some Plugins/Services to the framework, a plugin installed this way will receive the framework instance as parameter.

#### Private API

#####   `Georgette.com`

`PubSub` instance for framework internal communications

#####   `Georgette.initLayout`

factory method for layout object

#####   `Georgette.initLoader`

factory method for loader view

#####   `Georgette.initAssetManager`

install `AssetLoader` and instanciate `AssetManager`, do nothing if no asset manager were defined in `configure`

#####   `Georgette.initRouter`

parse config to create a `Backbone.Router` compliant `routes` object, and instanciate the router

#####   `Georgette.initDispatcher`

factory method for Dispatcher initialization

#####   `Georgette.registerCommonController`
#####   `Georgette.registerController`

facades which pass the controllers constructors given in configuration step to the dispatcher


###     `Router` _(extends `Backbone.Router`)_

Simple backbone router (listen backbone's `route` event), which simply create the `request` on each route and publish an `router:route`. The event is published through the `Georgette.com` PubSub instance, the `request` object is passed as an argument

#### public API
#### private API

-   `Router.initialize`
-   `Router.forwardRequest`




todos
--------------------------------------------

-   remove requirejs dependency - prefer `grunt` or `browserify` for build step to create a standalone library with `browserify`
    _cf. [http://learnjs.io/blog/2014/02/06/creating-js-library-builds-with-browserify-and-other-npm-modules/](http://learnjs.io/blog/2014/02/06/creating-js-library-builds-with-browserify-and-other-npm-modules/)_

-   allow global, AMD and CommonJS integration - add a wrapper for commonJS and AMD compatibility

-   extract project from test app
    _for local dev of bower module, see: [https://oncletom.io/2013/live-development-bower-component/](https://oncletom.io/2013/live-development-bower-component/)_
