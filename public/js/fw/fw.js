define([
        'backbone',
        'underscore',
        'fw/core/router',
        'fw/core/dispatcher',
        'fw/core/assets-manager',
        'fw/components/abstract-layout',
        'fw/components/abstract-loader',
        'fw/components/pubsub',
        'fw/views/base-view'
    ], function(
        Backbone,
        _,
        Router,
        Dispatcher,
        AssetsManager,
        AbstractLayout,
        AbstractLoader,
        PubSub,
        BaseView
    ) {

        'use strict';
        /**
         *  @TODO
         *      handle multi-routing properly (add a controller stack in dispatcher)
         *      clean `com` problem
         *
         *  In a prefect world:
         *      create a dummy App with at least 3 states (home, content, popin)
         *      create a scheme of architecture
         *      write docs
         *      write a cookbook (to test api as well as a list of howTo)
         *      unit tests
         */

        /**
         *  @NOTE : having `com` separated from the framework is a mistake
         *          it should be injected on other objects as a dependency
         */

        /**
         *  NEXT STEPS
         *
         *  -   make a test plugin with [https://github.com/ftlabs/fastclick](https://github.com/ftlabs/fastclick)
         *
         *  implements the following:
         *      - create a controller factory
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
            //  usefull to add a kind of `id` key to each element of a config object
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
             *  @TODO add a third argument nbrOfDecimal (default=0)
             */
            formatNumber: function(nbr, sep) {
                return nbr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
            }
        });

        /**
         *  MULTI-ROUTING
         *  @FIXME  this breaks catch all route for 404...
         *          must be refactor or changed
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
                            return true;
                        }
                    });
                }, this);
            };
        };

        /**
         *  BOOTSTRAP - init and configure core parts of the framework
         */
        var FW = {
            com: undefined,
            // inject all dependencies or override defaults deps here
            configure: function(deps) {
                this.deps = deps;
            },

            initialize: function(config, env) {
                this.config = config;
                this.env = env;
                // internal communications PubSub
                this.com = new PubSub();

                _.identify(this.config.states, 'id');

                // override backbone's history if needed
                if (this.config.useMultiRouting) {
                    allowMultiRouting(this.config.multiRouteSeparator);
                }

                // convenience method - public API
                var abstractObjectBag = {
                    get: function(id) { return this[id] || false; }
                };

                // stores - object bags
                this.services = this.plugins = _.extend({}, abstractObjectBag);
                this.commonControllers = _.extend({}, abstractObjectBag);
                this.controllers = _.extend({}, abstractObjectBag);

                // install core services

                // optionnal deps
                this.initLayout();
                this.initLoader();
                this.initAssetsManager();

                // create core middlewares
                this.initRouter();
                this.initDispatcher();

                this.configureBaseView();

                // install `controllers` and `commonControllers` if defined in `configure`
                if (_.isObject(this.deps.commonControllers)) {
                    this.registerCommonController(this.deps.commonControllers);
                }

                if (_.isObject(this.deps.controllers)) {
                    this.registerController(this.deps.controllers);
                }
            },

            //  INIT CORE DEPS - see FW.configure
            //  -----------------------------------------------------
            configureBaseView: function(ctor) {
                BaseView.configure({
                    shared: (this.config.shared || {})
                });
            },

            // the main layout of the application
            initLayout: function() {
                var ctor = this.deps.layout || AbstractLayout;

                this.layout = new ctor({
                    regions: this.config.regions,
                    com: this.com
                });

                this.layout.render();
            },

            initLoader: function() {
                var ctor = this.deps.loader || AbstractLoader;

                this.loader = new ctor({
                    layout: this.layout,
                    com: this.com
                });
            },

            // this function is called only if an AssetsLoader is register
            initAssetsManager: function() {
                // if no asset loader is defined - don't init assets manager
                if (!this.deps['assetLoader']) { return; }
                // install assetLoader
                this.install('core:assetLoader', this.deps['assetLoader']);
                // init assetsManager
                var assetsConfig = _.identify(this.config.assets, 'id');
                this.assetsManager = new AssetsManager(assetsConfig, this.com);

            },

            //  INIT CORE MIDDLEWARES
            //  ------------------------------------------------------------
            initRouter: function() {
                //  map `config.states` to Backbone.Router compliant routes
                var routes = {},
                    states = this.config.states;

                // @FIXME - cannot work, should not hard code controller's name
                if (states.notFound) {
                    states.notFound = {
                        route: '*notFound',
                        controller: 'main-controller::notFound'
                    };
                }

                // format to backbone's compliant argument
                for (var key in states) {
                    var route = states[key].route;
                    routes[route] = key;
                }

                // launch Backbone's router
                this.router = new Router({
                    routes: routes,
                    states: this.config.states,
                    com: this.com
                });
            },

            initDispatcher: function() {
                // @TODO
                // this.controllerFactory = new ControllerFactory({ ... });
                var options = {
                    states: this.config.states,
                    // forward plugins and services to controller - move this to ControllerFactory
                    services : this.services,
                    layout: this.layout,
                    com: this.com,
                    // factory: this.controllerFactory
                    config: this.config
                };

                if (this.assetsManager) {
                    options.assetsManager = this.assetsManager;
                }

                this.dispatcher = new Dispatcher(options);
            },

            //  INSTALL CONTROLLERS
            //  ------------------------------------------------------------
            //  allow to register controllers that will be called for each request
            //  usefull to manage common parts of the site (header, footer)
            registerCommonController: function(id, ctor) {
                if (_.isObject(id)) {
                    return _.each(id, function(ctor, id) {
                        this.registerCommonController(id, ctor);
                    }, this);
                }

                var instance = this.dispatcher.installCommonController(ctor);
                // is this realy usefull ?
                this.commonControllers[id] = instance;
            },

            // register all the app controllers
            registerController: function(id, ctor) {
                if (_.isObject(id)) {
                    return _.each(id, function(ctor, id) {
                        this.dispatcher.registerController(id, ctor);
                    }, this);
                }

                this.dispatcher.registerController(ctor);
            },

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
