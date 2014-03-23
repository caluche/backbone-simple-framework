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
         *  NEXT STEPS
         *
         *  -   Explode files
         *  -   make a test plugin with [https://github.com/ftlabs/fastclick](https://github.com/ftlabs/fastclick)
         *
         *  implements the following:
         *      - an asset loader acting as an interface between third party library and framework
         *          cf. https://gist.github.com/b-ma/9456220
         *      - a layout object (used in controllers) hosting regions, building and storing views
         *          (view factory able to create, store and delete view objects)
         *      - a region object able to execute transitions between 2 views
         *      - ...
         *
         *  DONE
         *      - a service wrapping require.js to load modules from `config.path` - DONE
         */

        //  get environment globals from requirejs
        //  @WARNING is considered as a semi-private API, could break at any time
        //  cf. https://groups.google.com/forum/#!topic/requirejs/4KXx7AoTDUs (@todo - check `context` option)
        var env = requirejs.s.contexts._.config.globals;

        // hack Backbone.History
        if (config.useMultiRouting) {
            /**
             *  this could be a simple way to handle common problems like
             *  -   popins
             *  -   particular state of a view not related to the current app state
             *  needs to be discussed and tested
             *
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

        // ---------------------------- SERVICES

        /**
         *  COMMUNICATIONS
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
            removeHandler: function(obj) {
                // needs to be tested
                this.off(null, null, ctx);
            }
        });

        /**
         *  MODULE AUTO LOADER
         *
         *  Basically a module loader wrapping `require`
         *  deps: com, require
         */
        var ModuleAutoLoader = function(options) {
            this.paths = options.paths;
            // console.log(this.paths);
        };

        _.extend(ModuleAutoLoader.prototype, Backbone.Events, {

            // @TODO moduleId can also be array
            // execute the callback with loaded modules as arguments
            get: function(moduleId, callback, ctx) {
                // console.log(arguments);
                // get the real module path (according to `config.paths`)
                ctx = ctx || {};

                var modulePath = this.findLocation(moduleId);
                // create a deferred
                var defer = new $.Deferred();

                //
                require([modulePath], function(module) {
                    // console.log(module);
                    defer.resolve(module)
                }, function(err) {
                    // console.log(err)
                    console.log('"' + moduleId + '" with path "' + modulePath + '" not found');
                });

                // on `resolve` execute the callback
                // @NOTE    allow a more common API (moduleIds, callack) for the client
                //          than returning the promise
                defer.done(_.bind(callback, ctx));
            },

            //  look if the filename contains some pattern from `config.path`
            //
            //  @param moduleId <string> name of module (the name can be namespaced '/')
            //  @return  <string>   the full path of the file
            findLocation: function(moduleId) {
                // prefixes
                for (var key in this.paths) {
                    if (moduleId.indexOf(key) === 0) {
                        // remove the key part from file Path
                        var modulePath = moduleId.substr(key.length);
                        // concatenate paths
                        modulePath = this.paths[key] + modulePath;

                        return modulePath;
                    }
                }

                // no match found, moduleId is the path
                return moduleId;
            }
        });

        // testing
        // var testLoader = new ModuleAutoLoader(config.paths);
        // use with a single moduleName
        // testLoader.get('controllers/app', function(controller) {
        //     console.log(controller);
        // });


        // ---------------------------- CORE

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
                //
                // @TODO    define which parts should be installed has a service (cf. layout, appController)
                //
                // @IMPORTANT   AssetLoader, ModuleAutoLoader must be services
                //              make a choice between concept `plugins` and `services` (`services` seems to win)
                this.services = this.plugins = {
                    get: function(id) {
                        return this[id] || false;
                    }
                };

                // install core services
                this.initModuleLoader();

                // create core middlewares
                this.initRouter();
                this.initDispatcher();

                // optionnaly pass AppController and Layout as arguments

                // allow service overriding in config
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


            //  init core services
            //  core:services can be eseally overriden just by installing on the same serviceId
            initModuleLoader: function() {
                this.services['core:moduleLoader'] = new ModuleAutoLoader({ paths: this.config.paths });
            },


            // init core middlewares
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
                    services : this.services,
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
                // this.plugins[pluginName] = pluginCtor(options);;
                this.services[plginName] = pluginCtor(options);
            },

            // keep get

            // install everything as a service via `install` is maybe strange
            // we know what core services needs
            /*
            installFallbackServices: function() {
                // should kept private outside of BB (more readable)
                var requiredServices = {
                    // 'moduleLoader': ModuleAutoLoader,
                };

                _.forEach(neededServices, function(ctor, id) {
                    if (!this.services[id]) {
                        this.install(id, ctor)
                    }
                });
            } */
        };


        /**
         *  UILocker
         */
        // could be a Backbone.View with `window` or `document` as `$el` to use Backbone's jQuery instance
        var UILocker = function() {
            //  subscribe to `app:lock` and `app:unlock` channels
            com.subscribe('ui:lock', this.lock, this);
            com.subscribe('ui:unlock', this.unlock, this);
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
                // console.time('start');
                var that = this;
                this.counter++;

                // this allow to know if we are currently in a multiple route configuration or not
                // @TODO    needs to be tested cross-browser, not sure it's really reliable
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
            //  @TODO   host `services`, `plugins` ... clean that
            this.services = options.services;

            this.previousCommand = {};
            this.previousController;
            this.isExecutionCanceled = false;

            // @EVENT : listen route:change
            com.subscribe('router:change', this.dispatch, this);
        }

        _.extend(Dispatcher.prototype, Backbone.Events, {
            //  find the pair `controller.action` and execute it
            dispatch: function(stateId, params, options) {
                console.log(options.controllers);
                // reset cancel ability
                this.isExecutionCanceled = false;
                // @NOTE: param should already be an named object
                var state = this.getState(stateId);
                var parts = state.controller.split('::');
                var command = {
                    controller: parts[0],
                    action: parts[1]
                };

                // @EVENT - entry point
                // publish dispatch - this allow to alter `command`, `state`, `params` before actual dispatching
                // could be used to monitor some global stuff (user access, ...)
                // @TODO allow routing alteration
                com.publish('dispatcher:beforeLoad', state, params, this);
                // if (this.isExecutionCanceled) { return; }

                // dispatch event to allow loader plug-in
                // load assets
                // when done dispatch another event
                // ... this will be async (assets loading)
                // @TODO params could added to the state at this point
                this.findController(command, state, params);
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
            // destroy last one if different
            findController: function(command, state, params) {
                if (this.isExecutionCanceled) { return; }

                var controller = command.controller;
                // console.log(this.previousCommand.controller !== controller)
                if (this.previousCommand.controller !== controller) {
                    // @NOTE    maybe could be more efficiant with multi-routing
                    //          if multirouting :
                    //              just instanciate controller, store their references only to destroy it
                    if (this.previousController) {
                        this.previousController.destroy();
                    }

                    var moduleLoader = this.services.get('core:moduleLoader');

                    var execute = _.partial(this.execute, command, state, params);

                    // create a new controller instance
                    var instanciate = function(ctor) {
                        var instance = new ctor({
                            layout: this.layout,
                            services: this.services
                        });

                        this.execute(instance, command, state, params);
                    }
                    // as moduleLoader is async their is no garanty here that
                    // execute will be executed in same order as routes
                    moduleLoader.get(controller, instanciate, this);
                } else {
                    //  @TODO
                    //      check if this is exact same action with same params
                    //      if same params : cancelExecution
                    //      if not : give the info to the controller
                    this.execute(this.previousController, command, state, params);
                }
            },

            // actually execute controller:action command
            execute: function(instance, command, state, params) {
                // this can be async
                // store infos
                var action = command.action;

                this.previousCommand = command;
                this.previousController = instance;
                this.previousParams = params;

                // @EVENT - entry point
                // can be used in a controller to create repetive tasks
                // channel should be 'dispatcher:beforeDispatch'
                com.publish('dispatcher:beforeDispatch', instance, action, state, params);
                // call a specific controller::action
                // @TODO should `utils.ensureApi`
                //       if controller is not found redirect to not found
                instance[action](state, params);

                // @EVENT - entry point
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
         *  finally allowing to use more simple and efficient views
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
            var options = options || {};
            // set layout
            this.layout = options.layout;
            this.services = options.services;

            this.initialize(options);
        };

        // install backbone's `extend` abillity
        // @TODO - check if there is no better way...
        AbstractController.extend = Backbone.View.extend;
        // create common API
        _.extend(AbstractController.prototype, Backbone.Events, {
            initialize: function() {},

            resume: function() {
                // publish 'something' to unlock the app
                // console.log('   => unlock app');
                com.publish('ui:unlock');
            },

            // keep it as the entry points
            destroy: function() {
                this.removeAllHandlers();
            },

            // make a default cleanning (event listeners, subscribes)
            removeAllHandlers: function() {}
        });

        //  @TODO   AppController to handle loader (through events), 404 fallbacks, globals behaviors
        //  @NOTE   change the name, should be reserved for final user (find some other name)
        //  loader should also listen custom events to allow it's fine control from a controller

        // ---------------------------------------------
        // dump controller for testing (the one actually used is in app/controllers/app.js)
        // ---------------------------------------------
        /*
        var MyController = AbstractController.extend({
            // common
            initialize: function() {
                com.subscribe('dispatcher:beforeDispatch', this.doStuff, this);
            },

            // a default implementation should exists in AbstractController
            destroy: function() {
                com.unsubscribe('dispatcher:beforeDispatch', this.doStuff, this);
            },

            // each `action` method receive `state` and `params` objects as arguments
            home: function(state, params) {
                // console.log('   =>  controller::home', state, params);
            },

            index: function(state, params) {
                // console.log('   =>  controller::index', state, params);
                // do stuff...

                // unlock app
                this.resume();
            },

            content: function(state, params) {
                // console.log('   =>  controller::content', state, params);
            },

            // clear console before each dispatching
            doStuff: function() {
                // console.log('   =>  controller - beforeDispatch');
            }
        });
        // test that `extend` is well transmitted from AbstractController
        var Control2 = MyController.extend({});
        */

        // ---------------------------------------------
        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            GG.initialize(config, env);
            // call these directly or through config extend
            // GG.setLayout(MyAppLayout);
            // GG.setAppController(MyAppController);

            // install plugins
            // GG.install('analytics', MyPluginCtor);

            /**
             *  // example:
             *  var TestPlugin = function(options) {
             *      this.name = 'plugin-test';
             *
             *      options._com.subscribe('router:change', function() {
             *          console.log('   ->  from plugin', arguments, this)
             *      }, this);
             *  }
             *
             *  // install
             *  GG.install('test-plugin', TestPlugin);
             */

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
