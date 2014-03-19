define(
    [
        'require', 'backbone', 'underscore', 'jquery', 'config'
    ], function(require, Backbone, _, $, config) {

        'use strict';

        /**
         *  @TODO
         *      create a scheme of architecture
         *      write docs
         *      write a cookbook (to test api as well as a list of how to)
         *      unit tests
         */

        /**
         *  the following still needs to be implemented:
         *      - a service wrapping require.js to load modules from `config.path`
         *      - an asset loader acting as an interface between third party library and framework
         *      - a layout object
         *      - a region object also able to execute a transition between 2 views
         *      - a view factory able to create and delete view objects (used in controllers)
         *      - ...
         */



        //  get environment globals from requirejs
        //  @WARNING is considered as a semi-private API, could break at any time
        //  cf. https://groups.google.com/forum/#!topic/requirejs/4KXx7AoTDUs (@todo - check `context` option)
        var env = requirejs.s.contexts._.config.globals;

        // hack Backbone.History
        if (config.useMultiRouting) {
            /**
             *  @OVERRIDE Backbone.History to allow multiple controler calls
             *  @TODO check if `loadUrl` is the best entry point (maybe its callee)
             *  @NOTE not sure it still supports Backbone's regexp in url
             */
            Backbone.History.prototype.multiRouteSeparator = config.multiRouteSeparator || '|';

            Backbone.History.prototype.loadUrl = function(fragment) {
                fragment = this.fragment = this.getFragment(fragment);
                // split the fragment according to the defined separator
                var fragments = fragment.split(this.multiRouteSeparator);

                // test handlers with each fragments
                // the function doesn't return anything like the real one
                // but it doesn't seems to create problems
                _.forEach(fragments, function(fragment) {
                    _.any(this.handlers, function(handler) {
                        if (handler.route.test(fragment)) {
                            // execute the callback
                            // console.log(handler);
                            handler.callback(fragment);
                            // return true;
                        }
                    });
                }, this);
            };
        };
        // */

        /**
         *  FRAMEWORK GLOBAL COMMUNICATION OBJECT
         *
         *  basically a Backbone.Events with a pubsub interface (alias method signatures)
         *  (looks more meaningfull for this kind of functionnality)
         *  allow decoupling as well as publishing the internal state of the framework for plugins
         *
         *  @TODO    create a constructor to allow it being used somewhere else in the application
         */
        var com = _.extend({}, Backbone.Events, {
            // alias `trigger`
            publish: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.trigger.apply(this, args);
            },

            // alias `on`
            subscribe: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.on.apply(this, args);
            },

            // alias `off`
            unsubscribe: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.off.apply(this, args)
            },

            // added methods
            // --------------------------------------------------------
            // kind of log system should be able to :
            //      - trace a route
            //      - a specific object of the framework (a specific namespace)
            //      - make a list of existing channels with their related subscriptions
            //      - ...
            trace: function(key) {},
            // remove all subscriptions of an object at once
            removeHandler: function(obj) {}
        });

        /**
         *  bootstrap - init and configure core parts of the framework
         */
        var GG = {
            initialize: function(config, env) {
                this.config = config;
                this.env = env;

                // install global services/plugin that could used in controllers
                // allow plugin developpement and code reuse without altering the framework
                // examples:
                //      maybe a kind of window monitoring could be registered as a service or plugin
                //      could be used to install proxies with third party services (asset loader, etc...)
                // @NOTE    maybe redondant with `this.plugins`
                //          maybe use a Backbone.Collection (needs use cases)
                // @IMPORTANT   AssetLoader, ModuleAutoLoader must be services
                //              make a choice between concept `plugins` and `services`
                this.services = this.plugins = {};

                // create core objects
                this.initRouter();
                this.initDispatcher();

                // optionnaly pass AppController and Layout as arguments
                if (config.appController) {
                    this.setAppController(config.appController)
                }

                if (config.layout) {
                    this.setLayout(config.layout);
                }
            },

            //  com : maybe keeping it external to GG object is more meaningfull
            //        but probably harder to trace/debug (tbd)
            //  get a reference to the `com` object (usefull for plugins construction, should not be used elsewhere)
            //  com: com,

            initRouter: function() {
                this.router = new Router({
                    routes: this.getRoutes(this.config)
                });
            },

            initDispatcher: function() {
                // @NOTE - maybe should be a collection of smaller models - ??
                this.dispatcher = new Dispatcher({
                    states: this.config.states,
                    paths: this.config.paths,
                    // forward plugins and services to controller
                    app : { plugins: this.plugins, services: this.services }
                });
            },

            //  map `config.states` to Backbone.Router compliant routes
            getRoutes: function(config) {
                var routes = {},
                    states = config.states;

                for (var key in states) {
                    var route = states[key].route;
                    routes[route] = key;
                }

                return routes;
            },

            //  helpers to configure framework
            //  -----------------------------------------------------
            setAppController: function(ctor) {
                // if `ctor` is undefined fallback to default AppController
                // configure dispatcher to use the given AppController extended obj
            },

            setLayout: function(ctor) {

            },

            //  method to install plugins/services to the framework
            //
            //  @param pluginName <string> id of the plugin to get it back in controllers
            //  @param pluginCtor <object>
            //          constructor of the plugin
            //          the current instance of the framework and `com` object are passed as argument
            //
            //  @TODO (maybe)   allow switch between service and plugin installation
            install: function(pluginName, pluginCtor, options) {
                if (this.plugins[pluginName]) {
                    return;
                }

                options = options || {};
                // extends options with the framework and coms as parameters
                options._core = this;
                options._com = com;
                // add a the new plugin to collection
                this.plugins[pluginName] = pluginCtor(options);;
            }
        };

        //  could/should be added to underscore: cf. _.mixin()
        //  @NOTE   if in underscore, method names should be configurable
        GG.utils = {
            /**
             *  @param obj <object>     object to test
             *  @param methods <string|array>   required api
             *  @return bool
             */
            ensureApi: function(obj, methods) {},
        }

        // could be a Backbone.View with `window` or `document` as `$el` to use Backbone's jQuery instance
        var UILocker = function() {
            //  subscribe to `app:lock` and `app:unlock` channels
            this.subscribe('ui:lock', this.lock, this);
            this.subscribe('ui:unlock', this.unlock, this);
        }

        UILocker.prototype = {
            // lock user interactions
            // app should be locked from the Disptacher
            lock: function() {},
            // and unlocked from the Layout (once all Regions finished their transitions (cf. `_.times`))
            // Layout should subscribe to all channels from Dispatcher and Loader
            unlock: function() {},
        }

        /**
         *  ROUTER
         *
         *  cf. https://github.com/mlmorg/backbone.canal : allow to have { name: param } mapping
         *  maybe first just wrap it and then rewrite the usefull parts
         *  some other parts could also be used as inspiration for the dispatcher
         *
         *  should be able to map arguments with their names (and then merge with defaults params)
         *
         *  -------------------------------------------
         *
         *  @TODO   should be able to create urls from a routeId and given parameters
         *              - will not work with regexps in routes
         *              - that's why it's not in backbone, see constraints/benefits (cf. SEO, url based states, ...)
         *          add a catch all route (or do it in config)
         *          maybe create a real request object, extending `Backbone.Model` (see if it's usefull)
         */
        var Router = Backbone.Router.extend({
            initialize: function() {
                this.on('route', _.bind(this.forwardRequest, this));
            },

            // count concurrent routes
            counter: 0,

            /**
             *  forward the request to the dispatcher
             *  @EVENT global `route:change`
             */
            forwardRequest: function(route, params) {
                // console.log('   => publish', route, params);

                // this could wait for a next event
                // console.log(this.index);
                var that = this;
                this.counter++;

                // this allow to know if we are currently in a multiple route configuration or not
                // @TODO    need to be tested cross-browser, not sure it's really reliable
                _.defer(function() {
                    var options = {
                        controllers: that.counter
                    };

                    com.publish('router:change', route, params, options);
                    // reset counter
                    _.defer(function() { that.counter = 0 });
                });
            },

        });


        /**
         *  DISPATCHER
         *  -------------------------------------------------------
         *  find the state and the according controller
         *  destroy the previous controller if different
         *  instanciate the controller and calls its `action` method
         *
         *  EVENTS: dispatch events before and after dispatch to allow easy plug-in
         *
         *  the dispatcher (and layout) use `require` to load and use modules
         *  @NOTE - it should use a service wrapping `require.js` to load modules
         *  (`config.paths` allow to map `controllers` with the file system)
         *
         *  http://stackoverflow.com/questions/9507606/when-to-use-require-and-when-to-use-define
         *  @NOTE - can create problems with r.js ?
         */
        var Dispatcher = function(options) {
            this.states = options.states;
            //  map the filesystem with namespaces (basically allow factories to work)
            this.paths = options.paths;
            //  store references to framework plugins and services
            //  allow controllers to use services
            this.app = options.app;

            this.previousCommand = {};
            this.previousController;
            this.isExecutionCanceled = false;

            // @EVENT : listen route:change
            com.subscribe('router:change', this.dispatch, this);
        }

        _.extend(Dispatcher.prototype, Backbone.Events, {
            //  find the pair `controller.action` and execute it
            dispatch: function(stateId, params, options) {
                // console.log(this.app);
                // reset cancel ability
                this.isExecutionCanceled = false;
                // @NOTE: param should already be an named object
                var state = this.getState(stateId);
                var parts = state.controller.split('::');
                var command = {
                    controller: parts[0],
                    action: parts[1]
                };

                // @EVENTS - entry point
                // publish dispatch - this allow to alter `command`, `state`, `params` before actual dispatching
                // could be used to monitor some global stuff (user access, ...)
                // @TODO allow routing alteration
                com.publish('dispatcher:beforeDispatch', state, params, this);
                // if (this.isExecutionCanceled) { return; }

                // dispatch event to allow loader plug-in
                // load assets
                // when done dispatch another event
                // ... this will be async (assets loading)
                this.execute(command, state, params);
            },

            //  @TODO - allow access to the controllers ?
            getState: function(stateId) {
                return this.states[stateId];
            },

            // should be able to cancel dispatching in some preDispatch method
            cancelExecution: function() {
                this.isExecutionCanceled = true;
            },

            // compare new controller with previous one
            // destroy last one if differrent
            // execute the controller::action method
            execute: function(command, state, params) {
                if (this.isExecutionCanceled) { return; }

                var instance;
                var controller = command.controller;
                var action = command.action;

                //  @TODO
                //      don't create a controller if it was already there
                //      do something with this.previousCommand ?
                //  console.log(this.previousCommand['controller'] === controller);
                if (this.previousCommand['controller'] !== controller) {
                    // @TODO    this cannot work properly with multi routing
                    if (this.previousController) {
                        this.previousController.destroy();
                    }

                    //    should looks like:
                    //    ```
                    //    require(this.paths['controllers'] + '/' + command[0], function(controller) {
                    //        // do something with controller
                    //        // command[0] : controller
                    //        // command[1] : action
                    //        // this.execute(command[0], command[1], state, params);
                    //    });
                    //    ```
                    //    ... dirty ...
                    // `this.app.plugins` and `this.app.services` should be passed to the instance
                    instance = new Control2();
                } else {
                    instance = this.previousController;
                }

                // store infos
                this.previousCommand = command;
                this.previousController = instance;

                // can be used in a controller to create repetive tasks
                com.publish('dispatcher:dispatch', instance, action, state, params);
                // call a specific controller::action
                // @TODO should `utils.ensureApi`
                //       if controller is not found redirect to not found
                instance[action](state, params);

                // @EVENTS - entry point
                com.publish('dispatcher:afterDispatch', instance, action, state, params);
            },


            // the following is redondant with event system...

            // execute all the registered methods for predispatch
            _preDispatch: function() {},

            // execute all the registered methods for postdispatch
            _postDispatch: function() {},

            //  allow to register method for pre|post dispatching
            //  @param type <string> [predispatch|postdispatch] which queue to add the callback
            //  @param callback <function> function to be executed on predispatch or postdispatch
            //      receive route, args, state as arguments
            register: function(type, callback, ctx) {},
        });

        /*
         *  AbstractController
         *  -------------------------------------------------------
         *  application controllers should be extended from this object
         *  allows to have higher control of the current state and remove many logic from the view
         *  finally allowing to use more efficient views
         *
         *  MyController = GG.AbstractController.extend({
         *      // action
         *      index: function(route, params) {
         *          // has internal access to :
         *          // this.layout
         *          // this.state (backbone model ?)
         *          // this.services.get('') // to get a global service
         *
         *          // build models according to params
         *          // get views from the factory (use requirejs path as id)
         *
         *          // use a promise like pattern to build the
         *          // transition between views in each regions
         *          // the regions could expose a default transition system
         *
         *          // call `this.resume()` when all is done to unlock the app
         *       }
         *   });
         */
        var AbstractController = function(options) {
            this.layout = undefined;

            this.initialize(options);
        };

        // install backbone's `extend` abillity
        // @TODO - check if there is no better way...
        AbstractController.extend = Backbone.View.extend;
        // create common api
        _.extend(AbstractController.prototype, Backbone.Events, {
            initialize: function() {},

            resume: function() {
                // publish 'something' to unlock the app
                // console.log('   => unlock app');
                com.publish('ui:unlock');
            },

            destroy: function() {
                // make a defaults cleanning (event listeners, subscribes)
            }
        });

        //  @TODO AppController to handle loader (through events), 404 fallbacks, globals behaviors
        //  loader should also listen custom events to allow it's fine control from a controller

        // ---------------------------------------------
        // dump controller for testing
        // ---------------------------------------------
        var MyController = AbstractController.extend({
            // common
            initialize: function() {
                com.subscribe('dispatcher:dispatch', this.doStuff, this);
            },

            // a default implementation should exists in AbstractController
            destroy: function() {
                com.unsubscribe('dispatcher:dispatch', this.doStuff, this);
            },

            // each `action` method receive `state` and `params` objects as arguments
            home: function(state, params) {
                console.log('   =>  controller::home', state, params);
            },

            index: function(state, params) {
                console.log('   =>  controller::index', state, params);
                // do stuff...

                // unlock app
                this.resume();
            },

            content: function(state, params) {
                console.log('   =>  controller::content', state, params);
            },

            // clear console before each dispatching
            doStuff: function() {
                console.log('   =>  controller - beforeDispatch');
            }
        });
        // test that `extend` is well transmitted from AbstractController
        var Control2 = MyController.extend({});


        // ---------------------------------------------
        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            GG.initialize(config, env);
            // call these directly or through options in ctor
            // GG.setLayout(MyAppLayout);
            // GG.setAppController(MyAppController);

            // install plugins
            // GG.install('analytics', MyPluginCtor);

            /**
             *  // use
             *  var PluginTest = function(GG, com) {
             *      this.name = 'plugin-test';
             *
             *      GG.com.subscribe('router:change', function() {
             *          console.log('   ->  from plugin', arguments, this)
             *      }, this);
             *  }
             *
             *  GG.install('plugin-test', PluginTest);
             */

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
