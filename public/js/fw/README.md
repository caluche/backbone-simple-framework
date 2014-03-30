FW
============================================

__Should be to into `vendors` (easier for now...)__

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
    -   * Transition
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
