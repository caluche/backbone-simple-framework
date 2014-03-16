define(
    [
        'backbone', 'underscore', 'jquery', 'config'
    ], function(Backbone, _, $, config) {

        'use strict';

        /**
         *  @TODO
         *      create an architecture scheme
         *      unit testing
         *      extend config ?
         */
        var env = {};

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

        // ---------------------------------------
        // @TODO pubsub should also have a common pubsub api (alias backbone's method)
        var pubsub = _.extend({}, Backbone.Events);
        // @TODO - get a log system

        /**
         *  Framework boostrapper
         */
        var GG = {
            initialize: function(options) {
                this.config = options;

                // create core objects
                this.initRouter();
                this.initDispatcher();

                // call `this.AppController(options.appController)` to set a default one
            },

            initRouter: function() {
                this.router = new Router({
                    routes: this.getRoutes(this.config)
                });
            },

            initDispatcher: function() {
                // @MAYBE this should be a collection of smaller models - ??
                this.dispatcher = new Dispatcher({
                    states: this.config.states,
                    paths: this.config.paths
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

            setAppController: function(constructor) {
                // if `constructor` is undefined fallback to default AppController
                // configure dispatcher to use `constructor`
            },

            setLayout: function(constructor) {

            },
        };

        GG.Utils = {
            /**
             *  @param obj <object>     object to test
             *  @param methods <string|array>   required api
             *  @return bool
             */
            ensureApi: function(obj, methods) {},
        }

        // once GG is called config.paths allow to map controller names with file system

        /**
         *  ROUTER
         *
         *  cf. https://github.com/mlmorg/backbone.canal : allow to have { name: param } mapping
         *  maybe first just use it and then rewrite the usefull parts
         *  other parts could also be used as inspiration for the dispatcher
         *
         *  -------------------------------------------
         *
         *  @TODO   should have the ability to create urls from route and params
         *          will probably not work with regexps in routes
         *
         */
        var Router = Backbone.Router.extend({
            initialize: function() {
                this.on('route', _.bind(this.forwardRequest, this));
            },

            /**
             *  forward the request to the dispatcher
             *  @EVENT global `route:change`
             */
            forwardRequest: function(route, params) {
                // console.log('   => publish', route, params);
                pubsub.trigger('router:change', route, params);
            },

        });


        /**
         *  DISPATCHER
         *  -------------------------------------------------------
         *  find the state and the according controller
         *  how to map arguments with their name into the route
         *  map arguments their param names (marge with defaults params)
         *       => maybe override something or do it in backbone router
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
            this.previousCommand = {};
            this.previousController;
            this.isExecutionCanceled = false;

            // @EVENT : listen route:change
            pubsub.on('router:change', this.dispatch, this);
        }

        _.extend(Dispatcher.prototype, Backbone.Events, {
            dispatch: function(stateId, params) {
                // reset cancellation
                this.isExecutionCanceled = false;
                // test it the hard way, should be a kind of:
                // param should be an anmed object around here
                var state = this.states[stateId];
                var parts = state.controller.split('::');
                var command = {
                    controller: parts[0],
                    action: parts[1]
                };

                // @EVENTS - entry point
                // publish dispatch - this allow to alter `command`, `state`, `params` before actual dispatching
                // could be used to monitor some global stuff (user access, ...)
                // @TODO allow routing alteration
                pubsub.trigger('dispatcher:beforeDispatch', state, params, this);

                // dispatch event to allow loader plug-in
                // load assets
                // when done dispatch another event

                this.execute(command, state, params);
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
                    instance = new Control2();
                } else {
                    instance = this.previousController;
                }

                // store infos
                this.previousCommand = command;
                this.previousController = instance;

                // can be used in a controller to create repetive tasks
                pubsub.trigger('dispatcher:dispatch', instance, action, state, params);
                // call a specific controller::action
                // @TODO should `utils.ensureApi`
                //       if controller is not found redirect to not found
                instance[action](state, params);

                // @EVENTS - entry point
                pubsub.trigger('dispatcher:afterDispatch', instance, action, state, params);
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

        // @TODO AppController to handle loader (through events), 404 fallbacks, globals behaviors

        // --------------------------------------
        // dump controller for testing
        var MyController = AbstractController.extend({
            // common
            initialize: function() {
                pubsub.on('dispatcher:dispatch', this.doStuff, this);
            },

            // a default implementation should exists in AbstractController
            destroy: function() {
                pubsub.off('dispatcher:dispatch', this.doStuff, this);
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

        var Control2 = MyController.extend({});

        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            GG.initialize(config, env /* specific env config from bootstrapping */);
            // GG.setAppController(MyAppController)
            // start the whole stuff
            Backbone.history.start();
        });
    }
);
