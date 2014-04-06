define([
        'backbone',
        'fw/core/request',
        'fw/core/com'
    ], function(Backbone, Request, com) {

        'use strict';

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
            initialize: function(options) {
                this.states = options.states;

                this.on('route', _.bind(this.forwardRequest, this));
            },

            // count concurrent routes
            counter: 0,

            /**
             *  forward the request to the dispatcher
             *  @EVENT global `route:change`
             */
            forwardRequest: function(route, params) {
                var that = this;
                var state = this.getState(route);
                this.counter++;

                // this allow to know if we are currently in a multiple route configuration or not
                // @TODO    needs to be tested cross-browser, not sure it's really reliable
                //          in case of multi-request, each request should have a ref to the other
                _.defer(function() {
                    var request = new Request(state, params, that.counter);
                    com.publish('router:change', request, request);
                    // reset counter
                    _.defer(function() { that.counter = 0; });
                });
            },

            //  @NOTE - allow access to the controllers ?
            getState: function(stateId) {
                return this.states[stateId];
            },

        });

        return Router;

    }
);
