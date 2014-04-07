define([
        'backbone',
        'underscore',
        'fw/core/com',
        'fw/core/router',
        'fw/core/dispatcher',
        'fw/services/module-auto-loader'
    ], function(Backbone, _, com, Router, Dispatcher, ModuleAutoLoader) {

        'use strict';

        /**
         *  @TODO
         *      create a dummy App with at least 3 states (home, content, popin)
         *      create a scheme of architecture
         *      write docs
         *      write a cookbook (to test api as well as a list of howTo)
         *      unit tests
         */

        /**
         *  ON PROGRESS
         *      commonControllers registration
         *      needs a better controller definition
         */

        /**
         *  NEXT STEPS
         *
         *  -   make a test plugin with [https://github.com/ftlabs/fastclick](https://github.com/ftlabs/fastclick)
         *
         *  implements the following:
         *      - an asset loader acting as an interface between third party library and framework
         *          cf. https://gist.github.com/b-ma/9456220
         *          the loader should also listen custom events to allow it's fine control from a controller
         *      - a layout object (used in controllers) hosting regions, building and storing views
         *          (view factory able to create, store and delete view objects)
         *      - an Default AppController` to handle loader (through events), 404 fallbacks, globals behaviors
         */

        /**
         *  Multi-routing
         */
        var allowMultiRouting = function(separator) {
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
            Backbone.History.prototype.multiRouteSeparator = separator || '|';

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

        /**
         *  underscore's mixins (maybe create a dedicated file)
         */
        // _.mixin({
        //     ensureApi: function(obj, api) {},
        //     capitalize: function() {},
        // });

         /**
         *  bootstrap - init and configure core parts of the framework
         */
        var FW = {
            initialize: function(config, env) {
                this.config = config;
                this.env = env;

                this.identify(this.config.states, 'id');

                if (this.config.useMultiRouting) {
                    allowMultiRouting(this.config.multiRouteSeparator);
                }

                // install global services/plugin that could used in controllers
                // allow plugin developpement and code reuse without altering the framework
                // @NOTE    a plugin must be able to load its wrapped library from config
                //          find a way to inject some defined dependencies in its context/module
                // examples:
                //      maybe a kind of window monitoring could be registered as a service or plugin
                //      could be used to install proxies with third party services (asset loader, etc...)
                //
                // @TODO    define which parts should be installed has a service (cf. layout, appController)
                //
                // @IMPORTANT   AssetLoader, ModuleAutoLoader must be services
                //              make a choice between concept `plugins` and `services` (`services` seems to win)

                // convenience method - public API
                // `set` is not needed as it's should be kept internal through `this`
                var _getItem = function(id) {
                    return this[id] || false;
                };

                // stores - object bags
                this.services = this.plugins = {
                    get: _getItem
                };

                this.commonControllers = {
                    get: _getItem
                }

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

            //  com : maybe keeping it external to FW object is more meaningfull
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
                    routes: this.getRoutes(this.config),
                    states: this.config.states
                });
            },

            initDispatcher: function() {
                console.log('init dipatcher');
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

            /**
             *  add an entry to each object of the given `obj`
             *  with `attrName` setted to its key
             *  => could be an underscore mixin
             */
            identify: function(obj, attrName) {
                for (var key in obj) {
                    obj[key][attrName] = key;
                }
                return obj;
            },

            //  helpers to configure framework
            //  -----------------------------------------------------
            setAppController: function(ctor) {
                // if `ctor` is undefined fallback to default AppController
                // configure dispatcher to use the given AppController
            },

            // allow to register controllers that will be called for each request
            // usefull to manage common parts of the site (header, footer)
            addCommonController: function(id, ctor) {
                var instance = this.dispatcher.installController(ctor);
                this.commonController[id] = instance;
            },

            // the main layout of the application
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

        return FW;

    }
);
