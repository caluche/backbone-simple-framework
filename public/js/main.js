define(
    [
        'backbone', 'underscore', 'jquery', 'elipse/elipse', 'config'
    ], function(Backbone, _, $, Elipse, config) {

        'use strict';

        // ---------------------------------------
        // @OVERRIDE Backbone.History to allow multiple controler calls
        // @TODO check if `loadUrl` is the best entry point (maybe its callee)
        Backbone.History.prototype.multiRouteSeparator = '|';

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

        // ---------------------------------------



        // framework boostrapper
        var GG = {
            initialize: function() {
                // var config = require('config');
                this.router = new Router({
                    routes: this._getRoutes(config)
                });

                /* this should be a collection of smaller models */
                this.dispatcher = new Dispatcher({
                    states: config.states;
                });
            },

            // see later if it be merged with other config parsing
            _getRoutes: function(config) {
                var routes = {},
                    states = config.states;

                for (var key in states) {
                    var pattern = states[key].route;
                    routes[pattern] = key;
                }

                return routes;
            }
        }

        // define a simple router
        // @note can be tested
        //
        // -    the router use global events (GG.pubsub)
        // -    to trigger some `controller::action` through a dispatcher
        var Router = Backbone.Router.extend({
            initialize: function() {
                this.on('route', _.bind(this._publishRoute, this));
            },

            _publishRoute: function(route, args) {
                console.log('   => publish', route, args);
                GG.trigger('route:changed', route, args);
            },

        });


        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            GG.initialize();
            // start the whole stuff
            Backbone.history.start();
        });
    }
);
