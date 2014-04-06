FW
============================================

__Should be to into `vendors` (easier for now...)__

## todos

maybe use browserify to create a standalone library (remove requirejs dependency)

cf. [http://learnjs.io/blog/2014/02/06/creating-js-library-builds-with-browserify-and-other-npm-modules/](http://learnjs.io/blog/2014/02/06/creating-js-library-builds-with-browserify-and-other-npm-modules/)


## object list

_objects with '*' still have to be implemented_


_services_

    -   * PubSub
    -   ModuleAutoLoader
    -   * AbstractService
    -   * AbstractLoader (maybe this should be kept external)

_core_

    -   com (* instance of PubSub)
    -   Router
    -   Dispatcher
    -   Request

_components_

    -   AbstractController
    -   UILocker
    -   * AbstractLayout
    -   * AbstractRegion
    -   Transition
    -   * LockedModel

_views_

    -   * BaseView
    -   * ModelView
    -   * CollectionView
    -   * ...

fw.js

    -   Backbone.History
    -   _.mixin
    -   return framework contructor
    -   should namespace to all framework constructors
