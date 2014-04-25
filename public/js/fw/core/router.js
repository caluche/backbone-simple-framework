define([
        'backbone',
        'fw/core/request',
        'fw/core/com'
    ], function(Backbone, Request, com) {

        'use strict';

        /**
         *  ROUTER
         *  -------------------------------------------
         *
         *  @TODO   should be able to create urls from a routeId and given parameters
         *          will not work with regexps in routes, that's why it's not yet in backbone,
         *          see constraints/benefits (cf. SEO, url based states, ...)
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
                (function(currentIndex) {
                    _.defer(function() {
                        var request = new Request(state, params, {
                            length: that.counter,
                            index: currentIndex
                        });

                        com.publish('router:change', request, request);

                        // reset counter at the end of routing stack
                        _.defer(function() { that.counter = 0; });
                    });
                }(this.counter));
            },

            //  @NOTE - allow access to the controllers ?
            getState: function(stateId) {
                return this.states[stateId];
            },

        });

        return Router;

    }
);
