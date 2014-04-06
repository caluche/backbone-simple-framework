define([
        'fw/components/abstract-controller',
        'fw/components/region',
        'app/views/test-routing-view'
    ], function(AbstractController, Region, TestRoutingView) {

        'use strict';

        // dummy controller for testing
        var MyController = AbstractController.extend({
            // common
            initialize: function() {

            },

            // a default implementation should exists in AbstractController
            destroy: function() {},

            // each `action` method receive `state` and `params` objects as arguments
            home: function(request) {
                console.log('   =>  MyController::home', request);
            },

            routeA: function(request) {
                console.log('   =>  MyController::routeA', request);
            },

            routeB: function(request) {
                console.log('   =>  MyController::routeB', request);
            },

            /*
                // these methods should be called with an apply
                // to set `this` to the controller
                // if update does not exists, do nothing
                home: {
                    action: function() {
                        // load assets, create model and views,
                        // update regions, etc...
                    },
                    update: function() {
                        // load assets, update models
                    }
                }
            */
        });

        return MyController;
    }
);
