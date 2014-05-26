README
============================================

simple framework draft
(MVC - Plugin oriented)

dependencies
--------------------------------------------

-   backbone
-   underscore
-   jquery
-   whenjs
-   requirejs
-   preloadjs _(optionnal)_


@TODO :

-   extract project from test app
-   remove requirejs dependency - prefer `browserify` for build step
-   allow global, AMD and CommonJS integration

_inspired from Chaplin architecture_

install
--------------------------------------------

```sh
$ cd path/to/project
$ npm install
$ bower install
$ node app.js
```


todos
--------------------------------------------

-   remove requirejs dependency - prefer `grunt` or `browserify` for build step to create a standalone library with `browserify`
    _cf. [http://learnjs.io/blog/2014/02/06/creating-js-library-builds-with-browserify-and-other-npm-modules/](http://learnjs.io/blog/2014/02/06/creating-js-library-builds-with-browserify-and-other-npm-modules/)_

-   allow global, AMD and CommonJS integration - add a wrapper for commonJS and AMD compatibility

-   extract project from test app
    _for local dev of bower module, see: [https://oncletom.io/2013/live-development-bower-component/](https://oncletom.io/2013/live-development-bower-component/)_


folder structure
--------------------------------------------

/components

    -   objects that can be used outside the framework, we should be able to use these objects in any backbone project

/views

    -   idem as components but all these object extends Backbones.View

/core

    -   core objects of the framework

/services

    -   should be removed
    -   PubSub should be moved to `components`
    -   asset-loader should be ketp external (or just keep it here as default loader)
    -   module-auto-loader will be removed as it is not usable with r.js



object list
--------------------------------------------

_objects with '*' still have to be implemented_


_services_

    -   PubSub
    -   ModuleAutoLoader
    -   * AbstractService
    -   * AbstractLoader (maybe this should be kept external)

_core_

    -   com (* instance of PubSub)
    -   Router
    -   Dispatcher
    -   Request
    -   AssetManager

_components_

    -   AssetCollection
    -   AssetModel
    -   AbstractController
    -   UILocker
    -   AbstractLayout
    -   DefaultTransition
    -   Region

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
