define([
        'backbone',
        'underscore',
        'fw/core/com',
        'fw/core/router',
        'fw/core/dispatcher',
        'fw/core/assets-manager',
        'fw/services/module-auto-loader'
    ], function(Backbone, _, com, Router, Dispatcher, AssetsManager, ModuleAutoLoader) {

        'use strict';
        /**
         *  @TODO
         *      refactor framework initialization - ok
         *      refactor dispatcher:
         *          - remove autoloading, register controllers in app instead (fix the compression problem, even if it's more verbose)
         *      test compression
         *      handle dynamic assets
         *      handle multi-routing properly (controller stack in dispatcher)
         *      handle loader
         *
         *  In a prefect world:
         *      create a dummy App with at least 3 states (home, content, popin)
         *      create a scheme of architecture
         *      write docs
         *      write a cookbook (to test api as well as a list of howTo)
         *      unit tests
         */

        /**
         *  ON PROGRESS`
         *      cf. http://stackoverflow.com/questions/22294425/promises-ecmascript-6-vs-3rd-party-libraries#answer-22296765
         *
         *  @NOTE : having `com` separated from the framework is a mistake
         *          it should be injected on other objects as a dependency
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
         *      - a Default AppController` to handle loader (through events), 404 fallbacks, globals behaviors
         */

        /**
         *  UNDERSCORE MIXINS
         */
        _.mixin({
            capitalize: function(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            },

            //  add an entry to each object of the given `obj`
            //  with `attrName` setted to its key
            identify: function(obj, attrName) {
                for (var key in obj) {
                    obj[key][attrName] = key;
                }

                return obj;
            },

            //  @TODO needs to be tested
            ensureApi: function(obj, api) {
                var result = _.difference(api, _.functions(obj));
                return !!result.length; // === 0 ? true : result;
            },

            /**
             *  add sep betwen 3 numbers:
             *  ex: formatNumber(1000000, ',') return 1,000,000
             */
            formatNumber: function(nbr, sep) {
                return nbr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
            }
        });

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
                            handler.callback(fragment);
                            // return true;
                        }
                    });
                }, this);
            };
        };

        /**
         *  bootstrap - init and configure core parts of the framework
         */
        var FW = {
            // inject all dependencies or override defaults deps here
            configure: function(deps) {
                this.deps = deps;
            },

            initialize: function(config, env) {
                // layout
                if (!this.deps['layout']) {
                    throw new Error('app must have a layout');
                }

                this.config = config;
                this.env = env;

                _.identify(this.config.states, 'id');

                // override backbone's history if needed
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
                var abstractObjectBag = {
                    get: function(id) { return this[id] || false; }
                };

                // stores - object bags
                this.services = this.plugins = _.extend({}, abstractObjectBag);
                this.commonControllers = _.extend({}, abstractObjectBag);
                this.controllers = _.extend({}, abstractObjectBag);

                // install core services
                this.initModuleLoader();

                // deps
                this.initLayout();
                this.initAssetsManager();

                // create core middlewares
                this.initRouter();
                this.initDispatcher();
            },

            //  com : maybe keeping it external to FW object is more meaningfull
            //        but probably harder to trace/debug (tbd)
            //  get a reference to the `com` object (usefull for plugins construction, should not be used elsewhere)
            com: com,

            //  INIT CORE DEPS - see FW.configure
            //  -----------------------------------------------------
            setAppController: function(ctor) {
                // if `ctor` is undefined fallback to default AppController
                // configure dispatcher to use the given AppController
            },

            // the main layout of the application
            initLayout: function() {
                var ctor = this.deps.layout;

                var instance = new ctor({
                    regions: this.config.regions
                });

                this.layout = instance;
            },

            // this function is called only if an AssetsLoader is register
            initAssetsManager: function() {
                // if no asset loader is defined - don't init assets manager
                if (!this.deps['assetLoader']) { return; }
                // install assetLoader
                this.install('core:assetLoader', this.deps['assetLoader']);
                // init assetsManager
                var assetsConfig = _.identify(this.config.assets, 'id');
                this.assetsManager = new AssetsManager(assetsConfig);

            },

            //  INIT CORE MIDDLEWARES
            //  ------------------------------------------------------------
            initRouter: function() {
                //  map `config.states` to Backbone.Router compliant routes
                var routes = {},
                    states = this.config.states;

                for (var key in states) {
                    var route = states[key].route;
                    routes[route] = key;
                }

                // launch Backbone's router
                this.router = new Router({
                    routes: routes,
                    states: this.config.states
                });
            },

            initDispatcher: function() {
                console.log(this.layout);
                // @TODO create a controller factory to not have to give
                //       all these deps to the Dispatcher
                this.dispatcher = new Dispatcher({
                    states: this.config.states,
                    paths: this.config.paths,
                    // forward plugins and services to controller
                    services : this.services,
                    layout: this.layout,
                });
            },

            //  INIT CORE SERVICES
            //  ------------------------------------------------------------
            //  core:services can be eseally overriden just by installing on the same serviceId
            //  @TODO remove
            initModuleLoader: function() {
                this.install('core:moduleLoader', ModuleAutoLoader, {
                    paths: this.config.paths
                });
            },


            //  INSTALL CONTROLLERS
            //  ------------------------------------------------------------
            //  allow to register controllers that will be called for each request
            //  usefull to manage common parts of the site (header, footer)
            registerCommonController: function(id, ctor) {
                var instance = this.dispatcher.installController(ctor);
                this.commonControllers[id] = instance;
            },

            registerCommonControllers: function(obj) {
                _.each(obj, function(ctor, id) {
                    this.registerCommonController(id, ctor);
                }, this);
            },

            // register all the app controllers
            registerController: function(id, ctor) {},
            registerControllers: function(obj) {},

            //  INSTALL PLUGINS
            //  ------------------------------------------------------------
            //  method to install plugins/services to the framework
            //
            //  @param pluginName <string> id of the plugin to get it back in controllers
            //  @param pluginCtor <object>
            //          constructor of the plugin
            //          the current instance of the framework and `com` object are passed as argument
            //
            //  @TODO (maybe)   allow switch between service and plugin installation
            install: function(pluginName, pluginCtor, options) {
                if (this.services[pluginName]) { return; }
                // add a the new plugin to collection
                this.services[pluginName] = new pluginCtor(this, options);
            },

        };

        return FW;

    }
);
