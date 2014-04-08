define([
        'fw/components/abstract-controller',
        'fw/components/region',
        'app/views/test-routing-view'
    ], function(AbstractController, Region, TestRoutingView) {

        'use strict';

        // dummy controller for testing
        var MainController = AbstractController.extend({
            // common
            initialize: function() {

            },

            // a default implementation should exists in AbstractController
            // the public API should be `remove` (clean stored object, etc...)
            destroy: function() {
                // com.removeHandlers(this)
                this.remove();
            },

            // each `action` method receive `state` and `params` objects as arguments
            home: function(request) {
                console.log('   =>  MainController::home', request);
            },

            routeA: function(request) {
                console.log('   =>  MainController::routeA', request);
            },

            routeB: function(request) {
                console.log('   =>  MainController::routeB', request);
            },


            actions: {
                // these methods should be called with an apply
                // to set `this` to the controller
                // if update does not exists, do nothing
                home: {
                    show: function(request, prevRequest) {
                        // load assets, create model and views,
                        // update regions, etc...
                        console.log(this, 'homeShow');
                    },
                    update: function(request, prevRequest) {
                        // load assets, update models
                        console.log(this, 'homeUpdate');
                    }
                },

                test: {
                    show: function(request, prevRequest) {
                        // load assets, create model and views,
                        // update regions, etc...
                        console.log(this, 'testShow');
                    },
                    update: function(request, prevRequest) {
                        // load assets, update models
                        console.log(this, 'testUpdate');
                    }
                },
            }

        });

        return MainController;
    }
);
