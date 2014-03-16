define(
    [
        'require', 'backbone', 'underscore', 'jquery', 'config'
    ], function(require, Backbone, _, $, config) {

        'use strict';

        /**
         *  @TODO
         *      create a scheme of architecture
         *      write docs / cookbook
         *      unit test
         */

        //  get environment globals from requirejs
        //  @WARNING is considered as a semi-private API could break at any time
        //  cf. https://groups.google.com/forum/#!topic/requirejs/4KXx7AoTDUs (check `context` option)
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

        //  ---------------------------------------
        //  @TODO    create a constructor to allow it being used in app
        //  @API     rename to `com`
        //  keep it external
        var com = _.extend({}, Backbone.Events, {
            publish: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.trigger.apply(this, args);
            },

            subscribe: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.on.apply(this, args);
            },

            unsubscribe: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.off.apply(this, args)
            },

            // kind of log system
            trace: function() {},
        });
        // @TODO - get a log system

        /**
         *  Framework boostrapper
         */
        var GG = {
            initialize: function(config, env) {
                this.config = config;
                this.env = env;
                // @NOTE    maybe use a Backbone.Collection (needs use cases)

                // install global services/plugin that could used in controllers
                // allow plugin developpement and code reuse without altering the framework
                // examples:
                //      maybe a kind of window monitoring could be registered as a service or plugin
                //      could be used to install proxies with third party services (asset loader, etc...)
                // @NOTE    maybe redondant with `this.plugins`
                // @IMPORTANT the asset loader must be a service/plugin
                this.plugins = {};
                // this.services = {};

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

            // get a ref to com object (usefull for plugins API)
            com: com,

            initRouter: function() {
                this.router = new Router({
                    routes: this.getRoutes(this.config)
                });
            },

            initDispatcher: function() {
                // @MAYBE this should be a collection of smaller models - ??
                this.dispatcher = new Dispatcher({
                    states: this.config.states,
                    paths: this.config.paths,
                    // forward plugins and services to controller
                    app : { plugins: this.plugins, services: this.services }
                });
            },

            //  map states to Bacbone.Router compliant routes
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

            //  @TODO   allow switch between service and plugin installation
            //  or maybe it's just the same thing finally
            //
            //  @param pluginName <string> id of the plugin to get it back in controllers
            //  @param pluginCtor <object>
            //          constructor of the plugin
            //          the current instance of the framework is passed as argument
            install: function(pluginName, pluginCtor) {
                // each plugins receive access to the whole
                // framework, (communication are available through GG.com)
                var plugin = new pluginCtor(this);
                // add to collection
                // services and plugins should be singletons
                if (!this.plugins[pluginName]) {
                    this.plugins[pluginName] = plugin;
                }
            }
        };

        //  could be added to underscore: cf. _.mixin()
        //  @NOTE   if in underscore method names should be configurable
        GG.utils = {
            /**
             *  @param obj <object>     object to test
             *  @param methods <string|array>   required api
             *  @return bool
             */
            ensureApi: function(obj, methods) {},
        }

        // could be a Backbone.View with `window` as `$el` to use Backbone's jQuery instance
        var UILocker = function() {
            //  subscribe to `app:lock` and `app:unlock` channels
            this.subscribe('ui:lock', this.lock, this);
            this.subscribe('ui:unlock', this.unlock, this);
        }

        UILocker.prototype = {
            // lock interactions from the `window`
            // app should be locked from Disptacher
            lock: function() {},
            // should be unlocked from the Layout (once all regions finished transitions)
            unlock: function() {},
        }

        // once GG is called config.paths allow to map controller names with file system

        /**
         *  ROUTER
         *
         *  cf. https://github.com/mlmorg/backbone.canal : allow to have { name: param } mapping
         *  maybe first just use it and then rewrite the usefull parts
         *  other parts could also be used as inspiration for the dispatcher
         *
         *  should be able to map arguments their names (and then merge with defaults params)
         *
         *  -------------------------------------------
         *
         *  @TODO   should have the ability to create urls from route and params
         *              - will probably not work with regexps in routes
         *          add a catch all route (or do it in config finally)
         *          create a real request object (Backbone Model)
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

                // this allow to know if we are in multiple route configuration or not
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
         *  instanciate the controller and call its action method
         *
         *  EVENTS: dispatch events before and after dispatch to allow easy plug-in
         *
         *  the dispatcher (and layout) use `require` to load and use modules
         *  http://stackoverflow.com/questions/9507606/when-to-use-require-and-when-to-use-define
         *  @NOTE - is this can create problems with r.js ?
         */
        var Dispatcher = function(options) {
            this.states = options.states;
            this.paths = options.paths;
            this.app = options.app; // store references to framework plugins and services

            this.previousCommand = {};
            this.previousController;
            this.isExecutionCanceled = false;

            // @EVENT : listen route:change
            com.subscribe('router:change', this.dispatch, this);
        }

        _.extend(Dispatcher.prototype, Backbone.Events, {
            dispatch: function(stateId, params, options) {
                // console.log(this.app);
                // reset cancellation
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

                // dispatch event to allow loader plug-in
                // load assets
                // when done dispatch another event

                // this should async
                this.execute(command, state, params);
            },

            //  @TODO - allow access to the controllers ?
            getState: function(stateId) {
                return this.states[stateId];
            },

            // should be able to cancel dispatching
            cancelExecution: function() {
                this.isExecutionCanceled = true;
            },

            // execute the controller::action associated to the given route
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
         *  the define of the controller should call the usefull views to be sure
         *  eveything is preloaded and also can be minified properly
         *  this also allow to have a simple idea of the controller dependencies
         *  app is locked just before calling he action
         *
         *  MyController = GG.AbstractController.extend({
         *      // action
         *      index: function(route, params) {
         *          // has access to :
         *          // this.layout
         *          // this.currentState (backbone model ?)
         *
         *          // build models according to params
         *          // get views from the factory (use requirejs path as id)
         *
         *          // use a promise like pattern tobuild the
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
            },

            destroy: function() {
                // make a defaults cleanning (event listeners, subscribes)
            }
        });

        //  @TODO AppController to handle loader (through events), 404 fallbacks, globals behaviors
        //  loader should also listen to custom events to allow it's control from a controller

        // --------------------------------------
        // dump controller for testing
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
